'use strict'

const authorizeController = require('./controllers/authorize.controller')
const tokenController = require('./controllers/token.controller')
const usersController = require('./controllers/users.controller')

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
}]