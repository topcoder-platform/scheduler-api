/**
 * Mocha e2e tests of the Scheduled Task API.
 */

require('../../app-bootstrap')
const _ = require('lodash')
const config = require('config')
const uuid = require('uuid/v4')
const { initDB } = require('../../scripts/init-db')
const { insertData } = require('../../scripts/test-data')
const chai = require('chai')
const expect = require('chai').expect
const helper = require('../../src/common/helper')
const chaiHttp = require('chai-http')
const app = require('../../app')
const testData = require('../../scripts/data/ScheduledTask.json')
const { token, scheduledTask } = require('../common/testData')

chai.use(chaiHttp)

describe('Topcoder - Autopilot Schedule API E2E Tests', () => {
  let id
  const notFoundId = uuid()
  const basePath = `${config.API_VERSION}/scheduledTasks`

  before(async () => {
    await initDB()
    await insertData()
  })

  after(async () => {
    await initDB()
  })

  describe('Fail routes Tests', () => {
    it('Unsupported http method, return 405', async () => {
      const res = await chai.request(app)
        .put(basePath)
        .send({ name: 'fail-route' })

      expect(res.status).to.equal(405)
      expect(res.body.message).to.equal('The requested HTTP method is not supported.')
    })

    it('Http resource not found, return 404', async () => {
      const res = await chai.request(app)
        .get(`${config.API_VERSION}/invalid`)

      expect(res.status).to.equal(404)
      expect(res.body.message).to.equal('The requested resource cannot be found.')
    })
  })

  describe('Search scheduled tasks e2e tests', () => {
    it('search scheduled tasks success 1', async () => {
      const res = await chai.request(app)
        .get(`${basePath}?page=2&perPage=2&status=ready`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(200)
      expect(res.body.length).to.equal(1)
      expect(res.body[0].status).to.equal('ready')
    })

    it('search scheduled tasks success 2', async () => {
      const res = await chai.request(app)
        .get(`${basePath}?status=failed`)
        .set('Authorization', `Bearer ${token.m2mRead}`)

      expect(res.status).to.equal(200)
      expect(res.body.length).to.equal(1)
      expect(res.body[0]).to.deep.equal(testData[4])
    })

    it('search scheduled tasks success 3', async () => {
      const res = await chai.request(app)
        .get(basePath)
        .set('Authorization', `Bearer ${token.m2mRead}`)

      expect(res.status).to.equal(200)
      expect(res.body.length).to.equal(5)
    })

    it('failure - search scheduled tasks with invalid filter parameter status 1', async () => {
      const res = await chai.request(app)
        .get(`${basePath}?status=123&status=123`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"status" must be a string')
    })

    it('failure - search scheduled tasks with invalid filter parameter status 2', async () => {
      const res = await chai.request(app)
        .get(`${basePath}?status=test`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"status" must be one of [ready, running, failed, completed, rescheduled, disabled]')
    })

    it('failure - search scheduled tasks with invalid filter parameter page 1', async () => {
      const res = await chai.request(app)
        .get(`${basePath}?page=-1`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"page" must be larger than or equal to 1')
    })

    it('failure - search scheduled tasks with invalid filter parameter page 2', async () => {
      const res = await chai.request(app)
        .get(`${basePath}?page=1.1`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"page" must be an integer')
    })

    it('failure - search scheduled tasks with invalid filter parameter perPage 1', async () => {
      const res = await chai.request(app)
        .get(`${basePath}?perPage=-1`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"perPage" must be larger than or equal to 1')
    })

    it('failure - search scheduled tasks with invalid filter parameter perPage 2', async () => {
      const res = await chai.request(app)
        .get(`${basePath}?perPage=1.1`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"perPage" must be an integer')
    })

    it('failure - search scheduled tasks without token', async () => {
      const res = await chai.request(app)
        .get(basePath)

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('No token provided.')
    })

    it('failure - search scheduled tasks with invalid token', async () => {
      const res = await chai.request(app)
        .get(basePath)
        .set('Authorization', 'Bearer invalid')

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Invalid Token.')
    })

    it('failure - search scheduled tasks with expired token', async () => {
      const res = await chai.request(app)
        .get(basePath)
        .set('Authorization', `Bearer ${token.expired}`)

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Failed to authenticate token.')
    })

    it('failure - search scheduled tasks with forbidden user', async () => {
      const res = await chai.request(app)
        .get(basePath)
        .set('Authorization', `Bearer ${token.user}`)

      expect(res.status).to.equal(403)
      expect(res.body.message).to.equal('You are not allowed to perform this action!')
    })

    it('failure - search scheduled tasks with forbidden m2m token', async () => {
      const res = await chai.request(app)
        .get(basePath)
        .set('Authorization', `Bearer ${token.m2mModify}`)

      expect(res.status).to.equal(403)
      expect(res.body.message).to.equal('You are not allowed to perform this action!')
    })
  })

  describe('Head scheduled tasks e2e tests', () => {
    it('head scheduled tasks success 1', async () => {
      const res = await chai.request(app)
        .head(`${basePath}?page=1&perPage=2&status=ready`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(200)
    })

    it('head scheduled tasks success 2', async () => {
      const res = await chai.request(app)
        .head(`${basePath}?status=failed`)
        .set('Authorization', `Bearer ${token.m2mRead}`)

      expect(res.status).to.equal(200)
    })

    it('head scheduled tasks success 3', async () => {
      const res = await chai.request(app)
        .head(basePath)
        .set('Authorization', `Bearer ${token.m2mRead}`)

      expect(res.status).to.equal(200)
    })

    it('failure - head scheduled tasks with invalid filter parameter status 1', async () => {
      const res = await chai.request(app)
        .head(`${basePath}?status=123&status=123`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(400)
    })

    it('failure - head scheduled tasks with invalid filter parameter status 2', async () => {
      const res = await chai.request(app)
        .head(`${basePath}?status=test`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(400)
    })

    it('failure - head scheduled tasks with invalid filter parameter page 1', async () => {
      const res = await chai.request(app)
        .head(`${basePath}?page=-1`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(400)
    })

    it('failure - head scheduled tasks with invalid filter parameter page 2', async () => {
      const res = await chai.request(app)
        .head(`${basePath}?page=1.1`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(400)
    })

    it('failure - head scheduled tasks with invalid filter parameter perPage 1', async () => {
      const res = await chai.request(app)
        .head(`${basePath}?perPage=-1`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(400)
    })

    it('failure - head scheduled tasks with invalid filter parameter perPage 2', async () => {
      const res = await chai.request(app)
        .head(`${basePath}?perPage=1.1`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(400)
    })

    it('failure - head scheduled tasks without token', async () => {
      const res = await chai.request(app)
        .head(basePath)

      expect(res.status).to.equal(401)
    })

    it('failure - head scheduled tasks with invalid token', async () => {
      const res = await chai.request(app)
        .head(basePath)
        .set('Authorization', 'Bearer invalid')

      expect(res.status).to.equal(401)
    })

    it('failure - head scheduled tasks with expired token', async () => {
      const res = await chai.request(app)
        .head(basePath)
        .set('Authorization', `Bearer ${token.expired}`)

      expect(res.status).to.equal(401)
    })

    it('failure - head scheduled tasks with forbidden user', async () => {
      const res = await chai.request(app)
        .head(basePath)
        .set('Authorization', `Bearer ${token.user}`)

      expect(res.status).to.equal(403)
    })

    it('failure - head scheduled tasks with forbidden m2m token', async () => {
      const res = await chai.request(app)
        .head(basePath)
        .set('Authorization', `Bearer ${token.m2mModify}`)

      expect(res.status).to.equal(403)
    })
  })

  describe('Create scheduled task e2e tests', () => {
    it('create scheduled task success', async () => {
      const body = scheduledTask.testBody
      const res = await chai.request(app)
        .post(basePath)
        .set('Authorization', `Bearer ${token.admin}`)
        .send(body)

      expect(res.status).to.equal(201)
      const ret = res.body
      id = ret.id
      const entity = await helper.getById('ScheduledTask', id)
      entity.scheduledTime = entity.scheduledTime.toISOString()
      expect(_.pick(ret, scheduledTask.allFields)).to.deep.equal(body)
      expect(_.pick(ret, scheduledTask.allFields)).to.deep.equal(_.pick(entity, scheduledTask.allFields))
      expect(ret.createdBy).to.equal('TonyJ')
      expect(ret.createdAt).to.exist // eslint-disable-line
      expect(ret.updatedBy).to.not.exist // eslint-disable-line
      expect(ret.updatedAt).to.not.exist // eslint-disable-line
      expect(entity.createdBy).to.equal('TonyJ')
      expect(entity.createdAt).to.exist // eslint-disable-line
      expect(entity.updatedBy).to.not.exist // eslint-disable-line
      expect(entity.updatedAt).to.not.exist // eslint-disable-line
    })

    it('create scheduled task success 2', async () => {
      const body = scheduledTask.testBody
      const res = await chai.request(app)
        .post(basePath)
        .set('Authorization', `Bearer ${token.m2mModify}`)
        .send(body)

      expect(res.status).to.equal(201)
      const ret = res.body
      const entity = await helper.getById('ScheduledTask', ret.id)
      entity.scheduledTime = entity.scheduledTime.toISOString()
      expect(_.pick(ret, scheduledTask.allFields)).to.deep.equal(body)
      expect(_.pick(ret, scheduledTask.allFields)).to.deep.equal(_.pick(entity, scheduledTask.allFields))
      expect(ret.createdBy).to.equal('enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B@clients')
      expect(ret.createdAt).to.exist // eslint-disable-line
      expect(ret.updatedBy).to.not.exist // eslint-disable-line
      expect(ret.updatedAt).to.not.exist // eslint-disable-line
      expect(entity.createdBy).to.equal('enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B@clients')
      expect(entity.createdAt).to.exist // eslint-disable-line
      expect(entity.updatedBy).to.not.exist // eslint-disable-line
      expect(entity.updatedAt).to.not.exist // eslint-disable-line
    })

    for (const requireField of scheduledTask.requiredFields) {
      it(`failure - create scheduled task with missing parameter ${requireField}`, async () => {
        const res = await chai.request(app)
          .post(basePath)
          .set('Authorization', `Bearer ${token.admin}`)
          .send(_.omit(scheduledTask.testBody, requireField))

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal(`"${requireField}" is required`)
      })
    }

    for (const stringField of scheduledTask.stringFields) {
      it(`failure - create scheduled task with invalid parameter ${stringField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, stringField, 123)

        const res = await chai.request(app)
          .post(basePath)
          .set('Authorization', `Bearer ${token.admin}`)
          .send(body)

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal(`"${stringField}" must be a string`)
      })
    }

    for (const dateField of scheduledTask.dateFields) {
      it(`failure - create scheduled task with invalid parameter ${dateField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, dateField, 'abc')

        const res = await chai.request(app)
          .post(basePath)
          .set('Authorization', `Bearer ${token.admin}`)
          .send(body)

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal(`"${dateField}" must be a number of milliseconds or valid date string`)
      })
    }

    for (const objectField of scheduledTask.objectFields) {
      it(`failure - create scheduled task with invalid parameter ${objectField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, objectField, 'abc')

        const res = await chai.request(app)
          .post(basePath)
          .set('Authorization', `Bearer ${token.admin}`)
          .send(body)

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal(`"${objectField}" must be an object`)
      })
    }

    it('failure - create scheduled task with invalid parameter endpoint 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.endpoint = 'invalid'

      const res = await chai.request(app)
        .post(basePath)
        .set('Authorization', `Bearer ${token.admin}`)
        .send(body)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"endpoint" must be a valid uri')
    })

    it('failure - create scheduled task with invalid parameter methodType 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.methodType = 'invalid'

      const res = await chai.request(app)
        .post(basePath)
        .set('Authorization', `Bearer ${token.admin}`)
        .send(body)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"methodType" must be one of [CONNECT, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE]')
    })

    it('failure - create scheduled task with invalid parameter status 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.status = 'invalid'

      const res = await chai.request(app)
        .post(basePath)
        .set('Authorization', `Bearer ${token.admin}`)
        .send(body)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"status" must be one of [ready, running, failed, completed, rescheduled, disabled]')
    })

    it('failure - create scheduled tasks without token', async () => {
      const res = await chai.request(app)
        .post(basePath)
        .send(scheduledTask.testBody)

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('No token provided.')
    })

    it('failure - create scheduled tasks with invalid token', async () => {
      const res = await chai.request(app)
        .post(basePath)
        .send(scheduledTask.testBody)
        .set('Authorization', 'Bearer invalid')

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Invalid Token.')
    })

    it('failure - create scheduled tasks with expired token', async () => {
      const res = await chai.request(app)
        .post(basePath)
        .send(scheduledTask.testBody)
        .set('Authorization', `Bearer ${token.expired}`)

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Failed to authenticate token.')
    })

    it('failure - create scheduled tasks with forbidden user', async () => {
      const res = await chai.request(app)
        .post(basePath)
        .send(scheduledTask.testBody)
        .set('Authorization', `Bearer ${token.user}`)

      expect(res.status).to.equal(403)
      expect(res.body.message).to.equal('You are not allowed to perform this action!')
    })

    it('failure - create scheduled tasks with forbidden m2m token', async () => {
      const res = await chai.request(app)
        .post(basePath)
        .send(scheduledTask.testBody)
        .set('Authorization', `Bearer ${token.m2mRead}`)

      expect(res.status).to.equal(403)
      expect(res.body.message).to.equal('You are not allowed to perform this action!')
    })
  })

  describe('Get scheduled task e2e tests', () => {
    it('get scheduled task success', async () => {
      const res = await chai.request(app)
        .get(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(200)
      const ret = res.body
      expect(ret.id).to.equal(id)
      expect(_.pick(ret, scheduledTask.allFields)).to.deep.equal(scheduledTask.testBody)
      expect(ret.createdBy).to.equal('TonyJ')
      expect(ret.createdAt).to.exist // eslint-disable-line
      expect(ret.updatedBy).to.not.exist // eslint-disable-line
      expect(ret.updatedAt).to.not.exist // eslint-disable-line
    })

    it('failure - get scheduled task with invalid id', async () => {
      const res = await chai.request(app)
        .get(`${basePath}/invalid`)
        .set('Authorization', `Bearer ${token.m2mRead}`)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"id" must be a valid GUID')
    })

    it('failure - get scheduled tasks without token', async () => {
      const res = await chai.request(app)
        .get(`${basePath}/${id}`)

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('No token provided.')
    })

    it('failure - get scheduled task with invalid token', async () => {
      const res = await chai.request(app)
        .get(`${basePath}/${id}`)
        .set('Authorization', 'Bearer invalid')

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Invalid Token.')
    })

    it('failure - get scheduled task with expired token', async () => {
      const res = await chai.request(app)
        .get(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.expired}`)

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Failed to authenticate token.')
    })

    it('failure - get scheduled task with forbidden user', async () => {
      const res = await chai.request(app)
        .get(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.user}`)

      expect(res.status).to.equal(403)
      expect(res.body.message).to.equal('You are not allowed to perform this action!')
    })

    it('failure - get scheduled task with forbidden m2m token', async () => {
      const res = await chai.request(app)
        .get(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.m2mModify}`)

      expect(res.status).to.equal(403)
      expect(res.body.message).to.equal('You are not allowed to perform this action!')
    })

    it('failure - get scheduled task not found', async () => {
      const res = await chai.request(app)
        .get(`${basePath}/${notFoundId}`)
        .set('Authorization', `Bearer ${token.m2mRead}`)

      expect(res.status).to.equal(404)
      expect(res.body.message).to.equal(`ScheduledTask with id: ${notFoundId} doesn't exist`)
    })
  })

  describe('Head scheduled task e2e tests', () => {
    it('head scheduled task success', async () => {
      const res = await chai.request(app)
        .head(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(200)
    })

    it('failure - head scheduled task with invalid id', async () => {
      const res = await chai.request(app)
        .head(`${basePath}/invalid`)
        .set('Authorization', `Bearer ${token.m2mRead}`)

      expect(res.status).to.equal(400)
    })

    it('failure - head scheduled tasks without token', async () => {
      const res = await chai.request(app)
        .head(`${basePath}/${id}`)

      expect(res.status).to.equal(401)
    })

    it('failure - head scheduled task with invalid token', async () => {
      const res = await chai.request(app)
        .head(`${basePath}/${id}`)
        .set('Authorization', 'Bearer invalid')

      expect(res.status).to.equal(401)
    })

    it('failure - head scheduled task with expired token', async () => {
      const res = await chai.request(app)
        .head(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.expired}`)

      expect(res.status).to.equal(401)
    })

    it('failure - head scheduled task with forbidden user', async () => {
      const res = await chai.request(app)
        .head(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.user}`)

      expect(res.status).to.equal(403)
    })

    it('failure - head scheduled task with forbidden m2m token', async () => {
      const res = await chai.request(app)
        .head(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.m2mModify}`)

      expect(res.status).to.equal(403)
    })

    it('failure - head scheduled task not found', async () => {
      const res = await chai.request(app)
        .head(`${basePath}/${notFoundId}`)
        .set('Authorization', `Bearer ${token.m2mRead}`)

      expect(res.status).to.equal(404)
    })
  })

  describe('Put scheduled task e2e tests', () => {
    it('fully update scheduled task success', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      delete body.headers
      delete body.payload
      body.methodType = 'HEAD'
      body.endpoint = 'https://api.topcoder.com/v4/challenges'
      const res = await chai.request(app)
        .put(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.admin}`)
        .send(body)

      expect(res.status).to.equal(200)
      const ret = res.body
      const entity = await helper.getById('ScheduledTask', id)
      entity.scheduledTime = entity.scheduledTime.toISOString()
      expect(ret.headers).to.not.exist // eslint-disable-line
      expect(ret.payload).to.not.exist // eslint-disable-line
      expect(_.omitBy(_.pick(ret, scheduledTask.allFields), _.isNil)).to.deep.equal(body)
      expect(_.pick(entity, scheduledTask.allFields)).to.deep.equal(body)
      expect(ret.createdBy).to.equal('TonyJ')
      expect(ret.updatedBy).to.equal('TonyJ')
      expect(ret.createdAt).to.exist // eslint-disable-line
      expect(ret.updatedAt).to.exist // eslint-disable-line
      expect(entity.createdBy).to.equal('TonyJ')
      expect(entity.updatedBy).to.equal('TonyJ')
      expect(entity.createdAt).to.exist // eslint-disable-line
      expect(entity.updatedAt).to.exist // eslint-disable-line
    })

    it('failure - fully update scheduled task with invalid id', async () => {
      const res = await chai.request(app)
        .put(`${basePath}/invalid`)
        .set('Authorization', `Bearer ${token.admin}`)
        .send(scheduledTask.testBody)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"id" must be a valid GUID')
    })

    for (const requireField of scheduledTask.requiredFields) {
      it(`failure - fully update scheduled task with missing parameter ${requireField}`, async () => {
        const res = await chai.request(app)
          .put(`${basePath}/${id}`)
          .set('Authorization', `Bearer ${token.m2mModify}`)
          .send(_.omit(scheduledTask.testBody, requireField))

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal(`"${requireField}" is required`)
      })
    }

    for (const stringField of scheduledTask.stringFields) {
      it(`failure - fully update scheduled task with invalid parameter ${stringField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, stringField, 123)

        const res = await chai.request(app)
          .put(`${basePath}/${id}`)
          .set('Authorization', `Bearer ${token.m2mModify}`)
          .send(body)

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal(`"${stringField}" must be a string`)
      })
    }

    for (const dateField of scheduledTask.dateFields) {
      it(`failure - fully update scheduled task with invalid parameter ${dateField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, dateField, 'abc')

        const res = await chai.request(app)
          .put(`${basePath}/${id}`)
          .set('Authorization', `Bearer ${token.m2mModify}`)
          .send(body)

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal(`"${dateField}" must be a number of milliseconds or valid date string`)
      })
    }

    for (const objectField of scheduledTask.objectFields) {
      it(`failure - fully update scheduled task with invalid parameter ${objectField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, objectField, 'abc')

        const res = await chai.request(app)
          .put(`${basePath}/${id}`)
          .set('Authorization', `Bearer ${token.m2mModify}`)
          .send(body)

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal(`"${objectField}" must be an object`)
      })
    }

    it('failure - fully update scheduled task with invalid parameter endpoint 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.endpoint = 'invalid'

      const res = await chai.request(app)
        .put(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.m2mModify}`)
        .send(body)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"endpoint" must be a valid uri')
    })

    it('failure - fully update scheduled task with invalid parameter methodType 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.methodType = 'invalid'

      const res = await chai.request(app)
        .put(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.m2mModify}`)
        .send(body)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"methodType" must be one of [CONNECT, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE]')
    })

    it('failure - fully update scheduled task with invalid parameter status 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.status = 'invalid'

      const res = await chai.request(app)
        .put(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.m2mModify}`)
        .send(body)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"status" must be one of [ready, running, failed, completed, rescheduled, disabled]')
    })

    it('failure - fully update scheduled tasks without token', async () => {
      const res = await chai.request(app)
        .put(`${basePath}/${id}`)
        .send(scheduledTask.testBody)

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('No token provided.')
    })

    it('failure - fully update scheduled task with invalid token', async () => {
      const res = await chai.request(app)
        .put(`${basePath}/${id}`)
        .send(scheduledTask.testBody)
        .set('Authorization', 'Bearer invalid')

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Invalid Token.')
    })

    it('failure - fully update scheduled task with expired token', async () => {
      const res = await chai.request(app)
        .put(`${basePath}/${id}`)
        .send(scheduledTask.testBody)
        .set('Authorization', `Bearer ${token.expired}`)

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Failed to authenticate token.')
    })

    it('failure - fully update scheduled task with forbidden user', async () => {
      const res = await chai.request(app)
        .put(`${basePath}/${id}`)
        .send(scheduledTask.testBody)
        .set('Authorization', `Bearer ${token.user}`)

      expect(res.status).to.equal(403)
      expect(res.body.message).to.equal('You are not allowed to perform this action!')
    })

    it('failure - fully update scheduled task with forbidden m2m token', async () => {
      const res = await chai.request(app)
        .put(`${basePath}/${id}`)
        .send(scheduledTask.testBody)
        .set('Authorization', `Bearer ${token.m2mRead}`)

      expect(res.status).to.equal(403)
      expect(res.body.message).to.equal('You are not allowed to perform this action!')
    })

    it('failure - fully update scheduled task not found', async () => {
      const res = await chai.request(app)
        .put(`${basePath}/${notFoundId}`)
        .set('Authorization', `Bearer ${token.admin}`)
        .send(scheduledTask.testBody)

      expect(res.status).to.equal(404)
      expect(res.body.message).to.equal(`ScheduledTask with id: ${notFoundId} doesn't exist`)
    })
  })

  describe('Patch scheduled task e2e tests', () => {
    it('fully update scheduled task success', async () => {
      const body = {
        headers: {
          Authorization: 'Bearer test'
        },
        scheduledTime: '2020-01-01T02:00:00.000Z'
      }
      const res = await chai.request(app)
        .patch(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.m2mModify}`)
        .send(body)

      expect(res.status).to.equal(200)
      const ret = res.body
      const entity = await helper.getById('ScheduledTask', id)
      entity.scheduledTime = entity.scheduledTime.toISOString()
      const resultBody = _.cloneDeep(scheduledTask.testBody)
      delete resultBody.payload
      resultBody.methodType = 'HEAD'
      resultBody.endpoint = 'https://api.topcoder.com/v4/challenges'
      _.assign(resultBody, body)
      expect(_.pick(ret, scheduledTask.allFields)).to.deep.equal(resultBody)
      expect(_.pick(entity, scheduledTask.allFields)).to.deep.equal(resultBody)
      expect(ret.createdBy).to.equal('TonyJ')
      expect(ret.updatedBy).to.equal('enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B@clients')
      expect(ret.createdAt).to.exist // eslint-disable-line
      expect(ret.updatedAt).to.exist // eslint-disable-line
      expect(entity.createdBy).to.equal('TonyJ')
      expect(entity.updatedBy).to.equal('enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B@clients')
      expect(entity.createdAt).to.exist // eslint-disable-line
      expect(entity.updatedAt).to.exist // eslint-disable-line
    })

    it('failure - partially update scheduled task with invalid id', async () => {
      const res = await chai.request(app)
        .patch(`${basePath}/invalid`)
        .set('Authorization', `Bearer ${token.admin}`)
        .send(scheduledTask.testBody)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"id" must be a valid GUID')
    })

    for (const stringField of scheduledTask.stringFields) {
      it(`failure - partially update scheduled task with invalid parameter ${stringField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, stringField, 123)

        const res = await chai.request(app)
          .patch(`${basePath}/${id}`)
          .set('Authorization', `Bearer ${token.m2mModify}`)
          .send(body)

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal(`"${stringField}" must be a string`)
      })
    }

    for (const dateField of scheduledTask.dateFields) {
      it(`failure - partially update scheduled task with invalid parameter ${dateField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, dateField, 'abc')

        const res = await chai.request(app)
          .patch(`${basePath}/${id}`)
          .set('Authorization', `Bearer ${token.m2mModify}`)
          .send(body)

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal(`"${dateField}" must be a number of milliseconds or valid date string`)
      })
    }

    for (const objectField of scheduledTask.objectFields) {
      it(`failure - partially update scheduled task with invalid parameter ${objectField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, objectField, 'abc')

        const res = await chai.request(app)
          .patch(`${basePath}/${id}`)
          .set('Authorization', `Bearer ${token.m2mModify}`)
          .send(body)

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal(`"${objectField}" must be an object`)
      })
    }

    it('failure - partially update scheduled task with invalid parameter endpoint 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.endpoint = 'invalid'

      const res = await chai.request(app)
        .patch(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.m2mModify}`)
        .send(body)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"endpoint" must be a valid uri')
    })

    it('failure - partially update scheduled task with invalid parameter methodType 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.methodType = 'invalid'

      const res = await chai.request(app)
        .patch(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.m2mModify}`)
        .send(body)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"methodType" must be one of [CONNECT, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE]')
    })

    it('failure - partially update scheduled task with invalid parameter status 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.status = 'invalid'

      const res = await chai.request(app)
        .patch(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.m2mModify}`)
        .send(body)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"status" must be one of [ready, running, failed, completed, rescheduled, disabled]')
    })

    it('failure - partially update scheduled tasks without token', async () => {
      const res = await chai.request(app)
        .patch(`${basePath}/${id}`)
        .send(scheduledTask.testBody)

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('No token provided.')
    })

    it('failure - partially update scheduled task with invalid token', async () => {
      const res = await chai.request(app)
        .patch(`${basePath}/${id}`)
        .send(scheduledTask.testBody)
        .set('Authorization', 'Bearer invalid')

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Invalid Token.')
    })

    it('failure - partially update scheduled task with expired token', async () => {
      const res = await chai.request(app)
        .patch(`${basePath}/${id}`)
        .send(scheduledTask.testBody)
        .set('Authorization', `Bearer ${token.expired}`)

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Failed to authenticate token.')
    })

    it('failure - partially update scheduled task with forbidden user', async () => {
      const res = await chai.request(app)
        .patch(`${basePath}/${id}`)
        .send(scheduledTask.testBody)
        .set('Authorization', `Bearer ${token.user}`)

      expect(res.status).to.equal(403)
      expect(res.body.message).to.equal('You are not allowed to perform this action!')
    })

    it('failure - partially update scheduled task with forbidden m2m token', async () => {
      const res = await chai.request(app)
        .patch(`${basePath}/${id}`)
        .send(scheduledTask.testBody)
        .set('Authorization', `Bearer ${token.m2mRead}`)

      expect(res.status).to.equal(403)
      expect(res.body.message).to.equal('You are not allowed to perform this action!')
    })

    it('failure - partially update scheduled task not found', async () => {
      const res = await chai.request(app)
        .patch(`${basePath}/${notFoundId}`)
        .set('Authorization', `Bearer ${token.admin}`)
        .send(scheduledTask.testBody)

      expect(res.status).to.equal(404)
      expect(res.body.message).to.equal(`ScheduledTask with id: ${notFoundId} doesn't exist`)
    })
  })

  describe('Delete scheduled task e2e tests', () => {
    it('delete scheduled task success', async () => {
      const before = await helper.scan('ScheduledTask', { id })
      expect(before.length).to.equal(1)

      const res = await chai.request(app)
        .delete(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(204)

      const after = await helper.scan('ScheduledTask', { id })
      expect(after.length).to.equal(0)
    })

    it('failure - delete scheduled task with invalid id', async () => {
      const res = await chai.request(app)
        .delete(`${basePath}/invalid`)
        .set('Authorization', `Bearer ${token.m2mModify}`)

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"id" must be a valid GUID')
    })

    it('failure - delete scheduled tasks without token', async () => {
      const res = await chai.request(app)
        .delete(`${basePath}/${id}`)

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('No token provided.')
    })

    it('failure - delete scheduled task with invalid token', async () => {
      const res = await chai.request(app)
        .delete(`${basePath}/${id}`)
        .set('Authorization', 'Bearer invalid')

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Invalid Token.')
    })

    it('failure - delete scheduled task with expired token', async () => {
      const res = await chai.request(app)
        .delete(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.expired}`)

      expect(res.status).to.equal(401)
      expect(res.body.message).to.equal('Failed to authenticate token.')
    })

    it('failure - delete scheduled task with forbidden user', async () => {
      const res = await chai.request(app)
        .delete(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.user}`)

      expect(res.status).to.equal(403)
      expect(res.body.message).to.equal('You are not allowed to perform this action!')
    })

    it('failure - delete scheduled task with forbidden m2m token', async () => {
      const res = await chai.request(app)
        .delete(`${basePath}/${id}`)
        .set('Authorization', `Bearer ${token.m2mRead}`)

      expect(res.status).to.equal(403)
      expect(res.body.message).to.equal('You are not allowed to perform this action!')
    })

    it('failure - delete scheduled task not found', async () => {
      const res = await chai.request(app)
        .delete(`${basePath}/${notFoundId}`)
        .set('Authorization', `Bearer ${token.admin}`)

      expect(res.status).to.equal(404)
      expect(res.body.message).to.equal(`ScheduledTask with id: ${notFoundId} doesn't exist`)
    })
  })
})
