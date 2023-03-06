'use strict'

// External dependencies
const { JwtPayload } = require('jose')
const { FastifyRequest, FastifyReply } = require('fastify')

const Stock = require('../models/stocks.model')

/**
 * Get value
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.getPositions = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    return Stock.getPositions(token.sub)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Create stock position
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.postPosition = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    return Networth.insertAsset(token.sub, request.body)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Update stock position
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.putPosition = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token
    const id = +request.params.id

    return Networth.updateAsset(token.sub, id, request.body)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Delete stock position
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.deletePosition = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token
    const id = +request.params.id

    return Networth.deleteAsset(token.sub, id)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}