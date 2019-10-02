# Topcoder Autopilot Schedule V5 API

## Postman test

- import Postman collection and environment in the docs folder to Postman
- Refer `ReadMe.md` to start the app
- Run `npm run init-db` to clear the database.
- Run `npm run test-data` to insert test data into database.
- Just run the test cases one by one(from up to down).

## Unit Test Coverage Report

  56 passing (32s)

File                       |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s
---------------------------|----------|----------|----------|----------|-------------------
All files                  |    74.75 |     57.5 |    79.07 |    75.51 |
 schedule-api              |      100 |      100 |      100 |      100 |
  app-bootstrap.js         |      100 |      100 |      100 |      100 |
  app-constants.js         |      100 |      100 |      100 |      100 |
 schedule-api/config       |      100 |      100 |      100 |      100 |
  default.js               |      100 |      100 |      100 |      100 |
 schedule-api/src/common   |    64.58 |    37.04 |    72.73 |    65.96 |
  errors.js                |      100 |       50 |      100 |      100 |                23
  helper.js                |     30.3 |    13.33 |       50 |    31.75 |... 70,172,173,175
  logger.js                |    92.65 |    68.18 |      100 |    92.65 |   31,57,62,86,120
 schedule-api/src/models   |      100 |      100 |      100 |      100 |
  ScheduledTask.js         |      100 |      100 |      100 |      100 |
  index.js                 |      100 |      100 |      100 |      100 |
 schedule-api/src/services |      100 |      100 |      100 |      100 |
  ScheduledTaskService.js  |      100 |      100 |      100 |      100 |

## E2E Test Coverage Report

  110 passing (23s)

File                          |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s
------------------------------|----------|----------|----------|----------|-------------------
All files                     |    93.81 |     78.4 |    98.36 |    93.69 |
 schedule-api                 |    93.94 |    71.11 |      100 |    93.75 |
  app-bootstrap.js            |      100 |      100 |      100 |      100 |
  app-constants.js            |      100 |      100 |      100 |      100 |
  app-routes.js               |    94.12 |    77.27 |      100 |    94.12 |          24,45,52
  app.js                      |    91.43 |    65.22 |      100 |    91.43 |          40,50,54
 schedule-api/config          |      100 |      100 |      100 |      100 |
  default.js                  |      100 |      100 |      100 |      100 |
 schedule-api/src             |      100 |      100 |      100 |      100 |
  routes.js                   |      100 |      100 |      100 |      100 |
 schedule-api/src/common      |    90.97 |    74.07 |    96.97 |    90.78 |
  errors.js                   |      100 |       50 |      100 |      100 |                23
  helper.js                   |    87.88 |    76.67 |    94.44 |     87.3 |... ,58,62,108,126
  logger.js                   |    92.65 |    72.73 |      100 |    92.65 |   31,57,62,86,120
 schedule-api/src/controllers |      100 |      100 |      100 |      100 |
  ScheduledTaskController.js  |      100 |      100 |      100 |      100 |
 schedule-api/src/models      |      100 |      100 |      100 |      100 |
  ScheduledTask.js            |      100 |      100 |      100 |      100 |
  index.js                    |      100 |      100 |      100 |      100 |
 schedule-api/src/services    |      100 |      100 |      100 |      100 |
  ScheduledTaskService.js     |      100 |      100 |      100 |      100 |
