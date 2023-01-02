const jwt = require('jsonwebtoken')
const sql = require('mssql')

const db = require('../db')
const config = require('../config')
const SSO = require('./sso.model')

const issuer = 'https://quickfin.be'
const expiresIn = 900

/**
 * 
 * @param {{ user_id: number, scope: string}} authorization_code 
 * @returns 
 */
exports.getIdToken = async (authorization_code) => {
  const { audience, subject } = await getAudSub(authorization_code.user_id, authorization_code.client_id)
  const userinfo = await SSO.getUserInfo(authorization_code.user_id)

  let payload
  const scopes = authorization_code.scope.split(' ')
  // extract required data base on authorization_code.scope

  for (const [key, value] of Object.entries(userinfo)) {
    if (!payload)
      payload = {}
    if (scopes.indexOf(key) !== -1)
      payload[key] = value
  }

  if (scopes.indexOf('roles') !== -1) {
    if (!payload)
      payload = {}
    payload.roles = await getRoles(authorization_code.user_id, authorization_code.client_id)
  }

  if (!payload)
    throw new Error('Invalid payload')

  return jwt.sign(payload, config.keys[0].secret, {
    issuer,
    audience,
    expiresIn,
    subject
  })
}

exports.getAccessToken = async (authorization_code) => {
  const { audience, subject } = await getAudSub(authorization_code.user_id, authorization_code.client_id)
  const roles = await getRoles(authorization_code.user_id, authorization_code.client_id)

  return jwt.sign({
    roles
  }, config.keys[0].secret, {
    issuer,
    audience,
    expiresIn,
    subject
  })
}

/**
 * Create a new refresh token for user_id
 * @param {number} user_id 
 * @param {string} code 
 * @param {string} access_token 
 * @returns {Promise<any>}
 */
exports.getRefreshToken = (user_id, code, access_token) => {
  return SSO.createRefreshToken(
    user_id,
    code,
    access_token
  )
}

/**
 * Update `password` for id: `user_id`
 * @param {number} user_id to update
 * @param {string} password to use for authentication
 * @returns 
 */
exports.updatePassword = (id, password) => SSO.updatePassword(id, password)

/**
 * 
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns 
 */
exports.create = async (username, email, password) => {
  const request = new sql.Request(await db.get('sapphire'))
  request.input('username', sql.VarChar, username)
  request.input('email', sql.VarChar, email)
  request.input('password', sql.VarChar, password)

  const result = await request.query(`EXEC [sso].[uspCreateUser] @username, @email, @password`)

  if (result.rowsAffected[0] > 0) {
    return true
  }
  return false
}

const getAudSub = async (user_id, client_id) => {
  let application = await SSO.getApplicationByClientId(client_id)

  return {
    audience: [
      client_id,
      application != null ? application.url : undefined
    ],
    subject: user_id.toString()
  }
}

const getRoles = async (user_id, client_id) => {
  let roles = await SSO.getRolesForUserId(user_id)
  let application = await SSO.getApplicationByClientId(client_id)

  if (application) {
    roles = roles.filter(role => role.scope.indexOf(application.scopePrefix) !== -1)
  }

  return roles.map((role) => role.name + ':' + role.scope)
}
