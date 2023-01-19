'use strict'

const jose = require('jose')
const sql = require('mssql')

const db = require('../db')
const config = require('../config')
const SSO = require('./sso.model')

const expiresIn = 900
const DB_NAME = 'quickfin'

/**
 *
 * @param {{ user_id: number, scope: string}} authorization_code
 * @returns
 */
exports.getIdToken = async (authorization_code) => {
  const { audience, subject } = await getAudSub(authorization_code.user_id)
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

  if (!payload)
    throw new Error('Invalid payload')

  const privateKey = await jose.importJWK(config.key)
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: config.key.alg, kid: config.key.kid, jku: config.key.jku })
    .setIssuer(config.key.iss)
    .setAudience(audience)
    .setExpirationTime(expiresIn + 's')
    .setSubject(subject)
    .sign(privateKey)
}

exports.getAccessToken = async (authorization_code) => {
  const { audience, subject } = await getAudSub(authorization_code.user_id)

  const privateKey = await jose.importJWK(config.key)
  return await new jose.SignJWT({ roles: ['*'] })
    .setProtectedHeader({ alg: config.key.alg, kid: config.key.kid, jku: config.key.jku })
    .setIssuer(config.key.iss)
    .setAudience(audience)
    .setExpirationTime(expiresIn + 's')
    .setSubject(subject)
    .sign(privateKey)
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
exports.create = async (email, password, given_name, family_name) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('email', sql.VarChar, email)
  request.input('password', sql.VarChar, password)
  request.input('given_name', sql.VarChar, given_name)
  request.input('family_name', sql.VarChar, family_name)

  const result = await request.query(`EXEC [sso].[usp_createUser] @email, @password, @given_name, @family_name`)

  if (result.rowsAffected[0] > 0) {
    return true
  }
  return false
}

const getAudSub = async (user_id) => {
  return {
    audience: [
      config.key.iss
    ],
    subject: user_id.toString()
  }
}
