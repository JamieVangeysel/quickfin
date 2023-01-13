'use strict'

// import external node packages
const sql = require('mssql')
const db = require('../db')

const DB_NAME = 'quickfin'

exports.getOverview = async (user_id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  const result = await request.query(`EXEC [networth].[usp_getOverview] @user_id`)

  if (result.recordset.length > 0) {
    return result.recordset[0][0] /* for JSON responses we get an extra array, so we use an extra [0] */
  }
  return null
}