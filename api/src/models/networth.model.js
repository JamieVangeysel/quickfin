'use strict'

// import external node packages
const sql = require('mssql')
const db = require('../db')

const DB_NAME = 'quickfin'

exports.get = async (user_id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  const result = await request.query(`EXEC [networth].[usp_get] @user_id`)

  if (result.recordset.length > 0) {
    return result.recordset[0][0] /* for JSON responses we get an extra array, so we use an extra [0] */
  }
  return null
}

exports.getOverview = async (user_id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  const result = await request.query(`EXEC [networth].[usp_getOverview] @user_id`)

  if (result.recordset.length > 0) {
    return result.recordset[0][0] /* for JSON responses we get an extra array, so we use an extra [0] */
  }
  return null
}

exports.getAssets = async (user_id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  const result = await request.query(`EXEC [networth].[usp_getAssets] @user_id`)

  if (result.recordset.length > 0) {
    return result.recordset[0][0] /* for JSON responses we get an extra array, so we use an extra [0] */
  }
  return null
}

exports.insertAsset = async (user_id, asset) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  request.input('group_id', sql.Int, asset.group_id)
  request.input('name', sql.VarChar(40), asset.name)
  request.input('value', sql.Money, asset.value)

  const result = await request.query(`EXEC [networth].[usp_insertAsset] @user_id, @group_id, @name, @value`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0,
      id: result.recordset.length > 0 ? result.recordset[0].id : undefined
    }
  }
  return null
}

exports.updateAsset = async (user_id, id, asset) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)
  request.input('id', sql.Int, id)

  request.input('group_id', sql.Int, asset.group_id)
  request.input('name', sql.VarChar(40), asset.name)
  request.input('value', sql.Money, asset.value)

  const result = await request.query(`EXEC [networth].[usp_updateAsset] @user_id, @id, @group_id, @name, @value`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0
    }
  }
  return null
}

exports.deleteAsset = async (user_id, id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)
  request.input('id', sql.Int, id)

  const result = await request.query(`EXEC [networth].[usp_deleteAsset] @user_id, @id`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0
    }
  }
  return null
}

exports.getLiabilities = async (user_id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  const result = await request.query(`EXEC [networth].[usp_getLiabilities] @user_id`)

  if (result.recordset.length > 0) {
    return result.recordset[0][0] /* for JSON responses we get an extra array, so we use an extra [0] */
  }
  return null
}

exports.insertLiability = async (user_id, asset) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  request.input('group_id', sql.Int, asset.group_id)
  request.input('name', sql.VarChar(40), asset.name)
  request.input('value', sql.Money, asset.value)

  const result = await request.query(`EXEC [networth].[usp_insertLiability] @user_id, @group_id, @name, @value`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0,
      id: result.recordset.length > 0 ? result.recordset[0].id : undefined
    }
  }
  return null
}

exports.updateLiability = async (user_id, id, asset) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)
  request.input('id', sql.Int, id)

  request.input('group_id', sql.Int, asset.group_id)
  request.input('name', sql.VarChar(40), asset.name)
  request.input('value', sql.Money, asset.value)

  const result = await request.query(`EXEC [networth].[usp_updateLiability] @user_id, @id, @group_id, @name, @value`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0
    }
  }
  return null
}

exports.deleteLiability = async (user_id, id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)
  request.input('id', sql.Int, id)

  const result = await request.query(`EXEC [networth].[usp_deleteLiability] @user_id, @id`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0
    }
  }
  return null
}