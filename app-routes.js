/**
 * Configure all routes for express app
 */

const _ = require('lodash')
const config = require('config')
const HttpStatus = require('http-status-codes')
const helper = require('./src/common/helper')
const errors = require('./src/common/errors')
const routes = require('./src/routes')
const authenticator = require('tc-core-library-js').middleware.jwtAuthenticator

/**
 * Configure all routes for express app
 * @param app the express app
 */
module.exports = (app) => {
  // Load all routes
  _.each(routes, (verbs, path) => {
    _.each(verbs, (def, verb) => {
      const controllerPath = `./src/controllers/${def.controller}`
      const method = require(controllerPath)[def.method]; // eslint-disable-line
      if (!method) {
        throw new Error(`${def.method} is undefined`)
      }

      const actions = []
      actions.push((req, res, next) => {
        req.signature = `${def.controller}#${def.method}`
        next()
      })

      // Authentication and Authorization
      if (def.auth === 'jwt') {
        let originalStatus
        let originalJson
        actions.push((req, res, next) => {
          // intercept and change the response status body from jwtAuthenticator to match v5 standard
          originalStatus = res.status
          originalJson = res.json
          res.status = (code) => {
            if (code === HttpStatus.FORBIDDEN) {
              return originalStatus.apply(res, [HttpStatus.UNAUTHORIZED])
            } else {
              return originalStatus.apply(res, [code])
            }
          }
          res.json = (value) => {
            if (_.get(value, 'result.content.message')) {
              return originalJson.apply(res, [{ message: _.get(value, 'result.content.message') }])
            } else {
              return originalJson.apply(res, [value])
            }
          }

          authenticator(_.pick(config, ['AUTH_SECRET', 'VALID_ISSUERS']))(req, res, next)
        })

        actions.push((req, res, next) => {
          res.status = originalStatus
          res.json = originalJson
          if (req.authUser.isMachine) {
            // M2M
            if (!req.authUser.scopes || !helper.checkIfExists(def.scopes, req.authUser.scopes)) {
              next(new errors.ForbiddenError('You are not allowed to perform this action!'))
            } else {
              next()
            }
          } else {
            if (!req.authUser.roles || !helper.checkIfExists(def.access, req.authUser.roles)) {
              next(new errors.ForbiddenError('You are not allowed to perform this action!'))
            } else {
              next()
            }
          }
        })
      }

      actions.push(method)
      app[verb](`${config.API_VERSION}${path}`, helper.autoWrapExpress(actions))
    })
  })

  // Check if the route is not found or HTTP method is not supported
  app.use('*', (req, res) => {
    const route = config.API_VERSION ? routes[req.baseUrl.substring(config.API_VERSION.length)] : routes[req.baseUrl]
    let status
    let message
    if (route) {
      status = HttpStatus.METHOD_NOT_ALLOWED
      message = 'The requested HTTP method is not supported.'
    } else {
      status = HttpStatus.NOT_FOUND
      message = 'The requested resource cannot be found.'
    }
    res.status(status).json({ message })
  })
}
