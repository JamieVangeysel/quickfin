'use strict'

// External dependencies
const { JwtPayload } = require('jsonwebtoken')
const { FastifyRequest, FastifyReply } = require('fastify')

const Networth = require('../models/networth.model')

/**
 * Get Overview
 * @param {FastifyRequest} request 
 * @param {FastifyReply} reply 
 */
exports.getOverview = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    return Networth.getOverview(token.sub)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Get assets
 * @param {FastifyRequest} request 
 * @param {FastifyReply} reply 
 */
exports.getAssets = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    return Networth.getAssets(token.sub)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Get Liabilities
 * @param {FastifyRequest} request 
 * @param {FastifyReply} reply 
 */
exports.getLiabilities = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    return Networth.getLiabilities(token.sub)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}