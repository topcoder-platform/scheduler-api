/**
 * Initialize database tables. All data will be cleared.
 */

require('../app-bootstrap')
const _ = require('lodash')
const models = require('../src/models')
const logger = require('../src/common/logger')
const helper = require('../src/common/helper')

const initDB = async () => {
  for (const modelName of _.keys(models)) {
    const entities = await helper.scan(modelName)
    for (const entity of entities) {
      await entity.delete()
    }
  }
}

if (!module.parent) {
  logger.info('Initialize database.')

  initDB().then(() => {
    logger.info('Done!')
    process.exit()
  }).catch((e) => {
    logger.logFullError(e)
    process.exit(1)
  })
}

module.exports = {
  initDB
}
