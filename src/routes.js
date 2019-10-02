/**
 * Contains all routes
 */

const { UserRole, Scope } = require('../app-constants')

module.exports = {
  '/scheduledTasks': {
    get: {
      controller: 'ScheduledTaskController',
      method: 'searchScheduledTasks',
      auth: 'jwt',
      access: [UserRole.Admin],
      scopes: [Scope.Read, Scope.All]
    },
    post: {
      controller: 'ScheduledTaskController',
      method: 'createScheduledTask',
      auth: 'jwt',
      access: [UserRole.Admin],
      scopes: [Scope.Create, Scope.All]
    }
  },
  '/scheduledTasks/:id': {
    get: {
      controller: 'ScheduledTaskController',
      method: 'getScheduledTask',
      auth: 'jwt',
      access: [UserRole.Admin],
      scopes: [Scope.Read, Scope.All]
    },
    put: {
      controller: 'ScheduledTaskController',
      method: 'putScheduledTask',
      auth: 'jwt',
      access: [UserRole.Admin],
      scopes: [Scope.Update, Scope.All]
    },
    patch: {
      controller: 'ScheduledTaskController',
      method: 'patchScheduledTask',
      auth: 'jwt',
      access: [UserRole.Admin],
      scopes: [Scope.Update, Scope.All]
    },
    delete: {
      controller: 'ScheduledTaskController',
      method: 'deleteScheduledTask',
      auth: 'jwt',
      access: [UserRole.Admin],
      scopes: [Scope.Delete, Scope.All]
    }
  }
}
