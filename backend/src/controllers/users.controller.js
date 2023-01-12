const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { FastifyRequest, FastifyReply } = require('fastify')

const config = require('../config')
const SSO = require('../models/sso.model')
const User = require('../models/user.model')

/**
 * Create new user if it exists in azure
 * @param {FastifyRequest} request 
 * @param {FastifyReply} reply 
 */
exports.postSignUp = async (request, reply) => {
  try {
    const {
      username,
      password
    } = request.body

    /** @type {any[]} */
    const users = AAD.getAllUsers()
    const user = users.find(u => u.userPrincipalName === username && u.department)

    const dbUser = await SSO.get(username)
    if (dbUser) {
      if (!dbUser.active) {
        return reply
          .status(412)
          .send({
            status: 'Precondition Failed',
            statusCode: 412,
            message: 'This user already exists, but is not active!'
          })
      }
      return reply
        .status(412)
        .send({
          status: 'Precondition Failed',
          statusCode: 412,
          message: 'This user already exists!'
        })
    }

    if (user) {
      /* Start azure-ad sync to update all data */
      const https = require('node:https')

      const options = {
        hostname: 'api.groupclaes.be',
        port: 443,
        path: '/azure-ad/sync?token=aCpnZUjK4cENXp3ZSFZypQcdj9zbmHMJE4K6jfsW4QyLrMMRRNw59h5wJGAPD7mc',
        method: 'GET'
      }

      const req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode)
      })

      req.end()

      /* User found! Create entry in sapphire.users */

      if (await User.create(user.onPremisesSamAccountName, username, bcrypt.hashSync(password, config.bcrypt.cost))) {
        return { user }
      }
      return reply
        .status(500)
        .send({
          status: 'Internal Server Error',
          statusCode: 500,
          message: 'Error while creating new user entry!'
        })
    }
    return reply
      .status(404)
      .send({
        status: 'Not Found',
        statusCode: 404,
        message: 'User not found!'
      })
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Revoke current or supplied refreshToken
 * @param {FastifyRequest} request 
 * @param {FastifyReply} reply 
 */
exports.postRevokeToken = async (request, reply) => {

}

/**
 * Renew current refreshToken
 * @param {FastifyRequest} request 
 * @param {FastifyReply} reply 
 */
exports.postRefreshToken = async (request, reply) => {
  try {
    const token = request.query.token
    const refreshToken = await SSO.getRefreshToken(token)

    if (!refreshToken) {
      return reply
        .code(403)
        .send({
          error: `This refresh token does not exist!`
        })
    }

    // get AuthorizationCode Details
    const authorization_code = await SSO.getAuthorizationCode(refreshToken.authorization_code)

    const access_token = await User.getAccessToken(authorization_code)
    const id_token = await User.getIdToken(authorization_code)

    let payload = {
      access_token,
      token_type: 'Bearer',
      expires_in: 900, // 15 minutes
      id_token_jwt: id_token,
      id_token: jwt.decode(id_token)
    }

    const newToken = await SSO.updateRefreshToken(token)

    if (newToken) {
      return {
        ...payload,
        refresh_token: newToken
      }
    } else {
      return reply
        .code(403)
        .send({
          error: `This refresh token has been revoked/expired!`
        })
    }

    // return reply
    //   .code(500)
    //   .send({
    //     error: `Something unexpected happened!`
    //   })
  } catch (err) {
    throw err
  }
}

/**
 * Update user password
 * @param {FastifyRequest} request 
 * @param {FastifyReply} reply 
 */
exports.postUpdatePassword = async (request, reply) => {
  try {
    /** @type {jwt.JwtPayload} */
    let token
    if (request.headers.authorization != null) {
      const bearer_token = request.headers.authorization.substring(7)
      token = jwt.decode(bearer_token)

      const body = request.body
      let _pass = body.password

      _pass = bcrypt.hashSync(_pass, config.bcrypt.cost)
      return await User.updatePassword(token.sub, _pass)
    }
    return reply
      .code(401)
      .send({
        error: `No token supplied!`
      })
  } catch (err) {
    throw err
  }
}