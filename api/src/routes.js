'use strict'

// SSO controllers
const authorizeController = require('./controllers/authorize.controller')
const tokenController = require('./controllers/token.controller')
const usersController = require('./controllers/users.controller')

// 'API' controllers
const journalController = require('./controllers/journal.controller')
const networthController = require('./controllers/networth.controller')
const budgetController = require('./controllers/budget.controller')
const analyticsController = require('./controllers/analytics.controller')

module.exports.routes = [{
  method: 'POST',
  url: '/authorize',
  handler: authorizeController.post
}, {
  method: 'GET',
  url: '/token',
  handler: tokenController.get
}, {
  method: 'POST',
  url: '/users/sign-up',
  handler: usersController.postSignUp
}, {
  method: 'POST',
  url: '/users/refresh-token',
  handler: usersController.postRefreshToken
}, {
  method: 'POST',
  url: '/users/revoke-token',
  handler: usersController.postRevokeToken
}, {
  method: 'POST',
  url: '/users/update-password',
  handler: usersController.postUpdatePassword
}, {
  method: 'GET',
  url: '/journal/entries',
  handler: journalController.getEntries,
  requiredPermissions: []
}, {
  method: 'POST',
  url: '/journal/entries',
  handler: journalController.postEntry,
  requiredPermissions: []
}, {
  method: 'PUT',
  url: '/journal/entries/:id',
  handler: journalController.putEntry,
  requiredPermissions: []
}, {
  method: 'DELETE',
  url: '/journal/entries/:id',
  handler: journalController.deleteEntry,
  requiredPermissions: []
}, {
  method: 'GET',
  url: '/networth/overview',
  handler: networthController.getOverview,
  requiredPermissions: []
}, {
  method: 'GET',
  url: '/networth/assets',
  handler: networthController.getAssets,
  requiredPermissions: []
}, {
  method: 'POST',
  url: '/networth/assets',
  handler: networthController.postAsset,
  requiredPermissions: []
}, {
  method: 'PUT',
  url: '/networth/assets/:id',
  handler: networthController.putAsset,
  requiredPermissions: []
}, {
  method: 'DELETE',
  url: '/networth/assets/:id',
  handler: networthController.deleteAsset,
  requiredPermissions: []
}, {
  method: 'GET',
  url: '/networth/liabilities',
  handler: networthController.getLiabilities,
  requiredPermissions: []
}, {
  method: 'POST',
  url: '/networth/liabilities',
  handler: networthController.postLiability,
  requiredPermissions: []
}, {
  method: 'PUT',
  url: '/networth/liabilities/:id',
  handler: networthController.putLiability,
  requiredPermissions: []
}, {
  method: 'DELETE',
  url: '/networth/liabilities/:id',
  handler: networthController.deleteLiability,
  requiredPermissions: []
}, {
  method: 'GET',
  url: '/budget/overview',
  handler: budgetController.getOverview,
  requiredPermissions: []
}, {
  method: 'POST',
  url: '/budget/incomes',
  handler: budgetController.postIncome,
  requiredPermissions: []
}, {
  method: 'PUT',
  url: '/budget/incomes/:id',
  handler: budgetController.putIncome,
  requiredPermissions: []
}, {
  method: 'DELETE',
  url: '/budget/incomes/:id',
  handler: budgetController.deleteIncome,
  requiredPermissions: []
}, {
  method: 'POST',
  url: '/budget/expenses',
  handler: budgetController.postExpense,
  requiredPermissions: []
}, {
  method: 'PUT',
  url: '/budget/expenses/:id',
  handler: budgetController.putExpense,
  requiredPermissions: []
}, {
  method: 'DELETE',
  url: '/budget/expenses/:id',
  handler: budgetController.deleteExpense,
  requiredPermissions: []
}, {
  method: 'GET',
  url: '/analytics',
  handler: analyticsController.get,
  requiredPermissions: []
}]