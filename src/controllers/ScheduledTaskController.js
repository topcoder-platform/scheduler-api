/**
 * Controller for Scheduled Task endpoints
 */
const service = require('../services/ScheduledTaskService')
const HttpStatus = require('http-status-codes')
const helper = require('../common/helper')

/**
 * Create scheduled task.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function createScheduledTask (req, res) {
  const result = await service.createScheduledTask(req.authUser, req.body)
  res.status(HttpStatus.CREATED).send(result)
}

/**
 * Get scheduled task by id.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function getScheduledTask (req, res) {
  const result = await service.getScheduledTask(req.params.id)
  res.send(result)
}

/**
 * Fully update scheduled task by id.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function putScheduledTask (req, res) {
  const result = await service.putScheduledTask(req.authUser, req.params.id, req.body)
  res.send(result)
}

/**
 * Partially update scheduled task by id.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function patchScheduledTask (req, res) {
  const result = await service.patchScheduledTask(req.authUser, req.params.id, req.body)
  res.send(result)
}

/**
 * Delete scheduled task by id.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function deleteScheduledTask (req, res) {
  await service.deleteScheduledTask(req.params.id)
  res.status(HttpStatus.NO_CONTENT).send()
}

/**
 * Search scheduled task by criteria.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function searchScheduledTasks (req, res) {
  const result = await service.searchScheduledTasks(req.query)
  helper.setResHeaders(req, res, result)
  res.send(result.result)
}

module.exports = {
  createScheduledTask,
  getScheduledTask,
  putScheduledTask,
  patchScheduledTask,
  deleteScheduledTask,
  searchScheduledTasks
}
