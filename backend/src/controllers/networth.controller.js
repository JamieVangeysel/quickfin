'use strict'

// External dependencies
const { FastifyRequest, FastifyReply } = require('fastify')

const Networth = require('../models/networth.model')

/**
 * Get Overview
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.getOverview = async (request, reply) => {
  try {
    return Networth.getOverview(request.token.sub)
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
    return Networth.getAssets(request.token.sub)
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
    return Networth.insertAsset(request.token.sub, request.body)
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
    const id = +request.params.id

    return Networth.updateAsset(request.token.sub, id, request.body)
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
    const id = +request.params.id

    return Networth.deleteAsset(request.token.sub, id)
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
    return Networth.getLiabilities(request.token.sub)
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
    return Networth.insertLiability(request.token.sub, request.body)
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
    const id = +request.params.id

    return Networth.updateLiability(request.token.sub, id, request.body)
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
    const id = +request.params.id

    return Networth.deleteLiability(request.token.sub, id)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}