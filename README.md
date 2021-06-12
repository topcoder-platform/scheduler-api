
# Topcoder AutoPilot - Schedule API

This API is part of the Scheduler Processor -> Schedule API -> Schedule Executor triage of modules. This module is responsible to create the events in AWS Step functions, which are later executed by the [Executor](https://github.com/topcoder-platform/schedule-executor)

## Development status

[![Total alerts](https://img.shields.io/lgtm/alerts/g/topcoder-platform/scheduler-api.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/topcoder-platform/scheduler-api/alerts/)[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/topcoder-platform/scheduler-api.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/topcoder-platform/scheduler-api/context:javascript)

### Deployment status

Dev: [![CircleCI](https://circleci.com/gh/topcoder-platform/scheduler-api/tree/develop.svg?style=svg)](https://circleci.com/gh/topcoder-platform/scheduler-api/tree/develop) Prod: [![CircleCI](https://circleci.com/gh/topcoder-platform/scheduler-api/tree/master.svg?style=svg)](https://circleci.com/gh/topcoder-platform/scheduler-api/tree/master)

## Requirements

- [Schedule Executor](https://github.com/topcoder-platform/schedule-executor)
- node v10
- postman for testing https://www.getpostman.com/

## Environment Variables

- `TABLE_NAME`: The name of the dynamodb table  
- `STATE_MACHINE_ARN:` The ARN of the [schedule executor](https://github.com/topcoder-platform/schedule-executor)
- `S3_BUCKET`: The bucket name of the swagger file
- `LAMBDA_ROLE`: Lambda function's execution role
- `REGION` : Region name where API will run.
- `DYNAMODB_REGION`: Region name where Dynamodb will run.
- `API_BASE_URL`: The API Base URL.
- `AUTH_SECRET`: The authorization secret used during token verification.
- `VALID_ISSUERS`: The valid issuers of tokens.
- `VALID_SCOPES`: The valid scopes of tokens.
- `VALID_ROLES`: The valid roles of tokens.

## Deploy
- Make sure to use Node v10+ by command `node -v`. We recommend using [NVM](https://github.com/nvm-sh/nvm) to quickly switch to the right version:

   ```bash
   nvm use
   ```
- In the `scheduler-api` root directory create `.env` file with the next environment variables. **AUTH_SECRET, VALID_ISSUERS** should be shared with you on the forum.<br>
   ```bash
   LAMBDA_ROLE=
   REGION=
   DYNAMODB_REGION=
   STATE_MACHINE_ARN=
   S3_BUCKET=
   API_BASE_URL=
   AUTH_SECRET=
   VALID_ISSUERS=
   # below are optional
   VALID_SCOPES=
   VALID_ROLES=

   ```
    - Values from this file would be automatically used by `npm` commands.
    - ⚠️ Never commit this file or its copy to the repository!
```bash
npm install
npm run deploy
```

## Destroy instances

**WARNING** This will destroy all resources created in the earlier `npm run deploy` step

Run `npm run destroy` to clean up AWS resources.

It will NOT delete the Table nor the S3 Bucket resources

### Notes

- scheduleTime cannot be longer than 1 year.
- It's allowed to use past date for scheduleTime and it will execute immediately. It's better to omit validation because of network delays. For example: submit  a request with date "now +2 seconds", it can fail if there are e.g. network delays.
