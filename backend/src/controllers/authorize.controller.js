'use strict'

// import external node packages
const bcrypt = require('bcrypt')
const { FastifyRequest, FastifyReply } = require('fastify')

const SSO = require('../models/sso.model')
const User = require('../models/user.model')
const config = require('../config')

// https://quickfin.be/api/v1/authorize?response_type=code&scope=openid&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
/**
 * 
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.post = async (request, reply) => {
  try {
    const username = request.body.username
    const password = request.body.password

    const response_type = request.query.response_type
    const scope = request.query.scope

    const ip_address = request.headers['x-client-ip'].split(',')[0]
    const user_agent = request.headers['user-agent']
    let rating = 50
    if (!user_agent.includes('Mozilla') && !user_agent.includes('Chrome') & !user_agent.includes('Safari')) {
      rating = 20
    }
    // const redirect_uri = request.query.redirect_uri

    if (response_type !== 'code') {
      return reply
        .code(400)
        .send({
          error: `Invalid 'response_type' specified!`
        })
    }

    if (!scope) {
      return reply
        .code(400)
        .send({
          error: `Parameter 'scope' not specified!`
        })
    }

    let failedAttempts = await SSO.getFailedAuthAttempts(null, ip_address)
    if (failedAttempts.ip.length >= 20) {
      await SSO.addAuthLog(null, client_id, false, 3, 'too many failed attempts', ip_address, rating, user_agent)
      return reply
        .code(429)
        .send({
          reason: 'too many failed attempts'
        })
    }

    const user = await SSO.get(username)
    if (user === null) {
      await SSO.addAuthLog(null, client_id, false, 0, 'wrong username', ip_address, rating, user_agent)
      request.log.warn({ username, reason: 'wrong username' }, 'Failed to authenticate!')
      return reply
        .code(404)
        .send({
          error: 'Username or password is incorrect!'
        })
    }

    failedAttempts = await SSO.getFailedAuthAttempts(user.id, null)
    if (failedAttempts.user.length >= 10) {
      await SSO.addAuthLog(user.id, client_id, false, 2, 'too many failed attempts', ip_address, rating, user_agent)
      return reply
        .code(429)
        .send({
          reason: 'too many failed attempts'
        })
    }

    if (!user.active) {
      await SSO.addAuthLog(user.id, client_id, false, 0, 'user is inactive', ip_address, rating, user_agent)
      request.log.warn({ username }, 'Inactive user tried to authenticate!')
      return reply
        .code(404)
        .send({
          error: 'Username or password is incorrect!'
        })
    }

    // check password
    if (bcrypt.compareSync(password, user.password)) {
      // user has bcrypt password
    } else if (password === user.password) {
      // user is using plaintext password
      await User.updatePassword(user.id, bcrypt.hashSync(password, config.bcrypt.cost))
    } else {
      await SSO.addAuthLog(user.id, client_id, false, 0, 'wrong password', ip_address, rating, user_agent)
      request.log.warn({ username, reason: 'wrong password' }, 'Failed to authenticate!')
      return reply
        .code(404)
        .send({
          error: 'Username or password is incorrect!'
        })
    }

    let errors = []

    let authorization_code = await SSO.createAuthorizationCode(user.id, scope, client_id)

    return {
      authorization_code,
      errors
    }
  } catch (err) {
    throw err
  }
}