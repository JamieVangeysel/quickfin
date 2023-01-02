'use strict'

// import external node packages
const sql = require('mssql')
const db = require('../db')

/**
 * Get user information
 * @param {string} username 
 * @returns {Promise<null | {
 *   id: number,
 *   username: string,
 *   password: string,
 *   email: string,
 *   active: boolean
 * }>}
 */
exports.get = async (username) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('username', sql.VarChar, username)

  const result = await request.query(`EXEC [sso].[uspGetUser] @username`)

  if (result.recordset.length > 0) {
    return result.recordset[0]
  }
  return null
}

exports.getUserInfo = async (user_id) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('user_id', sql.Int, user_id)

  const result = await request.query(`EXEC [sso].[uspGetUserInfo] @user_id`)

  if (result.recordset.length > 0) {
    return result.recordset[0]
  }
  return null
}

/**
 * 
 * @param {number} user_id 
 * @param {string} password 
 * @returns boolean
 */
exports.updatePassword = async (user_id, password) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('user_id', sql.Int, user_id)
  request.input('password', sql.VarChar, password)

  const result = await request.query(`EXEC [sso].[uspUpdateUserPassword] @user_id, @password`)

  if (result.recordset.length > 0) {
    return result.rowsAffected[0] > 0
  }
  return null
}

/**
 * Check if refresh token exists in DB
 * @param {string} token 
 * @returns boolean | null
 */
exports.refreshTokenExists = async (token) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('token', sql.VarChar, token)

  const result = await request.query(`EXEC [sso].[uspTokenExists] @token`)

  if (result.recordset.length > 0) {
    return result.recordset[0].exists
  }
  return null
}

/**
 * Create AuthorizationCode
 * @param {number} user_id
 * @param {string} scope
 * @param {string} client_id
 */
exports.createAuthorizationCode = async (user_id, scope, client_id) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('user_id', sql.Int, user_id)
  request.input('scope', sql.VarChar, scope)
  request.input('client_id', sql.VarChar, client_id)

  const result = await request.query(`EXEC [sso].[uspCreateAuthorizationCode] @user_id, @scope, @client_id`)

  if (result.recordset.length > 0) {
    return result.recordset[0].code
  }
  return null
}

/**
 * Get information about the authorization code
 * @param {number} code
 * @returns {Promise<null | {
 *  user_id: int
 *  scope: string
 *  client_id: string,
 *  expires: Date
 * }>}
 */
exports.getAuthorizationCode = async (code) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('code', sql.VarChar, code)

  const result = await request.query(`EXEC [sso].[uspGetAuthorizationCode] @code`)

  if (result.recordset.length > 0) {
    return result.recordset[0]
  }
  return null
}

/**
 * Get RefreshToken
 * @param {number} user_id
 * @param {string} authorization_code
 * @param {string} access_token
 */
exports.createRefreshToken = async (user_id, authorization_code, access_token) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('user_id', sql.Int, user_id)
  request.input('authorization_code', sql.VarChar, authorization_code)
  request.input('access_token', sql.VarChar, access_token)

  const result = await request.query(`EXEC [sso].[uspCreateRefreshToken] @user_id, @authorization_code, @access_token`)

  if (result.recordset.length > 0) {
    return result.recordset[0].token
  }
  return null
}

/**
 * Get RefreshToken
 * @param {string} token
 */
exports.getRefreshToken = async (token) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('token', sql.VarChar, token)

  const result = await request.query(`EXEC [sso].[uspGetRefreshToken] @token`)

  if (result.recordset.length > 0) {
    return result.recordset[0]
  }
  return null
}

/**
 * Update RefreshToken
 * @param {string} token
 */
exports.updateRefreshToken = async (token) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('token', sql.VarChar, token)

  const result = await request.query(`EXEC [sso].[uspUpdateRefreshToken] @token`)

  if (result.recordset) {
    return result.recordset[0].token
  }
  return null
}

/**
 * Revoke RefreshToken
 * @param {string} token
 * @param {string} reason_revoked
 * @param {string} replaced_by_token
 */
exports.revokeRefreshToken = async (token, reason_revoked, replaced_by_token) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('token', sql.VarChar, token)
  request.input('reason_revoked', sql.VarChar, reason_revoked)
  request.input('replaced_by_token', sql.VarChar, replaced_by_token)

  const result = await request.query(`EXEC [sso].[uspRevokeRefreshToken] @token, @reason_revoked, @replaced_by_token`)

  if (result.recordset.length > 0) {
    return result.recordset[0].token
  }
  return null
}

/**
 * Get roles for user
 * @param {number} user_id
 * @returns {Promise<null | {
 *  name: string
 *  scope: string
 * }[]>}
 */
exports.getRolesForUserId = async (user_id) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('user_id', sql.Int, user_id)

  const result = await request.query(`EXEC [sso].[uspGetRolesForUserId] @user_id`)

  if (result.recordset.length > 0) {
    return result.recordset
  }
  return null
}

exports.getApplicationByClientId = async (client_id) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('client_id', sql.VarChar, client_id)

  const result = await request.query(`EXEC [sso].[uspGetApplicationByClientId] @client_id`)

  if (result.recordset.length > 0) {
    return result.recordset[0]
  }
  return null
}

exports.getMfaInfo = async (mfa_code) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('mfa_code', sql.VarChar, mfa_code)

  const result = await request.query(`EXEC [sso].[uspGetMfaInfo] @mfa_code`)

  if (result.recordset.length > 0) {
    return result.recordset[0]
  }
  return null
}

/**
 * @param {number} user_id -- ID of the user
 * @param {string} client_id -- ID of the client
 * @param {boolean} success -- true if successful
 * @param {number} result -- Result of the authentication attempt; 0 = failed, 1 = success, 2 = blocked, 3 = refused
 * @param {string} reason -- Reason the authentication attempt was rejected by the server
 * @param {string} ip -- IP address of the client
 * @param {number} rating -- rating of the authentication attempt
 * @param {string} user_agent -- Browser user agent this can be usefull to determine mallicious attempts
 * @returns {Promise<boolean>} True if successful
 */
exports.addAuthLog = async (user_id = null, client_id = null, success = false, result = 0, reason = null, ip = '127.0.0.1', rating = 50, user_agent = null) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('user_id', sql.Int, user_id)
  request.input('client_id', sql.VarChar, client_id)
  request.input('success', sql.Bit, success)
  request.input('result', sql.TinyInt, result)
  request.input('reason', sql.VarChar, reason)
  request.input('ip', sql.VarChar, ip)
  request.input('rating', sql.TinyInt, rating)
  request.input('user_agent', sql.VarChar, user_agent)

  const res = await request.query(`EXEC [sso].[uspAddAuthLog] @user_id, @client_id, @success, @result, @reason, @ip, @rating, @user_agent`)

  if (res.rowsAffected.length > 0) {
    return res.rowsAffected[0] > 0
  }
  return null
}

/**
 * 
 * @param {number} user_id 
 * @param {string} ip 
 * @returns {Promise<{user: any[], ip: any[]}>}
 */
exports.getFailedAuthAttempts = async (user_id = null, ip = null) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('user_id', sql.Int, user_id)
  request.input('ip', sql.VarChar, ip)

  const res = await request.query(`EXEC [sso].[uspGetFailedAuthAttempts] @user_id, @ip`)

  if (res.recordsets.length > 0) {
    return {
      user: res.recordsets[0] ?? [],
      ip: res.recordsets[1] ?? []
    }
  }
  return {
    user: [],
    ip: []
  }
}