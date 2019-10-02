/**
 * App constants
 */

const UserRole = {
  Admin: 'Administrator'
}

const Scope = {
  Read: 'read:scheduled_task',
  Create: 'create:scheduled_task',
  Update: 'update:scheduled_task',
  Delete: 'delete:scheduled_task',
  All: 'all:scheduled_task'
}

const MethodTypes = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE']

const Status = {
  Ready: 'ready',
  Running: 'running',
  Failed: 'failed',
  Completed: 'completed',
  Rescheduled: 'rescheduled',
  Disabled: 'disabled'
}

module.exports = {
  UserRole,
  Scope,
  MethodTypes,
  Status
}
