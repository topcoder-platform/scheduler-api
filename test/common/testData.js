/*
 * Test data to be used in tests
 */

const token = {
  admin: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIiwiQ29ubmVjdCBTdXBwb3J0IiwiYWRtaW5pc3RyYXRvciIsInRlc3RSb2xlIiwiYWFhIiwidG9ueV90ZXN0XzEiLCJDb25uZWN0IE1hbmFnZXIiLCJDb25uZWN0IEFkbWluIiwiY29waWxvdCIsIkNvbm5lY3QgQ29waWxvdCBNYW5hZ2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOiJUb255SiIsImV4cCI6MTU5MTA1MjIxMSwidXNlcklkIjoiODU0Nzg5OSIsImlhdCI6MTU0OTc5MTYxMSwiZW1haWwiOiJ0amVmdHMrZml4QHRvcGNvZGVyLmNvbSIsImp0aSI6ImY5NGQxZTI2LTNkMGUtNDZjYS04MTE1LTg3NTQ1NDRhMDhmMSJ9.yMbmzAdPngoZYTBcb0_7gve3eV0iTeyFyS8A8EWP88w',
  user: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOiJkZW5pcyIsImV4cCI6MTU5MjgwMDE2OSwidXNlcklkIjoiMjUxMjgwIiwiaWF0IjoxNTQ5Nzk5NTY5LCJlbWFpbCI6ImVtYWlsQGRvbWFpbi5jb20ueiIsImp0aSI6IjljNDUxMWM1LWMxNjUtNGExYi04OTllLWI2NWFkMGUwMmI1NSJ9.Q3OJZLXWn8ifpgbbebg_Ayieza6tUMnRP0zfCsJi2p8',
  expired: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIiwiQ29ubmVjdCBTdXBwb3J0IiwiYWRtaW5pc3RyYXRvciIsInRlc3RSb2xlIiwiYWFhIiwidG9ueV90ZXN0XzEiLCJDb25uZWN0IE1hbmFnZXIiLCJDb25uZWN0IEFkbWluIiwiY29waWxvdCIsIkNvbm5lY3QgQ29waWxvdCBNYW5hZ2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOiJUb255SiIsImV4cCI6MTU1MTA2MzIxMSwidXNlcklkIjoiODU0Nzg5OSIsImlhdCI6MTU1MTA1MzIxMSwiZW1haWwiOiJ0amVmdHMrZml4QHRvcGNvZGVyLmNvbSIsImp0aSI6ImY5NGQxZTI2LTNkMGUtNDZjYS04MTE1LTg3NTQ1NDRhMDhmMSJ9.97-pjuSGGqDAqK2FG2yi_3nmzB7ZMXQwtG0bi8_PlKk',
  m2mRead: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3RvcGNvZGVyLWRldi5hdXRoMC5jb20vIiwic3ViIjoiZW5qdzE4MTBlRHozWFR3U08yUm4yWTljUVRyc3BuM0JAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbTJtLnRvcGNvZGVyLWRldi5jb20vIiwiaWF0IjoxNTUwOTA2Mzg4LCJleHAiOjE1OTEwNTIyMTEsImF6cCI6ImVuancxODEwZUR6M1hUd1NPMlJuMlk5Y1FUcnNwbjNCIiwic2NvcGUiOiJyZWFkOnNjaGVkdWxlZF90YXNrIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.UB9HU5Qxw9Cq2r6AU4nr-8kmLJKs2bXDEfaffxFLzqs',
  m2mModify: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3RvcGNvZGVyLWRldi5hdXRoMC5jb20vIiwic3ViIjoiZW5qdzE4MTBlRHozWFR3U08yUm4yWTljUVRyc3BuM0JAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbTJtLnRvcGNvZGVyLWRldi5jb20vIiwiaWF0IjoxNTUwOTA2Mzg4LCJleHAiOjE1OTEwNTIyMTEsImF6cCI6ImVuancxODEwZUR6M1hUd1NPMlJuMlk5Y1FUcnNwbjNCIiwic2NvcGUiOiJjcmVhdGU6c2NoZWR1bGVkX3Rhc2sgdXBkYXRlOnNjaGVkdWxlZF90YXNrIGRlbGV0ZTpzY2hlZHVsZWRfdGFzayIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.izgkTddIN8dcYaMXwngiW31uOhtV7_1Fga2pkUdQ1Ek'
}

const user = {
  admin: {
    roles: [
      'Topcoder User',
      'Connect Support',
      'administrator',
      'testRole',
      'aaa',
      'tony_test_1',
      'Connect Manager',
      'Connect Admin',
      'copilot',
      'Connect Copilot Manager'
    ],
    iss: 'https://api.topcoder-dev.com',
    handle: 'TonyJ',
    exp: 1591052211,
    userId: '8547899',
    iat: 1549791611,
    email: 'tjefts+fix@topcoder.com',
    jti: 'f94d1e26-3d0e-46ca-8115-8754544a08f1'
  },
  user: {
    roles: ['Topcoder User'],
    iss: 'https://api.topcoder-dev.com',
    handle: 'denis',
    exp: 1592800169,
    userId: '251280',
    iat: 1549799569,
    email: 'email@domain.com.z',
    jti: '9c4511c5-c165-4a1b-899e-b65ad0e02b55'
  },
  m2mRead: {
    iss: 'https://topcoder-dev.auth0.com/',
    sub: 'enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B@clients',
    aud: 'https://m2m.topcoder-dev.com/',
    iat: 1550906388,
    exp: 1591052211,
    azp: 'enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B',
    scope: 'read:scheduled_task',
    gty: 'client-credentials',
    userId: null,
    scopes: ['read:scheduled_task'],
    isMachine: true
  },
  m2mModify: {
    iss: 'https://topcoder-dev.auth0.com/',
    sub: 'enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B@clients',
    aud: 'https://m2m.topcoder-dev.com/',
    iat: 1550906388,
    exp: 1591052211,
    azp: 'enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B',
    scope: 'create:scheduled_task update:scheduled_task delete:scheduled_task',
    gty: 'client-credentials',
    userId: null,
    scopes: ['create:scheduled_task', 'update:scheduled_task', 'delete:scheduled_task'],
    isMachine: true
  }
}

const scheduledTask = {
  allFields: ['headers', 'methodType', 'endpoint', 'payload', 'status', 'scheduledTime'],
  requiredFields: ['methodType', 'endpoint', 'scheduledTime'],
  stringFields: ['methodType', 'endpoint', 'status'],
  dateFields: ['scheduledTime'],
  objectFields: ['payload', 'headers'],
  testBody: {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    methodType: 'POST',
    payload: {
      key: 'value'
    },
    endpoint: 'https://api.topcoder.com/v4/challenges/30102653',
    status: 'ready',
    scheduledTime: '2030-01-01T02:00:00.000Z'
  }
}

module.exports = {
  token,
  user,
  scheduledTask
}
