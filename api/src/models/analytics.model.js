'use strict'

// import external node packages
const sql = require('mssql')
const db = require('../db')

const DB_NAME = 'quickfin'

exports.get = async (user_id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  const result = await request.query(`EXEC [analytics].[usp_getAnalytics] @user_id`)

  if (result.recordset.length > 0) {
    let resp = {
      collections: [
        {
          name: 'networth-history',
          datasets: [
            {
              name: 'current',
              rows: result.recordsets[0] /* for JSON responses we get an extra array, so we use an extra [0] */
            }
          ]
        }
      ]
    }

    if (result.recordsets.length > 1 && result.recordsets[1].length) {
      const networth_history = resp.collections.find(r => r.name === 'networth-history')
      networth_history.datasets.push({
        name: 'previous',
        rows: result.recordsets[1] /* for JSON responses we get an extra array, so we use an extra [0] */
      })
    }

    if (result.recordsets.length > 2 && result.recordsets[2].length && /* for JSON responses we get an extra array, so we use an extra [0] */
      result.recordsets.length > 3 && result.recordsets[3].length && /* for JSON responses we get an extra array, so we use an extra [0] */
      result.recordsets.length > 4 && result.recordsets[4].length) { /* for JSON responses we get an extra array, so we use an extra [0] */
      // create collection for 3 by 1 grid
      resp.collections.push({
        name: 'indicators',
        datasets: [{
          name: 'incomes-vs-budget',
          rows: result.recordsets[2]
        }, {
          name: 'expenses-vs-budget',
          rows: result.recordsets[3]
        }, {
          name: 'balance-vs-networth-diff',
          rows: result.recordsets[4]
        }]
      })
    }

    if (result.recordsets.length > 5 && result.recordsets[5].length && /* for JSON responses we get an extra array, so we use an extra [0] */
      result.recordsets.length > 6 && result.recordsets[6].length && /* for JSON responses we get an extra array, so we use an extra [0] */
      result.recordsets.length > 7 && result.recordsets[7].length && /* for JSON responses we get an extra array, so we use an extra [0] */
      result.recordsets.length > 8 && result.recordsets[8].length) { /* for JSON responses we get an extra array, so we use an extra [0] */
      // create collection for 3 by 1 grid
      resp.collections.push({
        name: 'donuts',
        datasets: [{
          name: 'expenses-now',
          rows: result.recordsets[5]
        }, {
          name: 'expenses-prev',
          rows: result.recordsets[6]
        }, {
          name: 'incomes-now',
          rows: result.recordsets[7]
        }, {
          name: 'incomes-prev',
          rows: result.recordsets[8]
        }]
      })
    }

    return resp
  }
  return null
}