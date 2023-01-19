'use strict'

const bcrypt = require('bcrypt')
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
      password,
      given_name,
      family_name
    } = request.body

    if (await User.create(username, bcrypt.hashSync(password, config.bcrypt.cost), given_name, family_name)) {
      return {
        success: true
      }
    }
    return reply
      .status(500)
      .send({
        status: 'Internal Server Error',
        statusCode: 500,
        message: 'Error while creating new user entry!'
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
      id_token: id_token
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
    const body = request.body
    let _pass = body.password

    _pass = bcrypt.hashSync(_pass, config.bcrypt.cost)
    return await User.updatePassword(request.token.sub, _pass)
  } catch (err) {
    throw err
  }
}