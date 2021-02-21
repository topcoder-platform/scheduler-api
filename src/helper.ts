/**
 * Helper methods.
 */

import crypto from 'crypto';
import _ from 'lodash';
import querystring from 'querystring';
import { APIGatewayProxyEvent } from './types';
import { getAllowedRoles, getAPIBaseURL, getDynamoTableName } from './config';
import AWS from 'aws-sdk';

/**
 * Create a random string.
 * @param  length the string length.
 * @returns the random string.
 */
export function randomString(length: number) {
  const chars = 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
  const randomBytes = crypto.randomBytes(length);
  const result = new Array(length);
  let cursor = 0;
  for (let i = 0; i < length; i++) {
    cursor += randomBytes[i];
    result[i] = chars[cursor % chars.length];
  }
  return result.join('');
}

/**
 * Scan all from dynamo
 * @param dynamodb the dynamo db instance
 */
export async function scanAll(dynamodb: import("aws-sdk/clients/dynamodb")) {
  interface row {
    id: string,
    externalId: string,
    input: string
  }
  let data = []
  //scan the table
  const result = await dynamodb.scan({
    TableName: getDynamoTableName()
  }).promise();
  if (!result.Items)
    return []
  for (let item of result.Items) {
    item = AWS.DynamoDB.Converter.unmarshall(item);
    const row = item as unknown as row;
    data.push(JSON.parse(row.input));
  }
  //continue scanning if there is more data to come
  let lastKey = result.LastEvaluatedKey;
  while (lastKey) {
    const newResult = await dynamodb.scan({
      TableName: getDynamoTableName(),
      ExclusiveStartKey: lastKey
    }).promise();
    lastKey = newResult.LastEvaluatedKey;
    for (let item of result.Items) {
      item = AWS.DynamoDB.Converter.unmarshall(item);
      const row = item as unknown as row;
      data.push(JSON.parse(row.input));
    }
  }
  return data;
}

/**
 * Wrap fn and return result for API Gateway.
 * @param fn the function to wrap
 */
export async function processAPILambda(fn: () => Promise<any>) {
  try {
    const result = await fn();
    const response:any = {
      statusCode: 200,
      headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      }
    };
    if (_.get(result, 'header'))
      response.headers = {
        ...response.headers,
        ...result.header
      };
    if (_.get(result, 'body'))
      response.body = JSON.stringify(result.body);
    return response;
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
    return {
      statusCode: e.statusCode || 500,
      headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error: e.message,
      }),
    };
  }
}

/**
 * Set HTTP response headers from result.
 * @param {Object} event the HTTP request
 * @param {Object} result the operation result
 */
export function makeHeaders(event: APIGatewayProxyEvent, result: { total: any; page: any; perPage: any; }) {
  var header: { [k: string]: any } = {};
  const totalPages = Math.ceil(result.total / result.perPage)
  if (parseInt(result.page, 10) > 1) {
    header['X-Prev-Page'] = parseInt(result.page, 10) - 1;
  }
  if (parseInt(result.page, 10) < totalPages) {
    header['X-Next-Page'] = parseInt(result.page, 10) + 1;
  }
  header['X-Page'] = parseInt(result.page, 10);
  header['X-Per-Page'] = result.perPage;
  header['X-Total'] = result.total;
  header['X-Total-Pages'] = totalPages;
  // set Link header
  if (totalPages > 0) {
    let link = `<${getPageLink(event, 1)}>; rel="first", <${getPageLink(event, totalPages)}>; rel="last"`
    if (parseInt(result.page, 10) > 1) {
      link += `, <${getPageLink(event, parseInt(result.page, 10) - 1)}>; rel="prev"`
    }
    if (parseInt(result.page, 10) < totalPages) {
      link += `, <${getPageLink(event, parseInt(result.page, 10) + 1)}>; rel="next"`
    }
    header.link = link;
  }
  return header;
}

/**
 * Get link for a given page.
 * @param {Object} req the HTTP request
 * @param {Number} page the page number
 * @returns {String} link for the page
 */
function getPageLink(req: APIGatewayProxyEvent, page: number) {
  const q = _.assignIn({}, req.queryStringParameters, { page })
  return `${getAPIBaseURL()}${req.path}?${querystring.stringify(q)}`
}


/**
 * Check if the user has admin role
 * @param {Object} authUser the user
 */
export function hasAdminRole (authUser:any) {
  if (authUser && authUser.roles) {
    for (let i = 0; i < authUser.roles.length; i++) {
      if (getAllowedRoles().includes(authUser.roles[i].toLowerCase())) {
        return true
      }
    }
  }
  return false
}
