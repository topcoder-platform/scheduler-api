/**
 * Initialize and export all model schemas.
 */

const config = require('config')
const dynamoose = require('dynamoose')

dynamoose.AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION
})

dynamoose.setDefaults({
  create: false,
  update: false,
  waitForActive: false
})

module.exports = {
  ScheduledTask: dynamoose.model(config.SCHEDULED_TASK_TABLE_NAME, require('./ScheduledTask'))
}
