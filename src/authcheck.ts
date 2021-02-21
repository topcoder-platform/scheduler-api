import _ from 'lodash';
import * as jwt from 'jsonwebtoken';
const jwksRSA = require('jwks-rsa');
const ms = require('millisecond');
import {
  getAuthSecret,
  getValidIssuers
} from './config';
import {
  getAllowedScopes,
  getAllowedRoles
} from './config';
import { UnauthorizedError, ForbiddenError } from './errors';
import { checkIfExists } from './helper';
const jwksClients:any = {} // in global scope
const util = {
  wrapErrorResponse: (reqId:any, status:any, message:any) => {
    return {
      id: reqId,
      version: '',
      result: {
        success: false,
        status: status,
        content: {
          message: message
        }
      }
    }
  }
}

const authVerifier = function (validIssuers: any, jwtKeyCacheTime: any) {
  return {
    /**
     * Verify jwt token
     * V3 API specification
     * @param  token  the token to verify
     * @param  secret  secret code (Optional), should be provided if alg is HS256
     * @param  callback  callback to pass responses
     */
    validateToken: (token: any, secret: any, callback: any) => {
      // Decode it first
      let decodedToken: any = jwt.decode(token, {complete: true})

      // Check if it's HS or RS

      if (decodedToken && decodedToken.header) {
        if (decodedToken.header.alg === "RS256") {
          if (validIssuers.indexOf(decodedToken.payload.iss) === -1) {
            callback(new Error('Invalid token issuer.'))
          } else {
            // Get the key id (kid)
            let kid = decodedToken.header.kid
            // Get the public cert for verification then verify
            if (!jwksClients[decodedToken.payload.iss]) {
              jwksClients[decodedToken.payload.iss] = jwksRSA({
                cache: true,
                cacheMaxEntries: 5, // Default value
                cacheMaxAge: ms(jwtKeyCacheTime), // undefined/0 means infinte
                jwksUri: decodedToken.payload.iss + '.well-known/jwks.json'
              })
            }
            jwksClients[decodedToken.payload.iss].getSigningKey(kid, (err: any, key: any) => {
              if (err) {
                callback(new Error('Invalid Token.' + err))
              } else {
                jwtVerify(token, key.publicKey, callback)
              }
            })
          }
        }

        if (decodedToken.header.alg === "HS256") {
          jwtVerify(token, secret, callback)
        }
      } else {
        callback(new Error('Invalid Token.'))
      }

    }
  }

  function jwtVerify(token: any, secretOrCert: any, callback: any) {  // verifies secret and checks exp
    jwt.verify(token, secretOrCert, (err: any, decoded: any) => {
      if (err) {
        callback(new Error('Failed to authenticate token.'))
      } else if (validIssuers.indexOf(decoded.iss) === -1) {
        // verify issuer
        callback(new Error('Invalid token issuer.'))
      } else {
        callback(undefined, decoded)
      }
    })
  }
}

function getAzpHash(azp: any) {
  if (!azp || azp.length === 0) {
    throw new Error('AZP not provided.')
  }
  // default offset value
  let azphash = 100000
  for (let i = 0; i < azp.length; i++) {
    let v = azp.charCodeAt(i)
    azphash += v * (i + 1)
  }
  return azphash * (-1)
}

const authenticator = function (options: any) {
  // retrieve secret from options
  let secret = _.get(options, "AUTH_SECRET") || ''
  let validIssuers = JSON.parse(_.get(options, "VALID_ISSUERS") || '[]')
  let jwtKeyCacheTime = _.get(options, "JWT_KEY_CACHE_TIME", '24h');
  if (!secret || secret.length === 0) {
    throw new Error('Auth secret not provided')
  }
  if (!validIssuers || validIssuers.length === 0) {
    throw new Error('JWT Issuers not configured')
  }

  let verifier = authVerifier(validIssuers, jwtKeyCacheTime)

  return function (req: any, res: any, next: any) {
    // check header
    var token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1]
    }
    // decode token
    //TODO get auth secret from KMS
    if (token) {

      verifier.validateToken(token, secret, (err: any, decoded: any) => {
        if (err) {
          res.status(403)
            .json(util.wrapErrorResponse(req.id, 403, err.message))
          res.send()
        } else {
          // if everything is good, save to request for use in other routes
          req.authUser = decoded
          req.authUser.userId = _.parseInt(_.find(req.authUser, (value: any, key: any) => {
            return (key.indexOf('userId') !== -1)
          }))
          req.authUser.handle = _.find(req.authUser, (value: any, key: any) => {
            return (key.indexOf('handle') !== -1)
          })
          req.authUser.roles = _.find(req.authUser, (value: any, key: any) => {
            return (key.indexOf('roles') !== -1)
          })

          let scopes = _.find(req.authUser, (value: any, key: any) => {
            return (key.indexOf('scope') !== -1)
          })
          if (scopes) {
            req.authUser.scopes = scopes.split(' ')

            let grantType = _.find(decoded, (value: any, key: any) => {
              return (key.indexOf('gty') !== -1)
            })
            if (grantType === 'client-credentials' &&
              !req.authUser.userId &&
              !req.authUser.roles) {
              req.authUser.isMachine = true
              req.authUser.azpHash = getAzpHash(req.authUser.azp)
            }
          }

          next()
        }
      })

    } else {
      // if there is no token
      // return an error
      res.status(403)
        .json(util.wrapErrorResponse(req.id, 403, 'No token provided.'))
      res.send()
    }

  }
}

/**
 * check auth
 *
 * @param {Object} req the event
 * @param {Object} context the context
 */
export async function authCheck(req: any, context: any) {
  req.headers.authorization = req.headers.token;
  return new Promise((resolve) => {
    const res = {
      status: (code:any) => {
        if (code === 403) {
          context.succeed(new UnauthorizedError('You are not authorized to perform this action!'))
        }
      },
      send: () => {
      }
    }
    authenticator({
      AUTH_SECRET: getAuthSecret(),
      VALID_ISSUERS: getValidIssuers()
    })(req, res, () => {
      const authUser = req.authUser;
      if (authUser.isMachine) {
        if (!authUser.scopes || !checkIfExists(getAllowedScopes(), authUser.scopes)) {
          context.succeed(new ForbiddenError('You are not allowed to perform this action!'));
        }
      } else {
        // User
        authUser.userId = String(authUser.userId)
        if (!authUser.roles || !checkIfExists(getAllowedRoles(), authUser.roles)) {
          context.succeed(new ForbiddenError('You are not allowed to perform this action!'));
        }
      }
      resolve(authUser);
    })
  })
}
