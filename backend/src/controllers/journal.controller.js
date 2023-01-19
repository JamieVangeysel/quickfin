'use strict'

// External dependencies
const { JwtPayload } = require('jsonwebtoken')
const { FastifyRequest, FastifyReply } = require('fastify')

const Journal = require('../models/journal.model')

/**
 * Get entries
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.getEntries = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token
    let direction

    if (request.query.direction != undefined) {
      direction = request.query.direction === 'true'
    }

    return Journal.getEntries(token.sub, direction)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Create entry
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.postEntry = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    return Journal.insertEntry(token.sub, request.body)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Update entry
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.putEntry = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    const id = +request.params.id

    return Journal.updateEntry(token.sub, id, request.body)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Delete entry
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.deleteEntry = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    const id = +request.params.id

    return Journal.deleteEntry(token.sub, id)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}