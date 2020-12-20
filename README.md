# Schedule API

## Requirements

- [Schedule Executor](https://github.com/topcoder-platform/schedule-executor)
- node v10
- cdk:
  - `npm i -g aws-cdk`
  - `cdk bootstrap`
- postman for testing https://www.getpostman.com/

## Environment Variables

TABLE_NAME: The name of the dynamodb table  
STATE_MACHINE_ARN: The ARN of the [schedule executor](https://github.com/topcoder-platform/schedule-executor)

## Deploy

```bash
yarn
yarn run build
cdk deploy
```

## Lint

Execute `yarn run lint`

## Destroy

**WARNING** This will destroy all resources created in the earlier `cdk deploy` step

Run `cdk destroy` to clean up AWS resources.
