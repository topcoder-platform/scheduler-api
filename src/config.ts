/**
 * Configurations file.
 */

import { GetObjectRequest } from "aws-sdk/clients/s3";

/**
 * Get dynamodb table name.
 */
export function getDynamoTableName() {
  if (!process.env.TABLE_NAME) {
    throw new Error('TABLE_NAME is not defined');
  }
  return process.env.TABLE_NAME;
}

/**
 * Get ARN of the state machine used in step function.
 */
export function getStateMachineARN() {
  if (!process.env.STATE_MACHINE_ARN) {
    throw new Error('STATE_MACHINE_ARN is not defined');
  }
  return process.env.STATE_MACHINE_ARN;
}

/**
 * Get swagger file path in S3.
 */
export function getSwaggerPath(): GetObjectRequest {
  if (!process.env.S3_BUCKET) {
    throw new Error('S3_BUCKET to host swagger is not defined');
  }
  return { Bucket: process.env.S3_BUCKET || '', Key: 'swagger.yaml' };
}

/**
 * Get API Base URL
 */
export function getAPIBaseURL() {
  if (!process.env.API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined');
  }
  return process.env.API_BASE_URL;
}

/**
 * Get API Base URL
 */
export function getDynamoRegion() {
  if (!process.env.DYNAMODB_REGION) {
    throw new Error('DYNAMODB_REGION is not defined');
  }
  return process.env.DYNAMODB_REGION;
}
