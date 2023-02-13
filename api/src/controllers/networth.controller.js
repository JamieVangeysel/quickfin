'use strict'

// External dependencies
const { JwtPayload } = require('jose')
const { FastifyRequest, FastifyReply } = require('fastify')

const Networth = require('../models/networth.model')

/**
 * Get value
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.get = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    return Networth.get(token.sub)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

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
 * Create asset
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.postAsset = async (request, reply) => {
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
 * Update asset
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.putAsset = async (request, reply) => {
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
 * Delete asset
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.deleteAsset = async (request, reply) => {
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

/**
 * Create liability
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.postLiability = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    return Networth.insertLiability(token.sub, request.body)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Update liability
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.putLiability = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token
    const id = +request.params.id

    return Networth.updateLiability(token.sub, id, request.body)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Delete liability
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.deleteLiability = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token
    const id = +request.params.id

    return Networth.deleteLiability(token.sub, id)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}