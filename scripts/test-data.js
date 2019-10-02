/**
 * Insert test data into database
 */

require('../app-bootstrap')
const _ = require('lodash')
const models = require('../src/models')
const logger = require('../src/common/logger')
const helper = require('../src/common/helper')

const insertData = async () => {
  for (const modelName of _.keys(models)) {
    const entities = require(`./data/${modelName}.json`)
    for (const entity of entities) {
      await helper.create(modelName, entity)
    }
  }
}

if (!module.parent) {
  logger.info('Insert test data.')

  insertData().then(() => {
    logger.info('Done!')
    process.exit()
  }).catch((e) => {
    logger.logFullError(e)
    process.exit(1)
  })
}

module.exports = {
  insertData
}
