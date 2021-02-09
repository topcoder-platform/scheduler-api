/**
 * Represents a lambda handler responsible for receiving events from
 * API Gateway and initiating step function.
 */
import { URL } from 'url';
import AWS from 'aws-sdk';
import { load } from 'js-yaml';
// import { middleware} from 'tc-core-library-js';
import { processAPILambda, randomString, makeHeaders, scanAll } from './helper';
import { APIGatewayProxyEvent, InputData } from './types';
import { BadRequestError, NotFoundError } from './errors';
import { getDynamoTableName, getStateMachineARN, getSwaggerPath } from './config';
import _ from 'lodash';

// const authenticator = middleware.jwtAuthenticator;

const dynamodb = new AWS.DynamoDB({
  region: process.env.DYNAMODB_REGION
});
const sfn = new AWS.StepFunctions();
const s3 = new AWS.S3();

/**
 * Check if given url is valid HTTP or HTTPs url.
 * @param url the url to check
 */
function _isValidUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Bearer authentication check
 * @param headers the headers
 */
// async function authCheck (headers: { [x: string]: string }) {
//   return new Promise((resolve, reject) => {
//     const res = {
//       send: () => reject(new UnauthorizedError('Invalid or missing token'))
//     }
//     authenticator({
//       AUTH_SECRET: getAuthSecret(),
//       VALID_ISSUERS: getValidIssuers()
//     })({ headers }, res, (req: any) => resolve(req.authUser))
//   })
// }

/**
 * Check if request body is valid.
 * @param body the request body
 */
async function _validateInput(body: string | null) {
  console.log('inside _validateInput')
  let input: InputData = null!;
  if (!body) {
    throw new BadRequestError('HTTP body must be defined');
  }
  console.log('before parsing body')
  try {
    if (_.isString(body)) {
      console.log('trying to parse the body')
      input = JSON.parse(body);
    } else {
      input = body
    }
  } catch (e) {
    throw new BadRequestError('Invalid JSON body');
  }
  // if (input.headers) {
  //   const authRes:any = await authCheck(input.headers)
  //   if (authRes.authUser.isMachine && _.intersection(authRes.authUser.scopes, getAllowedScopes()).length === 0) {
  //     throw new ForbiddenError('You are not allowed to perform this operation')
  //   } else if (!hasAdminRole(authRes.authUser)) {
  //     throw new ForbiddenError('You are not allowed to perform this operation')
  //   }
  // } else
  //   throw new UnauthorizedError('Authentication is required')
  if (!input.url) {
    throw new BadRequestError('url is required');
  }
  if (!_isValidUrl(input.url)) {
    throw new BadRequestError('url is invalid');
  }
  if (!input.method) {
    throw new BadRequestError('method is required');
  }
  const allowedMethods = ['get', 'put', 'post', 'delete', 'patch'];
  if (!allowedMethods.includes(input.method)) {
    throw new BadRequestError(`method '${input.method}' is not valid. Allowed values: ${allowedMethods.join(', ')}.`
    );
  }
  if (input.payload != null && typeof input.payload !== 'string') {
    throw new BadRequestError('payload must be a string');
  }
  if (input.payload && input.method === 'get') {
    throw new BadRequestError('payload is not allowed for "get" method');
  }
  if (input.headers != null) {
    if (typeof input.headers !== 'object') {
      throw new BadRequestError('headers must be an object');
    }
    Object.entries(input.headers).forEach(([key, value]) => {
      if (typeof value !== 'string') {
        throw new BadRequestError(`header value ${key} must be a string`);
      }
    });
  }

  if (input.scheduleTime == null) {
    throw new BadRequestError('scheduleTime is required');
  } else {
    const date = new Date(input.scheduleTime);
    if (date.toString() === 'Invalid Date') {
      throw new BadRequestError('scheduleTime is invalid date');
    }
    // max schedule date can be max 1 year ahead
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (date.getTime() > maxDate.getTime()) {
      throw new BadRequestError(
        'scheduleTime delay is too long. Max schedule is 1 year.'
      );
    }
    input.scheduleTime = date.toISOString();
  }
  console.log('completed')

  return input;
}

/**
 * Submit schedule event.
 * @param event APIGatewayProxyEvent
 */
async function createEvent(event: APIGatewayProxyEvent) {
  console.log('Inside createEvent')
  if (event.isBase64Encoded) {
    throw new BadRequestError('Binary data not supported.');
  }
  console.log('before calling _validateInput')
  const input = await _validateInput(event.body);
  const id = randomString(20);
  input.id = id;
  const serialized = JSON.stringify(input);

  console.log('before calling dynamodb.putItem')
  const dynamoObj:any = {
    id: { S: id },
    input: { S: serialized }
  };
  if (input.externalId) {
    dynamoObj.externalId = { S: input.externalId };
  }
  //register event for create
  console.log('before calling sfn.startExecution')
  const res = await sfn
    .startExecution({
      input: serialized,
      stateMachineArn: getStateMachineARN(),
    })
    .promise();
  dynamoObj.executionArn = { S: res.executionArn };
  await dynamodb
    .putItem({
      TableName: getDynamoTableName(),
      Item: dynamoObj,
    })
    .promise();
  console.log('completed')
  return { body: { id: id } };
}

/**
 * Get schedule event.
 * @param event APIGatewayProxyEvent
 */
async function searchEvents(event: APIGatewayProxyEvent) {
  console.log('Inside searchEvents')
  if (!event.queryStringParameters || !event.queryStringParameters.externalId)
    throw new BadRequestError(
      'externalId is required'
    );
  //page parameters for pagination
  const page = +event.queryStringParameters.page || 1
  const perPage = +event.queryStringParameters.perPage || 50
  const externalId = event.queryStringParameters.externalId

  console.log('before calling scanAll')
  let data = await scanAll(dynamodb)
  data = _.filter(data, e => externalId === e.externalId)
  const total = data.length
  //return 404 if event not exists
  if (total == 0) {
    throw new NotFoundError('schedule with the given id is not found.');
  }
  //apply the pagination logic
  const results = data.slice((page - 1) * perPage, page * perPage)
  console.log('before calling makeHeaders')
  const headers = makeHeaders(event, { total, page, perPage })
  console.log('completed')
  return { header: headers, body: results }
}

/**
 * Delete schedule event.
 * @param event APIGatewayProxyEvent
 */
async function deleteEvent(event: APIGatewayProxyEvent) {
  console.log('Inside deleteEvent')
  if (event.isBase64Encoded) {
    throw new BadRequestError('Binary data not supported.');
  }
  console.log('before calling _validateInput')
  const input = await _validateInput(event.body);
  const id = input.id;
  //delete event by id
  console.log('before calling dynamodb.deleteItem')

  const res = await dynamodb.deleteItem({
    TableName: getDynamoTableName(),
    Key: {
      id: { S: id },
    },
    ReturnValues: 'ALL_OLD'
  }).promise();
  //return 404 if event not exists
  if (res.Attributes == null)
    throw new NotFoundError('event to delete is not found.');
  const arn:any = res.Attributes.executionArn
  await sfn.stopExecution({
    executionArn: arn
  }, () => {}).promise()
  console.log('completed!')
}

/**
 * Main lambda handler for submitting.
 */
export async function handler(event: APIGatewayProxyEvent) {
  console.log('Inside handler')
  if (event.path === '/v5/schedules' && event.httpMethod === 'POST') {
    return await processAPILambda(async () => createEvent(event));
  }
  if (event.path === '/v5/schedules' && event.httpMethod === 'GET') {
    return await processAPILambda(async () => searchEvents(event));
  }
  if (event.path === '/v5/schedules' && event.httpMethod === 'DELETE') {
    return await processAPILambda(async () => deleteEvent(event));
  }
  if (event.path === '/v5/schedules/docs' && event.httpMethod === 'GET') {
    const data = await s3.getObject(getSwaggerPath()).promise()
    const swagger = load(data.Body?.toString('utf-8') || '{}');
    return {
      statusCode: 200,
      body: JSON.stringify(swagger),
    };
  }
  if (event.path === '/v5/schedules/health' && event.httpMethod === 'GET') {
    try {
      await dynamodb.scan({ TableName: getDynamoTableName(), Limit: 1 }).promise();
      return {
        statusCode: 200,
        body: JSON.stringify({ checksRun: 1 })
      }
    } catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: e.message })
      }
    }
  }
  return {
    statusCode: 404,
    body: JSON.stringify({
      error: 'The requested resource cannot found.',
    }),
  };
}
