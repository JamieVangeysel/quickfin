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

CREATE TABLE [networth].[snapshots](
  [user_id] INT NOT NULL,
  [value] MONEY NOT NULL,
  [date] DATETIME NOT NULL DEFAULT DATEADD(dd, DATEDIFF(dd, 0, GETDATE()) - 1, 0),
  PRIMARY KEY ([user_id], [date])
)

ALTER TABLE [networth].[assets]
  ADD CONSTRAINT [FK_usersAssets] FOREIGN KEY (user_id) REFERENCES [sso].[users] (id),
      CONSTRAINT [FK_assetGroupsAssets] FOREIGN KEY (group_id) REFERENCES [sso].[assetGroups] (id);
GO

ALTER TABLE [networth].[liabilities]
  ADD CONSTRAINT [FK_usersLiabilities] FOREIGN KEY (user_id) REFERENCES [sso].[users] (id),
      CONSTRAINT [FK_liabilityGroupsLiabilities] FOREIGN KEY (group_id) REFERENCES [sso].[liabilityGroups] (id);
GO

ALTER TABLE [networth].[snapshots]
  ADD CONSTRAINT [FK_usersSnapshots] FOREIGN KEY (user_id) REFERENCES [sso].[users] (id);
GO

INSERT INTO [networth].[assetGroups] ([name])
VALUES ('Grote/vaste bezittingen'), ('Liquide middelen'), ('Persoonlijke voorwerpen') -- change to english labels in future, translate in frontend

INSERT INTO [networth].[liabilityGroups] ([name])
VALUES ('Langlopende schulden'), ('Kortlopende schulden') -- change to english labels in future, translate in frontend

-- DBCC CHECKIDENT ('[networth].[assetGroups]')
-- DBCC CHECKIDENT ('[networth].[liabilityGroups]')

CREATE PROCEDURE [networth].[usp_get]
  @user_id INT
WITH EXECUTE AS 'networth_agent'
AS BEGIN
  SELECT [value] = (
    (
      SELECT SUM([value])
      FROM [networth].[assets] [asset]
      WHERE [asset].[user_id] = [user].[id]
    ) - (
      SELECT SUM([value])
      FROM [networth].[liabilities] [liability]
      WHERE [liability].[user_id] = [user].[id]
    )
  )
  FROM [sso].[users] [user]
  WHERE [user].[id] = @user_id
  FOR JSON PATH
END
GO

CREATE PROCEDURE [networth].[usp_getOverview]
  @user_id INT
WITH EXECUTE AS 'networth_agent'
AS BEGIN
  SELECT
    [assets] = (
      SELECT
        [name] = [asset].[name],
        [category] = [group].[name],
        [value] = [asset].[value]
      FROM [networth].[assets] [asset]
      INNER JOIN [networth].[assetGroups] [group] ON [group].[id] = [asset].[group_id]
      WHERE [asset].[user_id] = @user_id
      ORDER BY [asset].[value] DESC
      -- GROUP BY [asset].[group_id]
      FOR JSON PATH, INCLUDE_NULL_VALUES
    ),
    [liabilities] = (
      SELECT
        [name] = [liability].[name],
        [category] = [group].[name],
        [value] = [liability].[value]
      FROM [networth].[liabilities] [liability]
      INNER JOIN [networth].[liabilityGroups] [group] ON [group].[id] = [liability].[group_id]
      WHERE [liability].[user_id] = @user_id
      ORDER BY [liability].[value] DESC
      -- GROUP BY [liability].[group_id]
      FOR JSON PATH, INCLUDE_NULL_VALUES
    ),
    [history] = (
      SELECT [date] = cast([date] as DATE), [value] = [value]
      FROM [networth].[snapshots]
      WHERE cast([date] as DATE) > cast((getdate()-14) as date) AND [user_id] = @user_id
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

GRANT EXEC ON [networth].[usp_get] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [networth].[usp_getOverview] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [networth].[usp_getAssets] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [networth].[usp_getLiabilities] TO [sso] -- TEMPORARY ACTION

CREATE PROCEDURE [networth].[usp_insertAsset]
  @user_id INT,
  @group_id INT,
  @name VARCHAR(40),
  @value MONEY
WITH EXECUTE AS 'networth_agent'
AS BEGIN
  INSERT INTO [networth].[assets] ([user_id], [group_id], [name], [value])
  VALUES (@user_id, @group_id, @name, @value)

  SELECT [id] = SCOPE_IDENTITY()
END
GO

CREATE PROCEDURE [networth].[usp_updateAsset]
  @user_id INT,
  @id INT,
  @group_id INT,
  @name VARCHAR(40),
  @value MONEY
WITH EXECUTE AS 'networth_agent'
AS BEGIN
  UPDATE [networth].[assets]
  SET [group_id] = @group_id,
    [name] = @name,
    [value] = @value,
    [modified] = GETUTCDATE()
  WHERE [id] = @id
    AND [user_id] = @user_id
END
GO

CREATE PROCEDURE [networth].[usp_deleteAsset]
  @user_id INT,
  @id INT
WITH EXECUTE AS 'networth_agent'
AS BEGIN
  DELETE FROM [networth].[assets]
  WHERE [id] = @id
    AND [user_id] = @user_id
END
GO

CREATE PROCEDURE [networth].[usp_insertLiability]
  @user_id INT,
  @group_id INT,
  @name VARCHAR(40),
  @value MONEY
WITH EXECUTE AS 'networth_agent'
AS BEGIN
  INSERT INTO [networth].[liabilities] ([user_id], [group_id], [name], [value])
  VALUES (@user_id, @group_id, @name, @value)

  SELECT [id] = SCOPE_IDENTITY()
END
GO

CREATE PROCEDURE [networth].[usp_updateLiability]
  @user_id INT,
  @id INT,
  @group_id INT,
  @name VARCHAR(40),
  @value MONEY
WITH EXECUTE AS 'networth_agent'
AS BEGIN
  UPDATE [networth].[liabilities]
  SET [group_id] = @group_id,
    [name] = @name,
    [value] = @value,
    [modified] = GETUTCDATE()
  WHERE [id] = @id
    AND [user_id] = @user_id
END
GO

CREATE PROCEDURE [networth].[usp_deleteLiability]
  @user_id INT,
  @id INT
WITH EXECUTE AS 'networth_agent'
AS BEGIN
  DELETE FROM [networth].[liabilities]
  WHERE [id] = @id
    AND [user_id] = @user_id
END
GO

CREATE PROCEDURE [networth].[usp_createSnapshots]
WITH EXECUTE AS 'networth_agent'
AS BEGIN
  INSERT INTO [networth].[snapshots] ([user_id], [value])
  SELECT [user_id] = [user].[id], [value] = (
    (
      SELECT SUM([value])
      FROM [networth].[assets] [asset]
      WHERE [asset].[user_id] = [user].[id]
    ) - (
      SELECT SUM([value])
      FROM [networth].[liabilities] [liability]
      WHERE [liability].[user_id] = [user].[id]
    )
  )
  FROM [sso].[users] [user]
  WHERE EXISTS (
    SELECT *
    FROM [networth].[assets] [asset]
    WHERE [asset].[user_id] = [user].[id]
  ) AND EXISTS (
    SELECT *
    FROM [networth].[liabilities] [liability]
    WHERE [liability].[user_id] = [user].[id]
  )
END
GO

GRANT EXEC ON [networth].[usp_insertAsset] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [networth].[usp_updateAsset] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [networth].[usp_deleteAsset] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [networth].[usp_insertLiability] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [networth].[usp_updateLiability] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [networth].[usp_deleteLiability] TO [sso] -- TEMPORARY ACTION

--
CREATE SCHEMA [budget]
GO

CREATE USER [budget_agent] WITHOUT LOGIN
  WITH DEFAULT_SCHEMA = [guest]
GO

CREATE TABLE [budget].[incomes](
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [year] SMALLINT NOT NULL DEFAULT YEAR(GETUTCDATE()),
  [user_id] INT NOT NULL,
  [name] VARCHAR(40) NOT NULL,
  [value] MONEY NOT NULL DEFAULT 0.00,
  -- [previous_value] MONEY NULL, -- previous value?, informative field
  [created] DATETIME NOT NULL DEFAULT GETUTCDATE(),
  [modified] DATETIME NULL
)
GO

CREATE TABLE [budget].[expenses](
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [year] SMALLINT NOT NULL DEFAULT YEAR(GETUTCDATE()),
  [user_id] INT NOT NULL,
  [name] VARCHAR(40) NOT NULL,
  [value] MONEY NOT NULL DEFAULT 0.00,
  -- [previous_value] MONEY NULL, -- previous value?, informative field
  [created] DATETIME NOT NULL DEFAULT GETUTCDATE(),
  [modified] DATETIME NULL
)
GO

ALTER TABLE [budget].[incomes]
  ADD CONSTRAINT [FK_usersIncomes] FOREIGN KEY (user_id) REFERENCES [sso].[users] (id);
GO

ALTER TABLE [budget].[expenses]
  ADD CONSTRAINT [FK_usersExpenses] FOREIGN KEY (user_id) REFERENCES [sso].[users] (id);
GO

ALTER PROCEDURE [budget].[usp_getOverview]
  @user_id INT,
  @year SMALLINT = NULL
WITH EXECUTE AS 'budget_agent'
AS BEGIN
  IF @year IS NULL SET @year = YEAR(GETUTCDATE())
  DECLARE @years TABLE (
    [year] SMALLINT
  )

  INSERT INTO @years ([year]) VALUES (@year)

  INSERT INTO @years ([year])
  SELECT DISTINCT [income].[year]
  FROM [budget].[incomes] [income]
  WHERE [income].[user_id] = @user_id

  INSERT INTO @years ([year])
  SELECT DISTINCT [expense].[year]
  FROM [budget].[expenses] [expense]
  WHERE [expense].[user_id] = @user_id

  DECLARE @totalIncomes MONEY = 0.00
  DECLARE @totalExpenses MONEY = 0.00
  DECLARE @balance MONEY = 0.00
  DECLARE @investedAssets MONEY = 0.00
  DECLARE @investment MONEY = 0.00

  -- Get total Incomes value
  SET @totalIncomes = (SELECT SUM([value]) FROM [budget].[incomes] [income] WHERE [income].[user_id] = @user_id AND [income].[year] = @year)
  -- Get total Expenses value
  SET @totalExpenses = (SELECT SUM([value]) FROM [budget].[expenses] [expense] WHERE [expense].[user_id] = @user_id AND [expense].[year] = @year)

  SET @balance = @totalIncomes - @totalExpenses
  DECLARE @months TINYINT = 120

  IF (@balance >= 50 AND @balance < 100) BEGIN
    -- if balance is over 50 euro we can do a growing budget calculation we will guestimate a .5% growth each month.
    -- power of compounding interests over each year 1.5%

    WHILE @months > 0
    BEGIN
      -- @investedAssets = previousValue + add balance + add interest on previous value + balance
      SET @investedAssets = @investedAssets + @balance + ((@investedAssets + @balance) * .005)
      -- @investment is the sum of all investments
      SET @investment = @investment + @balance

      SET @months = @months - 1
    END

    SET @investedAssets = @investedAssets + (@investedAssets * .015)
  END
  ELSE IF (@balance >= 100 AND @balance < 1000) BEGIN
    -- if balance is over 100 euro we can do a growing budget calculation we will guestimate a 1.5% growth each month.
    -- power of compounding interests over each year 3%

    WHILE @months > 0
    BEGIN
      -- @investedAssets = previousValue + add balance + add interest on previous value + balance
      SET @investedAssets = @investedAssets + @balance + ((@investedAssets + @balance) * .015)
      -- @investment is the sum of all investments
      SET @investment = @investment + @balance

      SET @months = @months - 1
    END

    SET @investedAssets = @investedAssets + (@investedAssets * .03)
  END
  ELSE IF (@balance >= 1000) BEGIN
    -- if balance is over 1000 euro we can do a growing budget calculation we will guestimate a 2% growth each month.
    -- power of compounding interests over each year 4%

    WHILE @months > 0
    BEGIN
      -- @investedAssets = previousValue + add balance + add interest on previous value + balance
      SET @investedAssets = @investedAssets + @balance + ((@investedAssets + @balance) * .02)
      -- @investment is the sum of all investments
      SET @investment = @investment + @balance

      SET @months = @months - 1
    END

    SET @investedAssets = @investedAssets + (@investedAssets * .04)
  END

  -- Return on investment per 10 months

  SELECT
    [years] = (
      SELECT DISTINCT
        [year]
      FROM @years
      ORDER BY [year] ASC
      FOR JSON PATH
    ),
    [incomes] = (
      SELECT
        [id] = [income].[id],
        [name] = [income].[name],
        [value] = [income].[value],
        [year] = [income].[year]
      FROM [budget].[incomes] [income]
      WHERE [income].[user_id] = @user_id
        AND [year] = @year
      FOR JSON PATH
    ),
    [expenses] = (
      SELECT
        [id] = [expense].[id],
        [name] = [expense].[name],
        [value] = [expense].[value],
        [year] = [expense].[year]
      FROM [budget].[expenses] [expense]
      WHERE [expense].[user_id] = @user_id
        AND [year] = @year
      FOR JSON PATH
    ),
    [estimated_asset_growth] = (
      SELECT *
      FROM [budget].[udf_estimateAssetGrowth](0, @balance, 4, 120)
      FOR JSON PATH
    ),
    [total_incomes] = @totalIncomes,
    [total_expenses] = @totalExpenses,
    [balance] = @balance
  FOR JSON PATH, INCLUDE_NULL_VALUES
END
GO

ALTER FUNCTION [budget].[udf_estimateAssetGrowth](
  @starting_capital MONEY = 0.00, -- starting capital
  @period_investment MONEY = 0.00, -- periodic investment amount
  @period_interval TINYINT = 1, -- periodic investment interval, in months
  @term SMALLINT = 12 -- term of how log to invest, in months
) RETURNS @asset_growth TABLE (
  total_assets_value MONEY,
  total_assets_invested_value MONEY,
  total_return_on_assets MONEY,
  total_return_on_assets_percent DECIMAL,
  total_return_on_investment MONEY,
  total_return_on_investment_percent DECIMAL
)
AS BEGIN
  DECLARE @intrest_rates TABLE (
    min_value MONEY, -- minimum asset value required
    max_value MONEY, -- maximum asset value
    rate DECIMAL, -- rate precentage
    rate_interval TINYINT -- rate interval (quarterly or yearly)
  )
  DECLARE @total_assets_value MONEY = 0.00
  DECLARE @total_assets_invested_value MONEY = 0.00
  DECLARE @total_return_on_assets MONEY = 0.00
  DECLARE @total_return_on_assets_percent DECIMAL = 0.00
  DECLARE @total_return_on_investment MONEY = 0.00
  DECLARE @total_return_on_investment_percent DECIMAL = 0.00

  -- RATE 1
  INSERT INTO @intrest_rates (min_value, max_value, rate, rate_interval)
  VALUES (0, 75000, .005, 4)
  INSERT INTO @intrest_rates (min_value, max_value, rate, rate_interval)
  VALUES (0, 75000, .01, 12)
  -- RATE 2
  INSERT INTO @intrest_rates (min_value, max_value, rate, rate_interval)
  VALUES (75000, 200000, .005, 4)
  INSERT INTO @intrest_rates (min_value, max_value, rate, rate_interval)
  VALUES (75000, 200000, .02, 12)
  -- RATE 3
  INSERT INTO @intrest_rates (min_value, max_value, rate, rate_interval)
  VALUES (200000, 922337203685477.58, .01, 4)
  INSERT INTO @intrest_rates (min_value, max_value, rate, rate_interval)
  VALUES (200000, 922337203685477.58, .03, 12)

  SET @total_assets_value = @starting_capital

  DECLARE @rate DECIMAL
  DECLARE @ci INT = 1
  -- Loop over months
  WHILE @ci <= @term
  BEGIN
    SET @rate = 0.00
    DECLARE @intrest MONEY = 0.00

    -- get applicable intrest rates (max 2)
    SELECT TOP(1) @rate = MIN(rate)
    FROM @intrest_rates
    WHERE @total_assets_value > min_value
      AND @total_assets_value <= max_value
      AND @ci > rate_interval
      AND @ci % rate_interval = 0
    GROUP BY rate

    IF (@rate > 0) BEGIN
      SET @intrest = @total_assets_value * @rate
    END

    IF (
      (SELECT COUNT(*)
      FROM @intrest_rates
      WHERE @total_assets_value > min_value
        AND @total_assets_value <= max_value
        AND @ci > rate_interval
        AND @ci % rate_interval = 0
      GROUP BY rate
      ) > 1
    ) BEGIN
      SELECT TOP(1) @rate = MAX(rate)
      FROM @intrest_rates
      WHERE @total_assets_value > min_value
        AND @total_assets_value <= max_value
        AND @ci > rate_interval
        AND @ci % rate_interval = 0
      GROUP BY rate
      SET @intrest = @intrest + (@total_assets_value * @rate)
    END

    SET @total_assets_value = @total_assets_value + @intrest

    IF (@ci % @period_interval = 0) BEGIN
      SET @total_assets_value = @total_assets_value + @period_investment
      SET @total_assets_invested_value = @total_assets_invested_value + @period_investment
    END

    SET @ci = @ci + 1
  END

  SET @total_return_on_assets = @total_assets_value - @starting_capital
  SET @total_return_on_investment = @total_assets_value - @starting_capital - @total_assets_invested_value

  SET @total_return_on_assets_percent = @total_return_on_assets / @total_assets_value
  SET @total_return_on_investment_percent = @total_return_on_investment / @total_assets_value

  INSERT INTO @asset_growth (
    total_assets_value,
    total_assets_invested_value,
    total_return_on_assets,
    total_return_on_assets_percent,
    total_return_on_investment,
    total_return_on_investment_percent
  ) VALUES (
    @total_assets_value,
    @total_assets_invested_value,
    @total_return_on_assets,
    @total_return_on_assets_percent,
    @total_return_on_investment,
    @total_return_on_investment_percent
  )

  RETURN
END

CREATE PROCEDURE [budget].[usp_insertIncome]
  @user_id INT,
  @year SMALLINT,
  @name VARCHAR(40),
  @value MONEY
WITH EXECUTE AS 'budget_agent'
AS BEGIN
  INSERT INTO [budget].[incomes] ([user_id], [year], [name], [value])
  VALUES (@user_id, @year, @name, @value)

  SELECT [id] = SCOPE_IDENTITY()
END
GO

CREATE PROCEDURE [budget].[usp_updateIncome]
  @user_id INT,
  @id INT,
  @year SMALLINT,
  @name VARCHAR(40),
  @value MONEY
WITH EXECUTE AS 'budget_agent'
AS BEGIN
  UPDATE [budget].[incomes]
  SET [year] = @year,
    [name] = @name,
    [value] = @value,
    [modified] = GETUTCDATE()
  WHERE [id] = @id
    AND [user_id] = @user_id
END
GO

CREATE PROCEDURE [budget].[usp_deleteIncome]
  @user_id INT,
  @id INT
WITH EXECUTE AS 'budget_agent'
AS BEGIN
  DELETE FROM [budget].[incomes]
  WHERE [id] = @id
    AND [user_id] = @user_id
END
GO

CREATE PROCEDURE [budget].[usp_insertExpense]
  @user_id INT,
  @year SMALLINT,
  @name VARCHAR(40),
  @value MONEY
WITH EXECUTE AS 'budget_agent'
AS BEGIN
  INSERT INTO [budget].[expenses] ([user_id], [year], [name], [value])
  VALUES (@user_id, @year, @name, @value)

  SELECT [id] = SCOPE_IDENTITY()
END
GO

CREATE PROCEDURE [budget].[usp_updateExpense]
  @user_id INT,
  @id INT,
  @year SMALLINT,
  @name VARCHAR(40),
  @value MONEY
WITH EXECUTE AS 'budget_agent'
AS BEGIN
  UPDATE [budget].[expenses]
  SET [year] = @year,
    [name] = @name,
    [value] = @value,
    [modified] = GETUTCDATE()
  WHERE [id] = @id
    AND [user_id] = @user_id
END
GO

CREATE PROCEDURE [budget].[usp_deleteExpense]
  @user_id INT,
  @id INT
WITH EXECUTE AS 'budget_agent'
AS BEGIN
  DELETE FROM [budget].[expenses]
  WHERE [id] = @id
    AND [user_id] = @user_id
END
GO

GRANT EXEC ON [budget].[usp_getOverview]   TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [budget].[usp_insertIncome]  TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [budget].[usp_updateIncome]  TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [budget].[usp_deleteIncome]  TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [budget].[usp_insertExpense] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [budget].[usp_updateExpense] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [budget].[usp_deleteExpense] TO [sso] -- TEMPORARY ACTION

CREATE SCHEMA [journal]
GO

CREATE USER [journal_agent] WITHOUT LOGIN
  WITH DEFAULT_SCHEMA = [guest]
GO

CREATE TABLE [journal].[entries](
  [id] INT PRIMARY KEY IDENTITY(1, 1),
  [user_id] INT NOT NULL,
  [date] DATETIME NOT NULL,
  [name] VARCHAR(40) NOT NULL,
  [category] VARCHAR(40) NOT NULL,
  [amount] MONEY NOT NULL DEFAULT 0.00,
  [direction] BIT NOT NULL DEFAULT 0, -- 1 for debit, 0 for credit
  [note] VARCHAR(200) NULL, -- add descriptive note to entry
  [documentBytes] VARBINARY(MAX) NULL, -- document bytes (add image of recept or incoice)
  [documentMimeType] VARCHAR(40) NULL, -- document mimetype (image/png, application/pdf)
  [created] DATETIME NOT NULL DEFAULT GETUTCDATE(),
  [modified] DATETIME NULL
)
GO

CREATE TABLE [journal].[entryDetails](
  [entry_id] INT NOT NULL,
  [line] TINYINT NOT NULL,
  [name] VARCHAR(40) NOT NULL,
  [amount] MONEY NOT NULL DEFAULT 0.00,
  [created] DATETIME NOT NULL DEFAULT GETUTCDATE(),
  [modified] DATETIME NULL,
  PRIMARY KEY ([entry_id], [line])
)
GO

ALTER TABLE [journal].[entries]
  ADD CONSTRAINT [FK_usersEntries] FOREIGN KEY (user_id) REFERENCES [sso].[users] (id);
GO

ALTER TABLE [journal].[entryDetails]
  ADD CONSTRAINT [FK_entriesEntryDetails] FOREIGN KEY (entry_id) REFERENCES [journal].[entries] (id);
GO

CREATE PROCEDURE [journal].[usp_getEntries]
  @user_id INT,
  @direction BIT = NULL
WITH EXECUTE AS 'journal_agent'
AS BEGIN
  SELECT [id],
    [date],
    [name],
    [category],
    [amount],
    [direction],
    [note]
  FROM [journal].[entries]
  WHERE [User_id] = @user_id AND (
    @direction IS NULL OR
    direction = @direction
  )
  ORDER BY [date] DESC
END
GO

CREATE PROCEDURE [journal].[usp_insertEntry]
  @user_id INT,
  @date DATETIME,
  @name VARCHAR(40),
  @category VARCHAR(40),
  @amount MONEY,
  @note VARCHAR(200) = NULL
WITH EXECUTE AS 'journal_agent'
AS BEGIN
  INSERT INTO [journal].[entries] ([user_id], [date], [name], [category], [amount], [direction], [note])
  VALUES (@user_id, @date, @name, @category, @amount, CASE WHEN @amount >= 0 THEN 1 ELSE 0 END, @note)

  SELECT [id] = SCOPE_IDENTITY()
END
GO

CREATE PROCEDURE [journal].[usp_updateEntry]
  @user_id INT,
  @id INT,
  @date DATETIME,
  @name VARCHAR(40),
  @category VARCHAR(40),
  @amount MONEY,
  @note VARCHAR(200) = NULL
WITH EXECUTE AS 'journal_agent'
AS BEGIN
  UPDATE [journal].[entries]
  SET [date] = @date,
    [name] = @name,
    [category] = @category,
    [amount] = @amount,
    [direction] = CASE WHEN @amount >= 0 THEN 1 ELSE 0 END,
    [note] = @note
    [modified] = GETUTCDATE()
  WHERE [id] = @id
    AND [user_id] = @user_id
END
GO

CREATE PROCEDURE [journal].[usp_deleteEntry]
  @user_id INT,
  @id INT
WITH EXECUTE AS 'journal_agent'
AS BEGIN
  DELETE FROM [journal].[entries]
  WHERE [id] = @id
    AND [user_id] = @user_id
END
GO

GRANT EXEC ON [journal].[usp_getEntries]  TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [journal].[usp_insertEntry] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [journal].[usp_updateEntry] TO [sso] -- TEMPORARY ACTION
GRANT EXEC ON [journal].[usp_deleteEntry] TO [sso] -- TEMPORARY ACTION

-- Create sql server agent job
USE msdb;
GO
EXEC dbo.sp_add_job
  @job_name = N'DailyQuickfinSnapshot';
GO
EXEC sp_add_jobstep
  @job_name = N'DailyQuickfinSnapshot',
  @step_name = N'Create networth snaphot for all users',
  @subsystem = N'TSQL',
  @command = N'EXEC [quickfin].[networth].[usp_createSnapshots]',
  @retry_attempts = 5,
  @retry_interval = 5 ;
GO
EXEC dbo.sp_add_schedule
  @schedule_name = N'NightlyJobs',
  @freq_type = 4,
  @freq_interval = 1,
  @active_start_time = 010000;
USE msdb ;
GO
EXEC sp_attach_schedule
  @job_name = N'DailyQuickfinSnapshot',
  @schedule_name = N'NightlyJobs';
GO
EXEC dbo.sp_add_jobserver
   @job_name = N'DailyQuickfinSnapshot',
GO

CREATE SCHEMA [analytics]
GO

CREATE USER [analytics_agent] WITHOUT LOGIN
  WITH DEFAULT_SCHEMA = [guest]
GO

ALTER PROCEDURE [analytics].[usp_getAnalytics]
  @user_id INT
WITH EXECUTE AS 'analytics_agent'
AS BEGIN
  -- Get net worth records for running year
  SELECT [date] = cast([date] as DATE), [value] = [value]
  FROM [networth].[snapshots]
  WHERE cast([date] as DATE) > cast((getdate()-365) as date) AND [user_id] = @user_id

  -- Get net worth records for previous running year
  SELECT [date] = cast([date] as DATE), [value] = [value]
  FROM [networth].[snapshots]
  WHERE (cast([date] as DATE) < cast((getdate()-365) as date) AND cast([date] as DATE) > cast((getdate()-730) as date)) AND [user_id] = @user_id

  -- monthly income vs budget (last 6 months) (group by month)
  DECLARE @budget_income MONEY
  SELECT @budget_income = SUM([income].[value])
  FROM [budget].[incomes] [income]
  WHERE [income].[year] = YEAR(GETUTCDATE()) AND [income].[user_id] = @user_id

  SELECT [value] = SUM([entry].[amount]),
    [budget] = @budget_income,
    [date] = DATEADD(DAY, 1, EOMONTH([entry].[date], -1))
  FROM [journal].[entries] [entry]
  WHERE [entry].[user_id] = @user_id
    AND [entry].[direction] = 1
    AND [entry].[date] > cast((getdate()-182.5) as date)
  GROUP BY DATEADD(DAY, 1, EOMONTH([entry].[date], -1))

  -- monthly expense vs budget (last 6 months) (group by month)
  DECLARE @budget_expense MONEY
  SELECT @budget_expense = SUM([expense].[value])
  FROM [budget].[expenses] [expense]
  WHERE [expense].[year] = YEAR(GETUTCDATE()) AND [expense].[user_id] = @user_id

  SELECT [value] = ABS(SUM([entry].[amount])),
    [budget] = @budget_expense,
    [date] = DATEADD(DAY, 1, EOMONTH([entry].[date], -1))
  FROM [journal].[entries] [entry]
  WHERE [entry].[user_id] = @user_id
    AND [entry].[direction] = 0
    AND [entry].[date] > cast((getdate()-182.5) as date)
  GROUP BY DATEADD(DAY, 1, EOMONTH([entry].[date], -1))

  -- budget balance vs actual net worth growth / decline
  select [value] = 1,
    [date] = GETUTCDATE()

  -- get expenses value/% per category feb, jan
  -- get incomes  value/% per category feb, jan
  DECLARE @expensesValueNow  MONEY = 0.00
  DECLARE @expensesValuePrev MONEY = 0.00
  DECLARE @incomesValueNow   MONEY = 0.00
  DECLARE @incomesValuePrev  MONEY = 0.00

  SELECT @expensesValueNow = ABS(SUM([entry].[amount]))
  FROM [journal].[entries] [entry]
  WHERE [entry].[user_id] = @user_id
    AND [entry].[direction] = 0
    AND DATEADD(DAY, 1, EOMONTH([entry].[date], -1)) = DATEADD(MONTH, 0, DATEADD(DAY, 1, EOMONTH(GETUTCDATE(), -1)))

  SELECT @expensesValuePrev = ABS(SUM([entry].[amount]))
  FROM [journal].[entries] [entry]
  WHERE [entry].[user_id] = @user_id
    AND [entry].[direction] = 0
    AND DATEADD(DAY, 1, EOMONTH([entry].[date], -1)) = DATEADD(MONTH, -1, DATEADD(DAY, 1, EOMONTH(GETUTCDATE(), -1)))

  SELECT @incomesValueNow = ABS(SUM([entry].[amount]))
  FROM [journal].[entries] [entry]
  WHERE [entry].[user_id] = @user_id
    AND [entry].[direction] = 1
    AND DATEADD(DAY, 1, EOMONTH([entry].[date], -1)) = DATEADD(MONTH, 0, DATEADD(DAY, 1, EOMONTH(GETUTCDATE(), -1)))

  SELECT @incomesValuePrev = ABS(SUM([entry].[amount]))
  FROM [journal].[entries] [entry]
  WHERE [entry].[user_id] = @user_id
    AND [entry].[direction] = 1
    AND DATEADD(DAY, 1, EOMONTH([entry].[date], -1)) = DATEADD(MONTH, -1, DATEADD(DAY, 1, EOMONTH(GETUTCDATE(), -1)))

  -- expenses
  SELECT [value] = ABS(SUM([entry].[amount])),
    [category] = [entry].[category],
    [percent] = ABS(SUM([entry].[amount])) / @expensesValueNow,
    [date] = DATEADD(DAY, 1, EOMONTH(min([entry].[date]), -1))
  FROM [journal].[entries] [entry]
  WHERE [entry].[user_id] = @user_id
    AND [entry].[direction] = 0
    AND DATEADD(DAY, 1, EOMONTH([entry].[date], -1)) = DATEADD(MONTH, 0, DATEADD(DAY, 1, EOMONTH(GETUTCDATE(), -1)))
  GROUP BY [entry].[category]
  ORDER BY ABS(SUM([entry].[amount])) DESC

  SELECT [value] = ABS(SUM([entry].[amount])),
    [category] = [entry].[category],
    [percent] = ABS(SUM([entry].[amount])) / @expensesValuePrev,
    [date] = DATEADD(DAY, 1, EOMONTH(min([entry].[date]), -1))
  FROM [journal].[entries] [entry]
  WHERE [entry].[user_id] = @user_id
    AND [entry].[direction] = 0
    AND DATEADD(DAY, 1, EOMONTH([entry].[date], -1)) = DATEADD(MONTH, -1, DATEADD(DAY, 1, EOMONTH(GETUTCDATE(), -1)))
  GROUP BY [entry].[category]
  ORDER BY ABS(SUM([entry].[amount])) DESC

  -- incomes
  SELECT [value] = ABS(SUM([entry].[amount])),
    [category] = [entry].[category],
    [percent] = ABS(SUM([entry].[amount])) / @incomesValueNow,
    [date] = DATEADD(DAY, 1, EOMONTH(min([entry].[date]), -1))
  FROM [journal].[entries] [entry]
  WHERE [entry].[user_id] = @user_id
    AND [entry].[direction] = 1
    AND DATEADD(DAY, 1, EOMONTH([entry].[date], -1)) = DATEADD(MONTH, 0, DATEADD(DAY, 1, EOMONTH(GETUTCDATE(), -1)))
  GROUP BY [entry].[category]
  ORDER BY ABS(SUM([entry].[amount])) DESC

  SELECT [value] = ABS(SUM([entry].[amount])),
    [category] = [entry].[category],
    [percent] = ABS(SUM([entry].[amount])) / @incomesValuePrev,
    [date] = DATEADD(DAY, 1, EOMONTH(min([entry].[date]), -1))
  FROM [journal].[entries] [entry]
  WHERE [entry].[user_id] = @user_id
    AND [entry].[direction] = 1
    AND DATEADD(DAY, 1, EOMONTH([entry].[date], -1)) = DATEADD(MONTH, -1, DATEADD(DAY, 1, EOMONTH(GETUTCDATE(), -1)))
  GROUP BY [entry].[category]
  ORDER BY ABS(SUM([entry].[amount])) DESC
END
GO

GRANT EXEC ON [analytics].[usp_getAnalytics] TO [sso] -- TEMPORARY ACTION

-- To-Do: Add stocks schema and table for tracking stock values
CREATE SCHEMA [stocks]

CREATE USER [stocks_agent] WITHOUT LOGIN
  WITH DEFAULT_SCHEMA = [guest]
GO

CREATE TABLE [stocks].[positions](
  [id] INT PRIMARY KEY IDENTITY(1, 1),
  [user_id] INT NOT NULL,
  [date] DATETIME NOT NULL,
  [ticker] VARCHAR(40) NOT NULL,
  [amount] DECIMAL(18,8) NOT NULL,
  [value] MONEY NOT NULL,
  [currency] CHAR(3) NOT NULL,
  [note] VARCHAR(200) NULL,
  [created] DATETIME NOT NULL DEFAULT GETUTCDATE(),
  [modified] DATETIME NULL
)

CREATE PROCEDURE [stocks].[usp_getPositions]
  @user_id INT
WITH EXECUTE AS 'stocks_agent'
AS BEGIN
  SELECT [id],
    [date],
    [ticker],
    [amount],
    [value],
    [currency],
    [note]
  FROM [stocks].[positions] [position]
  WHERE [User_id] = @user_id
  -- GROUP BY [ticker]
  ORDER BY [ticker] DESC
END
GO

CREATE PROCEDURE [stocks].[usp_insertPosition]
  @user_id INT,
  @date DATETIME,
  @ticker VARCHAR(40),
  @amount DECIMAL(18,8),
  @value MONEY,
  @currency CHAR(3),
  @note VARCHAR(200) = NULL
WITH EXECUTE AS 'stocks_agent'
AS BEGIN
  INSERT INTO [stocks].[positions] ([user_id], [date], [ticker], [amount], [value], [currency], [note])
  VALUES (@user_id, @date, @ticker, @amount, @value, @currency, @note)

  SELECT [id] = SCOPE_IDENTITY()
END
GO

CREATE PROCEDURE [stocks].[usp_updatePosition]
  @user_id INT,
  @id INT,
  @date DATETIME,
  @ticker VARCHAR(40),
  @amount DECIMAL(18,8),
  @value MONEY,
  @currency CHAR(3),
  @note VARCHAR(200) = NULL
WITH EXECUTE AS 'stocks_agent'
AS BEGIN
  UPDATE [stocks].[positions]
  SET [date] = @date,
    [ticker] = @ticker,
    [amount] = @amount,
    [value] = @value,
    [currency] = @currency,
    [note] = @note,
    [modified] = GETUTCDATE()
  WHERE [id] = @id
    AND [user_id] = @user_id
END
GO

CREATE PROCEDURE [stocks].[usp_deletePosition]
  @user_id INT,
  @id INT
WITH EXECUTE AS 'stocks_agent'
AS BEGIN
  DELETE FROM [stocks].[positions]
  WHERE [id] = @id
    AND [user_id] = @user_id
END
GO