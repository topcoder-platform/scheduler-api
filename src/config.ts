/**
 * Configurations file.
 */

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
    throw new Error('TABLE_NAME is not defined');
  }
  return process.env.STATE_MACHINE_ARN;
}
