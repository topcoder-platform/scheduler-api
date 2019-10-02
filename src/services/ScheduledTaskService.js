/**
 * This service provides operations of scheduler.
 */
const _ = require('lodash')
const Joi = require('@hapi/joi')
const uuid = require('uuid/v4')
const constants = require('../../app-constants')
const logger = require('../common/logger')
const helper = require('../common/helper')

/**
 * Create scheduled task.
 *
 * @param {Object} currentUser the user who perform operation
 * @param {Object} scheduledTask the scheduled task to be created
 * @returns {Object} the created scheduled task
 */
async function createScheduledTask (currentUser, scheduledTask) {
  scheduledTask.createdBy = currentUser.handle || currentUser.sub
  scheduledTask.createdAt = new Date()
  scheduledTask.id = uuid()
  return helper.create('ScheduledTask', scheduledTask)
}

createScheduledTask.schema = {
  currentUser: Joi.any(),
  scheduledTask: Joi.object().keys({
    headers: Joi.object(),
    methodType: Joi.string().required().valid(constants.MethodTypes),
    endpoint: Joi.string().uri().required(),
    payload: Joi.object(),
    status: Joi.string().valid(_.values(constants.Status)).default(constants.Status.Ready),
    scheduledTime: Joi.date().required()
  }).required()
}

/**
 * Get scheduled task by id.
 *
 * @param {String} id the scheduled task id
 * @returns {Object} the scheduled task with given id
 */
async function getScheduledTask (id) {
  return helper.getById('ScheduledTask', id)
}

getScheduledTask.schema = {
  id: Joi.id()
}

/**
 * Update scheduled task by id.
 *
 * @param {Object} currentUser the user who perform operation
 * @param {String} id the scheduled id
 * @param {Object} data the scheduled task to be updated
 * @param {Boolean} isFull the flag indicate it is a fully update operation.
 * @returns {Object} the updated scheduled task
 */
async function updateScheduledTask (currentUser, id, data, isFull) {
  const entity = await helper.getById('ScheduledTask', id)
  data.updatedBy = currentUser.handle || currentUser.sub
  data.updatedAt = new Date()
  if (isFull) {
    // headers and payload are optional fields, can be undefined
    entity.headers = data.headers
    entity.payload = data.payload
  }
  return helper.update(entity, data)
}

/**
 * Fully update scheduled task by id.
 *
 * @param {Object} currentUser the user who perform operation
 * @param {String} id the scheduled id
 * @param {Object} data the scheduled task to be updated
 * @returns {Object} the updated scheduled task
 */
async function putScheduledTask (currentUser, id, data) {
  return updateScheduledTask(currentUser, id, data, true)
}

putScheduledTask.schema = {
  currentUser: Joi.any(),
  id: Joi.id(),
  data: Joi.object().keys({
    headers: Joi.object(),
    methodType: Joi.string().required().valid(constants.MethodTypes),
    endpoint: Joi.string().uri().required(),
    payload: Joi.object(),
    status: Joi.string().valid(_.values(constants.Status)).default(constants.Status.Ready),
    scheduledTime: Joi.date().required()
  }).required()
}

/**
 * Partially update scheduled task by id.
 *
 * @param {Object} currentUser the user who perform operation
 * @param {String} id the scheduled id
 * @param {Object} data the scheduled task to be updated
 * @returns {Object} the updated scheduled task
 */
async function patchScheduledTask (currentUser, id, data) {
  return updateScheduledTask(currentUser, id, data)
}

patchScheduledTask.schema = {
  currentUser: Joi.any(),
  id: Joi.id(),
  data: Joi.object().keys({
    headers: Joi.object(),
    methodType: Joi.string().valid(constants.MethodTypes),
    endpoint: Joi.string().uri(),
    payload: Joi.object(),
    status: Joi.string().valid(_.values(constants.Status)),
    scheduledTime: Joi.date()
  }).required()
}

/**
 * Delete scheduled task by id.
 * @param {String} id the scheduled task id
 */
async function deleteScheduledTask (id) {
  const entity = await helper.getById('ScheduledTask', id)
  await entity.delete()
}

deleteScheduledTask.schema = getScheduledTask.schema

/**
 * Search scheduled tasks by criteria.
 * @param {Object} the search criteria
 * @param {Object} the search result
 */
async function searchScheduledTasks (criteria) {
  const records = criteria.status ? await helper.scan('ScheduledTask', { status: criteria.status }) : await helper.scan('ScheduledTask')
  const total = records.length
  const result = records.slice((criteria.page - 1) * criteria.perPage, criteria.page * criteria.perPage)

  return { total, page: criteria.page, perPage: criteria.perPage, result }
}

searchScheduledTasks.schema = {
  criteria: Joi.object().keys({
    page: Joi.page(),
    perPage: Joi.perPage(),
    status: Joi.string().valid(_.values(constants.Status))
  }).required()
}

module.exports = {
  createScheduledTask,
  getScheduledTask,
  putScheduledTask,
  patchScheduledTask,
  deleteScheduledTask,
  searchScheduledTasks
}

logger.buildService(module.exports)
