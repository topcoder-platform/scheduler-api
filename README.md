# Schedule API

This API is part of the Scheduler Processor -> Schedule API -> Schedule Executor triage of modules. This module is responsible to create the events in AWS Step functions, which are later executed by the [Executor](https://github.com/topcoder-platform/schedule-executor)

## Requirements

- [Schedule Executor](https://github.com/topcoder-platform/schedule-executor)
- node v10
- cdk:
  - `npm i -g aws-cdk`
- postman for testing https://www.getpostman.com/

## Environment Variables

TABLE_NAME: The name of the dynamodb table  
STATE_MACHINE_ARN: The ARN of the [schedule executor](https://github.com/topcoder-platform/schedule-executor)

## Deploy

```bash
yarn
yarn run build
cdk bootstrap
cdk deploy
```

## Lint

Execute `yarn run lint`

## Destroy instances

**WARNING** This will destroy all resources created in the earlier `cdk deploy` step

Run `cdk destroy` to clean up AWS resources.

### Notes

- scheduleTime cannot be longer than 1 year.
- It's allowed to use past date for scheduleTime and it will execute immediately. It's better to omit validation because of network delays. For example: submit  a request with date "now +2 seconds", it can fail if there are e.g. network delays.
