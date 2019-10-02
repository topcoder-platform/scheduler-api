/**
 * Mocha unit tests of the Scheduled Task API.
 */

require('../../app-bootstrap')
const _ = require('lodash')
const uuid = require('uuid/v4')
const expect = require('chai').expect
const logger = require('../../src/common/logger')
const helper = require('../../src/common/helper')
const service = require('../../src/services/ScheduledTaskService')
const testData = require('../../scripts/data/ScheduledTask.json')
const { initDB } = require('../../scripts/init-db')
const { insertData } = require('../../scripts/test-data')
const { user, scheduledTask } = require('../common/testData')

describe('Topcoder - Autopilot Schedule API Unit Tests', () => {
  let id
  const notFoundId = uuid()
  const errorLogs = []
  const error = logger.error
  const fieldNames = ['id', 'headers', 'methodType', 'endpoint', 'status', 'scheduledTime', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy']

  before(async () => {
    // inject logger with log collector
    logger.error = (message) => {
      errorLogs.push(message)
      error(message)
    }

    await initDB()
    await insertData()
  })

  after(async () => {
    // restore logger
    logger.error = error

    await initDB()
  })

  /**
   * Assert Joi validation error
   * @param err the error
   * @param message the message
   */
  function assertValidationError (err, message) {
    expect(err.isJoi).to.equal(true)
    expect(err.name).to.equal('ValidationError')
    expect(err.details.map(x => x.message)).to.include(message)
    expect(errorLogs).to.include(err.stack)
  }

  /**
   * Assert error which is not thrown by Joi
   * @param err the error
   * @param message the message
   */
  function assertError (err, message) {
    expect(err.message).to.equal(message)
    expect(errorLogs).to.include(err.stack)
  }

  describe('Search scheduled tasks unit tests', () => {
    it('search scheduled tasks success 1', async () => {
      const ret = await service.searchScheduledTasks({
        page: 2,
        perPage: 2,
        status: 'ready'
      })
      expect(ret.page).to.equal(2)
      expect(ret.perPage).to.equal(2)
      expect(ret.total).to.equal(3)
      expect(ret.result.length).to.equal(1)
      expect(ret.result[0].status).to.equal('ready')
    })

    it('search scheduled tasks success 2', async () => {
      const ret = await service.searchScheduledTasks({
        status: 'failed'
      })
      expect(ret.page).to.equal(1)
      expect(ret.perPage).to.equal(20)
      expect(ret.total).to.equal(1)
      expect(ret.result.length).to.equal(1)
      ret.result[0].scheduledTime = ret.result[0].scheduledTime.toISOString()
      ret.result[0].createdAt = ret.result[0].createdAt.toISOString()
      ret.result[0].updatedAt = ret.result[0].updatedAt.toISOString()
      expect(_.pick(ret.result[0], fieldNames)).to.deep.equal(testData[4])
    })

    it('search scheduled tasks success 3', async () => {
      const ret = await service.searchScheduledTasks({})
      expect(ret.page).to.equal(1)
      expect(ret.perPage).to.equal(20)
      expect(ret.total).to.equal(5)
      expect(ret.result.length).to.equal(5)
    })

    it('failure - search scheduled tasks with invalid filter parameter status 1', async () => {
      try {
        await service.searchScheduledTasks({ status: 123 })
      } catch (err) {
        assertValidationError(err, '"status" must be a string')
      }
    })

    it('failure - search scheduled tasks with invalid filter parameter status 2', async () => {
      try {
        await service.searchScheduledTasks({ status: 'test' })
      } catch (err) {
        assertValidationError(err, '"status" must be one of [ready, running, failed, completed, rescheduled, disabled]')
      }
    })

    it('failure - search scheduled tasks with invalid filter parameter page 1', async () => {
      try {
        await service.searchScheduledTasks({ page: -1 })
      } catch (err) {
        assertValidationError(err, '"page" must be larger than or equal to 1')
      }
    })

    it('failure - search scheduled tasks with invalid filter parameter page 2', async () => {
      try {
        await service.searchScheduledTasks({ page: 1.1 })
      } catch (err) {
        assertValidationError(err, '"page" must be an integer')
      }
    })

    it('failure - search scheduled tasks with invalid filter parameter perPage 1', async () => {
      try {
        await service.searchScheduledTasks({ perPage: -1 })
      } catch (err) {
        assertValidationError(err, '"perPage" must be larger than or equal to 1')
      }
    })

    it('failure - search scheduled tasks with invalid filter parameter perPage 2', async () => {
      try {
        await service.searchScheduledTasks({ perPage: 1.1 })
      } catch (err) {
        assertValidationError(err, '"perPage" must be an integer')
      }
    })
  })

  describe('Create scheduled task unit tests', () => {
    it('create scheduled task success', async () => {
      const body = scheduledTask.testBody
      const ret = await service.createScheduledTask(user.admin, body)
      id = ret.id
      const entity = await helper.getById('ScheduledTask', id)
      ret.scheduledTime = ret.scheduledTime.toISOString()
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
      const ret = await service.createScheduledTask(user.m2mModify, body)
      const entity = await helper.getById('ScheduledTask', ret.id)
      ret.scheduledTime = ret.scheduledTime.toISOString()
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
        try {
          await service.createScheduledTask(user.admin, _.omit(scheduledTask.testBody, requireField))
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${requireField}" is required`)
        }
      })
    }

    for (const stringField of scheduledTask.stringFields) {
      it(`failure - create scheduled task with invalid parameter ${stringField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, stringField, 123)
        try {
          await service.createScheduledTask(user.admin, body)
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${stringField}" must be a string`)
        }
      })
    }

    for (const dateField of scheduledTask.dateFields) {
      it(`failure - create scheduled task with invalid parameter ${dateField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, dateField, 'abc')
        try {
          await service.createScheduledTask(user.admin, body)
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${dateField}" must be a number of milliseconds or valid date string`)
        }
      })
    }

    for (const objectField of scheduledTask.objectFields) {
      it(`failure - create scheduled task with invalid parameter ${objectField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, objectField, 'abc')
        try {
          await service.createScheduledTask(user.admin, body)
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${objectField}" must be an object`)
        }
      })
    }

    it('failure - create scheduled task with invalid parameter endpoint 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.endpoint = 'invalid'
      try {
        await service.createScheduledTask(user.admin, body)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"endpoint" must be a valid uri')
      }
    })

    it('failure - create scheduled task with invalid parameter methodType 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.methodType = 'invalid'
      try {
        await service.createScheduledTask(user.admin, body)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"methodType" must be one of [CONNECT, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE]')
      }
    })

    it('failure - create scheduled task with invalid parameter status 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.status = 'invalid'
      try {
        await service.createScheduledTask(user.admin, body)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"status" must be one of [ready, running, failed, completed, rescheduled, disabled]')
      }
    })
  })

  describe('Get scheduled task unit tests', () => {
    it('get scheduled task success', async () => {
      const ret = await service.getScheduledTask(id)
      expect(ret.id).to.equal(id)
      ret.scheduledTime = ret.scheduledTime.toISOString()
      expect(_.pick(ret, scheduledTask.allFields)).to.deep.equal(scheduledTask.testBody)
      expect(ret.createdBy).to.equal('TonyJ')
      expect(ret.createdAt).to.exist // eslint-disable-line
      expect(ret.updatedBy).to.not.exist // eslint-disable-line
      expect(ret.updatedAt).to.not.exist // eslint-disable-line
    })

    it('failure - get scheduled task not found', async () => {
      try {
        await service.getScheduledTask(notFoundId)
        throw new Error('should not throw error here')
      } catch (err) {
        expect(err.name).to.equal('NotFoundError')
        assertError(err, `ScheduledTask with id: ${notFoundId} doesn't exist`)
      }
    })

    it('failure - get scheduled task with invalid id', async () => {
      try {
        await service.getScheduledTask('invalid')
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"id" must be a valid GUID')
      }
    })
  })

  describe('Put scheduled task unit tests', () => {
    it('fully update scheduled task success', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      delete body.headers
      delete body.payload
      body.methodType = 'HEAD'
      body.endpoint = 'https://api.topcoder.com/v4/challenges'
      const ret = await service.putScheduledTask(user.admin, id, body)
      const entity = await helper.getById('ScheduledTask', id)
      ret.scheduledTime = ret.scheduledTime.toISOString()
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

    it('failure - fully update scheduled task not found', async () => {
      try {
        await service.putScheduledTask(user.admin, notFoundId, scheduledTask.testBody)
        throw new Error('should not throw error here')
      } catch (err) {
        expect(err.name).to.equal('NotFoundError')
        assertError(err, `ScheduledTask with id: ${notFoundId} doesn't exist`)
      }
    })

    it('failure - fully update scheduled task with invalid id', async () => {
      try {
        await service.putScheduledTask(user.admin, 'invalid', scheduledTask.testBody)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"id" must be a valid GUID')
      }
    })

    for (const requireField of scheduledTask.requiredFields) {
      it(`failure - fully update scheduled task with missing parameter ${requireField}`, async () => {
        try {
          await service.putScheduledTask(user.admin, id, _.omit(scheduledTask.testBody, requireField))
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${requireField}" is required`)
        }
      })
    }

    for (const stringField of scheduledTask.stringFields) {
      it(`failure - fully update scheduled task with invalid parameter ${stringField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, stringField, 123)
        try {
          await service.putScheduledTask(user.admin, id, body)
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${stringField}" must be a string`)
        }
      })
    }

    for (const dateField of scheduledTask.dateFields) {
      it(`failure - fully update scheduled task with invalid parameter ${dateField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, dateField, 'abc')
        try {
          await service.putScheduledTask(user.admin, id, body)
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${dateField}" must be a number of milliseconds or valid date string`)
        }
      })
    }

    for (const objectField of scheduledTask.objectFields) {
      it(`failure - fully update scheduled task with invalid parameter ${objectField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, objectField, 'abc')
        try {
          await service.putScheduledTask(user.admin, id, body)
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${objectField}" must be an object`)
        }
      })
    }

    it('failure - fully update scheduled task with invalid parameter endpoint 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.endpoint = 'invalid'
      try {
        await service.putScheduledTask(user.admin, id, body)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"endpoint" must be a valid uri')
      }
    })

    it('failure - fully update scheduled task with invalid parameter methodType 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.methodType = 'invalid'
      try {
        await service.putScheduledTask(user.admin, id, body)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"methodType" must be one of [CONNECT, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE]')
      }
    })

    it('failure - fully update scheduled task with invalid parameter status 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.status = 'invalid'
      try {
        await service.putScheduledTask(user.admin, id, body)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"status" must be one of [ready, running, failed, completed, rescheduled, disabled]')
      }
    })
  })

  describe('Patch scheduled task unit tests', () => {
    it('partially update scheduled task success', async () => {
      const body = {
        headers: {
          Authorization: 'Bearer test'
        },
        scheduledTime: '2020-01-01T02:00:00.000Z'
      }
      const ret = await service.patchScheduledTask(user.m2mModify, id, body)
      const entity = await helper.getById('ScheduledTask', id)
      ret.scheduledTime = ret.scheduledTime.toISOString()
      entity.scheduledTime = entity.scheduledTime.toISOString()
      const resultBody = _.cloneDeep(scheduledTask.testBody)
      delete resultBody.payload
      resultBody.methodType = 'HEAD'
      resultBody.endpoint = 'https://api.topcoder.com/v4/challenges'
      _.assign(resultBody, body)
      expect(ret.payload).to.not.exist // eslint-disable-line
      expect(_.omitBy(_.pick(ret, scheduledTask.allFields), _.isNil)).to.deep.equal(resultBody)
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

    it('failure - partially update scheduled task not found', async () => {
      try {
        await service.patchScheduledTask(user.admin, notFoundId, scheduledTask.testBody)
        throw new Error('should not throw error here')
      } catch (err) {
        expect(err.name).to.equal('NotFoundError')
        assertError(err, `ScheduledTask with id: ${notFoundId} doesn't exist`)
      }
    })

    it('failure - partially update scheduled task with invalid id', async () => {
      try {
        await service.patchScheduledTask(user.admin, 'invalid', scheduledTask.testBody)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"id" must be a valid GUID')
      }
    })

    for (const stringField of scheduledTask.stringFields) {
      it(`failure - partially update scheduled task with invalid parameter ${stringField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, stringField, 123)
        try {
          await service.patchScheduledTask(user.admin, id, body)
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${stringField}" must be a string`)
        }
      })
    }

    for (const dateField of scheduledTask.dateFields) {
      it(`failure - partially update scheduled task with invalid parameter ${dateField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, dateField, 'abc')
        try {
          await service.patchScheduledTask(user.admin, id, body)
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${dateField}" must be a number of milliseconds or valid date string`)
        }
      })
    }

    for (const objectField of scheduledTask.objectFields) {
      it(`failure - partially update scheduled task with invalid parameter ${objectField}`, async () => {
        const body = _.cloneDeep(scheduledTask.testBody)
        _.set(body, objectField, 'abc')
        try {
          await service.patchScheduledTask(user.admin, id, body)
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${objectField}" must be an object`)
        }
      })
    }

    it('failure - partially update scheduled task with invalid parameter endpoint 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.endpoint = 'invalid'
      try {
        await service.patchScheduledTask(user.admin, id, body)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"endpoint" must be a valid uri')
      }
    })

    it('failure - partially update scheduled task with invalid parameter methodType 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.methodType = 'invalid'
      try {
        await service.patchScheduledTask(user.admin, id, body)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"methodType" must be one of [CONNECT, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE]')
      }
    })

    it('failure - partially update scheduled task with invalid parameter status 2', async () => {
      const body = _.cloneDeep(scheduledTask.testBody)
      body.status = 'invalid'
      try {
        await service.patchScheduledTask(user.admin, id, body)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"status" must be one of [ready, running, failed, completed, rescheduled, disabled]')
      }
    })
  })

  describe('Delete scheduled task unit tests', () => {
    it('delete scheduled task success', async () => {
      const before = await helper.scan('ScheduledTask', { id })
      expect(before.length).to.equal(1)
      await service.deleteScheduledTask(id)
      const after = await helper.scan('ScheduledTask', { id })
      expect(after.length).to.equal(0)
    })

    it('failure - delete scheduled task not found', async () => {
      try {
        await service.deleteScheduledTask(notFoundId)
        throw new Error('should not throw error here')
      } catch (err) {
        expect(err.name).to.equal('NotFoundError')
        assertError(err, `ScheduledTask with id: ${notFoundId} doesn't exist`)
      }
    })

    it('failure - delete scheduled task with invalid id', async () => {
      try {
        await service.deleteScheduledTask('invalid')
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"id" must be a valid GUID')
      }
    })
  })
})
