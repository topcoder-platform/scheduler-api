/**
 * This defines ScheduledTask model.
 */
const config = require('config')
const dynamoose = require('dynamoose')

const Schema = dynamoose.Schema

const schema = new Schema({
  id: {
    type: String,
    hashKey: true,
    required: true
  },
  headers: {
    type: Object,
    required: false
  },
  methodType: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  payload: {
    type: Object,
    required: false
  },
  status: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedBy: {
    type: String,
    required: false
  },
  updatedAt: {
    type: Date,
    required: false
  }
},
{
  throughput: { read: Number(config.AWS_READ_UNITS), write: Number(config.AWS_WRITE_UNITS) }
})

module.exports = schema
