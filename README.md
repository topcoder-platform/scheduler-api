# Topcoder Autopilot Schedule V5 API

## Dependencies

- nodejs https://nodejs.org/en/ (v8)
- DynamoDB
- Docker, Docker Compose

## Configuration

Configuration for the application is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- LOG_LEVEL: the log level, default is 'debug'
- PORT: the server port, default is 3000
- API_VERSION: the api version, default is '/v5'
- AUTH_SECRET: The authorization secret used during token verification.
- VALID_ISSUERS: The valid issuer of tokens, a json array contains valid issuer.
- AWS_ACCESS_KEY_ID: The Amazon certificate key to use when connecting. Use local dynamodb you can set fake value
- AWS_SECRET_ACCESS_KEY: The Amazon certificate access key to use when connecting. Use local dynamodb you can set fake value
- AWS_REGION: The Amazon certificate region to use when connecting. Use local dynamodb you can set fake value
- AWS_READ_UNITS: The DynamoDB table read unit configuration, default is 4
- AWS_WRITE_UNITS: The DynamoDB table write unit configuration, default is 2
- SCHEDULED_TASK_TABLE_NAME: The DynamoDB table name for ScheduledTask model

## DynamoDB Setup

As per spec, you need to use Dynamodb instance hosted on AWS. If you have installed aws-cli on your local environment, after properly configure, you can use the following commands to create table(you can change the table name if you are using different one, make sure it is consistent with SCHEDULED_TASK_TABLE_NAME parameter value in `config/default.js` file).

```bash
# Create ScheduledTasks table
aws dynamodb create-table --table-name ScheduledTasks --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=4,WriteCapacityUnits=2
```

## Local Deployment

- Install dependencies `npm install`
- Run lint `npm run lint`
- Run lint fix `npm run lint:fix`
- Start app `npm start`
- App is running at `http://localhost:3000`
- Clear and init db `npm run init-db`

## Testing

### You need to `stop` the app before running unit or e2e tests

- Run `npm run test` to execute unit tests and generate coverage reports.
- RUN `npm run e2e` to execute e2e tests and generate coverage reports.

## Verification

Refer to the verification document `Verification.md`
