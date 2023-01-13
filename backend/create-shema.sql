USE [master]
GO

CREATE DATABASE [quickfin]
GO

CREATE LOGIN [quickfin_sso]
WITH PASSWORD = 'ENCRYPTED',
    DEFAULT_DATABASE = [quickfin]

USE [quickfin]
GO

CREATE SCHEMA [sso]
GO

CREATE USER [sso] FOR LOGIN [quickfin_sso]
  WITH DEFAULT_SCHEMA = [sso]
GO

CREATE USER [sso_agent] WITHOUT LOGIN
  WITH DEFAULT_SCHEMA = [guest]
GO

CREATE TABLE [sso].[users](
  [id] INT IDENTITY(1000,1) PRIMARY KEY,
  [email] VARCHAR(255) NOT NULL,
  [username] VARCHAR(24) NULL,
  [password] VARCHAR(),
  [name] VARCHAR(255) NOT NULL,
  [given_name] VARCHAR(255) NOT NULL,
  [family_name] VARCHAR(255) NOT NULL,
  [registered_on] DATETIME NOT NULL DEFAULT GETUTCDATE(),
  [last_authenticated_on] DATETIME NULL,
  [picture] AS ('https://www.gravatar.com/avatar/' + SUBSTRING(sys.fn_varbintohexstr(HashBytes('MD5', email)), 3, 32) + '?s=28&d=mp&r=pg'),
  [status] TINYINT NOT NULL DEFAULT 0
)

CREATE TABLE [sso].[authorizationCodes](
  [code] VARCHAR(32) PRIMARY KEY DEFAULT LOWER(REPLACE(NEWID(), '-', '')),
  [user_id] INT NOT NULL,
  [scope] VARCHAR(MAX),
  [expires] DATETIME NOT NULL DEFAULT DATEADD(ss, 60, GETUTCDATE()),
  [created] DATETIME NOT NULL DEFAULT GETUTCDATE()
)

CREATE TABLE [sso].[refreshTokens](
  [token] VARCHAR(32) PRIMARY KEY DEFAULT LOWER(REPLACE(NEWID(), '-', '')),
  [user_id] INT NOT NULL,
  [authorization_code] VARCHAR(32),
  [access_token] VARCHAR(43) NOT NULL, -- VERIFY SIGNATURE of JWT
  [expires] DATETIME NOT NULL DEFAULT GETUTCDATE() + 7,
  [created] DATETIME NOT NULL DEFAULT GETUTCDATE(),
  [created_by_ip] VARCHAR(39) NOT NULL,
  [revoked] DATETIME NULL,
  [revoked_by_ip] VARCHAR(39) NULL,
  [replaced_by_token] VARCHAR(32) NULL,
  [reason_revoked] VARCHAR(50) NULL
)

CREATE TABLE [sso].[authLogs](
  [user_id] INT NULL,
  [success] BIT DEFAULT 0, -- True if authentication was successfull
  [result] TINYINT DEFAULT 0, -- Result of the authentication attempt; 0 = failed, 1 = success, 2 = blocked, 3 = refused
  [reason] VARCHAR(100) NULL,
  [date] DATETIME NOT NULL DEFAULT GETUTCDATE(),
  [ip] VARCHAR(39) NOT NULL,
  [rating] TINYINT DEFAULT 50, -- Trust rating 0 = Not trusted, 50 = Default, 100 = trusted
  [user_agent] VARCHAR(255) NOT NULL, -- Save the browser user agent this can be usefull to determine mallicious attempts
  CONSTRAINT [PK_authLog] PRIMARY KEY ([date], [ip])
)

ALTER TABLE [sso].[authorizationCodes]
  ADD CONSTRAINT [FK_usersAuthorizationCodes] FOREIGN KEY (user_id) REFERENCES [sso].[users] (id);
GO

ALTER TABLE [sso].[refreshTokens]
  ADD CONSTRAINT [FK_usersRefreshTokens] FOREIGN KEY (user_id) REFERENCES [sso].[users] (id),
      CONSTRAINT [FK_authorizationCodesRefreshTokens] FOREIGN KEY (authorization_code) REFERENCES [sso].[authorizationCodes] (code);
GO

ALTER TABLE [sso].[authLogs]
  ADD CONSTRAINT [FK_usersAuthLog] FOREIGN KEY (user_id) REFERENCES [sso].[users] (id);
GO

CREATE PROCEDURE [sso].[usp_getUser](
  @username VARCHAR(255)
) WITH EXECUTE AS 'sso_agent'
AS BEGIN
  SELECT TOP(1)
    [id] = [id],
    [username] = [username],
    [password] = [password],
    [email] = [email],
    [active] = CAST(1 AS BIT)
  FROM [sso].[users]
  WHERE email = @username OR username = @username
END
GO

CREATE PROCEDURE [sso].[usp_getUserInfo](
  @user_id INT
) WITH EXECUTE AS 'sso_agent'
AS BEGIN
  SELECT
    [id] = [id],
    [name] = [name],
    [given_name] = [given_name],
    [family_name] = [family_name],
    [preferred_username] = [username],
    [email] = [email],
    [email_verified] = CAST(0 AS BIT),
    [picture] = [picture]
  FROM [sso].[users]
  WHERE [id] = @user_id
END
GO

CREATE PROCEDURE [sso].[usp_updateUserPassword](
  @user_id INT,
  @password VARCHAR(128)
) WITH EXECUTE AS 'sso_agent'
AS BEGIN
  UPDATE [sso].[users]
  SET [password] = @password
  WHERE [id] = @user_id
END
GO

CREATE PROCEDURE [sso].[usp_getTokenExists](
  @token VARCHAR(32)
) WITH EXECUTE AS 'sso_agent'
AS BEGIN
  SELECT [exists] = CASE WHEN EXISTS(
    SELECT token
    FROM [sso].[refreshTokens]
    WHERE [token] = @token AND [revoked] = 0
  ) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END
END
GO

CREATE PROCEDURE [sso].[usp_createAuthorizationCode](
  @user_id INT,
  @scope VARCHAR(MAX)
) WITH EXECUTE AS 'sso_agent'
AS BEGIN
  INSERT INTO [sso].[authorizationCodes] (user_id, scope)
  OUTPUT INSERTED.code
  VALUES (@user_id, @scope)
END
GO

CREATE PROCEDURE [sso].[usp_getAuthorizationCode](
  @code VARCHAR(32)
) WITH EXECUTE AS 'sso_agent'
AS BEGIN
  SELECT [user_id] = user_id,
    [scope] = scope,
    [expires] = expires
  FROM [sso].[authorizationCodes]
  WHERE code = @code
END
GO

CREATE PROCEDURE [sso].[usp_createRefreshToken](
  @user_id INT,
  @authorization_code VARCHAR(32),
  @access_token VARCHAR(43)
) WITH EXECUTE AS 'sso_agent'
AS BEGIN
  IF NOT EXISTS (SELECT [code] FROM [sso].[authorizationCodes] WHERE user_id = @user_id AND code = @authorization_code) BEGIN
    RETURN 0
  END

  INSERT INTO [sso].[refreshTokens] (user_id, authorization_code, access_token, created_by_ip)
  OUTPUT INSERTED.token
  VALUES (@user_id, @authorization_code, @access_token, '127.0.0.1')
END
GO

CREATE PROCEDURE [sso].[usp_getRefreshToken](
  @token VARCHAR(32)
) WITH EXECUTE AS 'sso_agent'
AS BEGIN
  SELECT [token] = token,
    [authorization_code] = authorization_code,
    [user_id] = user_id,
    [access_token] = [access_token]
  FROM [sso].[refreshTokens]
  WHERE token = @token
END
GO

CREATE PROCEDURE [sso].[usp_updateRefreshToken](
  @token VARCHAR(32)
) WITH EXECUTE AS 'sso_agent'
AS BEGIN
  -- Check if the token exists
  IF NOT EXISTS (SELECT [token] FROM [sso].[refreshTokens] WHERE [token] = @token) BEGIN
    RETURN 0
  END 

  -- Check if the token is revoked
  IF EXISTS (SELECT [token] FROM [sso].[refreshTokens] WHERE [token] = @token AND [revoked] < GETUTCDATE()) BEGIN
    -- Remove tokens genated after this one
    DECLARE @parent_token VARCHAR(32)
    SELECT @parent_token = [replaced_by_token]
    FROM [sso].[refreshTokens]
    WHERE [token] = @token AND [revoked] = 1

    IF @parent_token IS NOT NULL BEGIN
      EXEC [sso].[usp_revokeRefreshToken] @parent_token, 'Attempted reuse of revoked ancestor token', NULL
    END

    RETURN 0
  END

  -- Check if the token has expired
  IF EXISTS (SELECT [token] FROM [sso].[refreshTokens] WHERE [token] = @token AND [expires] < GETUTCDATE()) BEGIN
    EXEC [sso].[usp_revokeRefreshToken] @token, 'Token expired', NULL
    RETURN 0
  END

  -- Check if the token has already been used

  DECLARE @tokens TABLE (token VARCHAR(32))
  DECLARE @new_token VARCHAR(32)

  INSERT INTO [sso].[refreshTokens] (user_id, authorization_code, access_token, created_by_ip)
  OUTPUT INSERTED.token INTO @tokens
  SELECT user_id, authorization_code, access_token, '127.0.0.1'
  FROM [sso].[refreshTokens]
  WHERE [token] = @token

  SELECT TOP(1) @new_token = token FROM @tokens
  EXEC [sso].[usp_revokeRefreshToken] @token, 'Replaced by new token', @new_token
  SELECT [token] = @new_token
END
GO

CREATE PROCEDURE [sso].[usp_revokeRefreshToken](
  @token VARCHAR(32),
  @reason_revoked VARCHAR(50) NULL,
  @replaced_by_token VARCHAR(32) NULL
) WITH EXECUTE AS 'sso_agent'
AS BEGIN
  DECLARE @next_token VARCHAR(32)
  SELECT @next_token = [token] FROM [sso].[refreshTokens] WHERE [replaced_by_token] = @token

  -- Check if this token has been used already, if so revoke next token instead
  IF @next_token IS NOT NULL BEGIN
    EXEC [sso].[usp_revokeRefreshToken] @next_token, @reason_revoked, @replaced_by_token
  END
  ELSE BEGIN
    -- Revoke RefreshToken
    UPDATE [sso].[refreshTokens]
    SET [revoked] = GETUTCDATE(),
      [revoked_by_ip] = '127.0.0.1',
      [reason_revoked] = @reason_revoked,
      [replaced_by_token] = @replaced_by_token
    WHERE [token] = @token
  END
END
GO

CREATE PROCEDURE [sso].[usp_createUser](
  @email VARCHAR(100),
  @password VARCHAR(128),
  @given_name VARCHAR(100),
  @family_name VARCHAR(100)
) WITH EXECUTE AS 'sso_agent'
AS BEGIN
  INSERT INTO [sso].[users] ([email], [username], [password], [name], [given_name], [family_name], [status])
  VALUES (@email, NULL, @password, @given_name + ' ' + @family_name, @given_name, @family_name, 10)

  -- After user creation Grant permission to use GroupClaes Login
  DECLARE @user_id INT = SCOPE_IDENTITY()
END
GO

-- Create the stored procedure in the specified schema
CREATE PROCEDURE [sso].[usp_addAuthLog]
  @user_id INT = NULL,
  @success BIT = 0,
  @result TINYINT = 0,
  @reason VARCHAR(100) = NULL,
  @ip VARCHAR(39) = NULL,
  @rating TINYINT = 50,
  @user_agent VARCHAR(255) = NULL
-- add more stored procedure parameters here
WITH EXECUTE AS 'sso_agent'
AS BEGIN
  -- body of the stored procedure
  INSERT INTO [sso].[authLogs] (user_id, success, result, reason, ip, rating, user_agent)
  VALUES (@user_id, @success, @result, @reason, @ip, @rating, @user_agent)
END
GO

CREATE PROCEDURE [sso].[usp_getFailedAuthAttempts]
  @user_id INT = NULL,
  @ip VARCHAR(39) = NULL
-- add more stored procedure parameters here
WITH EXECUTE AS 'sso_agent'
AS BEGIN
  -- User attempts
  SELECT [rating] = [log].[rating]
  FROM [sso].[authLogs] [log]
  WHERE [log].[user_id] = @user_id
    AND [log].[success] = 0
    AND [log].[rating] <= 60
    AND [log].[date] > DATEADD(ss, -600, GETUTCDATE())

  -- ip attempts
  SELECT [rating] = [log].[rating]
  FROM [sso].[authLogs] [log]
  WHERE [log].[ip] = @ip
    AND [log].[success] = 0
    AND [log].[rating] <= 60
    AND [log].[date] > GETUTCDATE()-1
END
GO

-- GRANT SELECT PERMISSIONS TO sso_agent
GRANT SELECT ON [sso].[refreshTokens]([token], [user_id], [authorization_code], [access_token], [revoked]) TO [sso_agent]
GRANT SELECT ON [sso].[authorizationCodes]([code], [user_id], [scope], [expires]) TO [sso_agent]
GRANT SELECT ON [sso].[authLogs]([rating], [user_id], [result]) TO [sso_agent]
GO

-- GRANT INSERT PERMISSIONS ON ALL TABLES TO sso_agent
GRANT INSERT ON [sso].[users] TO [sso_agent]
GRANT INSERT ON [sso].[authLogs] TO [sso_agent]
GRANT INSERT ON [sso].[authorizationCodes] TO [sso_agent]
GRANT INSERT ON [sso].[refreshTokens] TO [sso_agent]
GO

-- GRANT UPDATE PERMISSIONS TO sso_agent
GRANT UPDATE ON [sso].[refreshTokens]([revoked], [revoked_by_ip], [replaced_by_token], [reason_revoked]) TO [sso_agent]
GRANT UPDATE ON [sso].[users]([password], [name], [given_name], [family_name]) TO [sso_agent]
GO

-- GRANT EXEC PERMISSIONS TO sso_agent
GRANT EXEC ON [sso].[usp_revokeRefreshToken] TO [sso_agent]
GO

-- GRANT EXEC PERMISSIONS ON TO sso
GRANT EXEC ON [sso].[usp_getUser] TO [sso]
GRANT EXEC ON [sso].[usp_getUserInfo] TO [sso]
GRANT EXEC ON [sso].[usp_updateUserPassword] TO [sso]
GRANT EXEC ON [sso].[usp_getTokenExists] TO [sso]
GRANT EXEC ON [sso].[usp_createAuthorizationCode] TO [sso]
GRANT EXEC ON [sso].[usp_getAuthorizationCode] TO [sso]
GRANT EXEC ON [sso].[usp_createUser] TO [sso]
GRANT EXEC ON [sso].[usp_getFailedAuthAttempts] TO [sso]
GRANT EXEC ON [sso].[usp_addAuthLog] TO [sso]
GRANT EXEC ON [sso].[usp_updateRefreshToken] TO [sso]
GRANT EXEC ON [sso].[usp_createRefreshToken] TO [sso]
GRANT EXEC ON [sso].[usp_getRefreshToken] TO [sso]
GO

CREATE SCHEMA [networth]
GO

CREATE USER [networth_agent] WITHOUT LOGIN
  WITH DEFAULT_SCHEMA = [guest]
GO

CREATE TABLE [networth].[assets](
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [user_id] INT NOT NULL,
  [group_id] INT NOT NULL,
  [name] VARCHAR(40) NOT NULL,
  [value] MONEY NOT NULL DEFAULT 0.00,
  -- [previous_value] MONEY NULL, -- previous value?, informative field
  [created] DATETIME NOT NULL DEFAULT GETUTCDATE(),
  [modified] DATETIME NULL
)

CREATE TABLE [networth].[liabilities](
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [user_id] INT NOT NULL,
  [group_id] INT NOT NULL,
  [name] VARCHAR(40) NOT NULL,
  [value] MONEY NOT NULL DEFAULT 0.00,
  -- [previous_value] MONEY NULL, -- previous value?, informative field
  [created] DATETIME NOT NULL DEFAULT GETUTCDATE(),
  [modified] DATETIME NULL
)

CREATE TABLE [networth].[assetGroups](
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [name] VARCHAR(40) NOT NULL
)

CREATE TABLE [networth].[liabilityGroups](
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [name] VARCHAR(40) NOT NULL
)

ALTER TABLE [networth].[assets]
  ADD CONSTRAINT [FK_usersAssets] FOREIGN KEY (user_id) REFERENCES [sso].[users] (id),
      CONSTRAINT [FK_assetGroupsAssets] FOREIGN KEY (group_id) REFERENCES [sso].[assetGroups] (id);
GO

ALTER TABLE [networth].[liabilities]
  ADD CONSTRAINT [FK_usersLiabilities] FOREIGN KEY (user_id) REFERENCES [sso].[users] (id),
      CONSTRAINT [FK_liabilityGroupsLiabilities] FOREIGN KEY (group_id) REFERENCES [sso].[liabilityGroups] (id);
GO

INSERT INTO [networth].[assetGroups] ([name])
VALUES ('Grote/vaste bezittingen'), ('Liquide middelen'), ('Persoonlijke voorwerpen') -- change to english labels in future, translate in frontend

INSERT INTO [networth].[liabilityGroups] ([name])
VALUES ('Langlopende schulden'), ('Kortlopende schulden') -- change to english labels in future, translate in frontend

-- DBCC CHECKIDENT ('[networth].[assetGroups]')
-- DBCC CHECKIDENT ('[networth].[liabilityGroups]')

CREATE PROCEDURE [networth].[usp_getOverview]
  @user_id INT
WITH EXECUTE AS 'networth_agent'
AS BEGIN
  SELECT
    [assets] = (
      SELECT
        [name] = MIN([group].[name]),
        [value] = SUM([asset].[value])
      FROM [networth].[assets] [asset]
      INNER JOIN [networth].[assetGroups] [group] ON [group].[id] = [asset].[group_id]
      WHERE [asset].[user_id] = @user_id
      GROUP BY [asset].[group_id]
      FOR JSON PATH, INCLUDE_NULL_VALUES
    ),
    [liabilities] = (
      SELECT
        [name] = MIN([group].[name]),
        [value] = SUM([liability].[value])
      FROM [networth].[liabilities] [liability]
      INNER JOIN [networth].[liabilityGroups] [group] ON [group].[id] = [liability].[group_id]
      WHERE [liability].[user_id] = @user_id
      GROUP BY [liability].[group_id]
      FOR JSON PATH, INCLUDE_NULL_VALUES
    )
  FOR JSON PATH
END
GO

CREATE PROCEDURE [networth].[usp_getAssets]
  @user_id INT
WITH EXECUTE AS 'networth_agent'
AS BEGIN
  SELECT
    [groups] = (
      SELECT
        [id] = [group].[id],
        [name] = [group].[name],
        [assets] = (
          SELECT
            [id] = [asset].[id],
            [name] = [asset].[name],
            [value] = [asset].[value]
          FROM [networth].[assets] [asset]
          WHERE [asset].[user_id] = @user_id AND [group].[id] = [asset].[group_id]
          FOR JSON PATH, INCLUDE_NULL_VALUES
        )
      FROM [networth].[assetGroups] [group]
      FOR JSON PATH, INCLUDE_NULL_VALUES
    )
  FOR JSON PATH
END
GO

CREATE PROCEDURE [networth].[usp_getLiabilities]
  @user_id INT
WITH EXECUTE AS 'networth_agent'
AS BEGIN
  SELECT
    [groups] = (
      SELECT
        [id] = [group].[id],
        [name] = [group].[name],
        [liabilities] = (
          SELECT
            [id] = [liability].[id],
            [name] = [liability].[name],
            [value] = [liability].[value]
          FROM [networth].[liabilities] [liability]
          WHERE [liability].[user_id] = @user_id AND [group].[id] = [liability].[group_id]
          FOR JSON PATH, INCLUDE_NULL_VALUES
        )
      FROM [networth].[liabilityGroups] [group]
      FOR JSON PATH, INCLUDE_NULL_VALUES
    )
  FOR JSON PATH
END
GO

GRANT EXEC ON [networth].[usp_getOverview] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [networth].[usp_getAssets] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [networth].[usp_getLiabilities] TO [sso] -- TEMPORARY ACTION