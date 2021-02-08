/**
 * Contains only shared typescript definitions.
 */

export interface AuthResponseContext {
  [name: string]: any;
}

export interface InputData {
  id: string;
  method: 'get' | 'put' | 'post' | 'delete' | 'patch';
  url: string;
  payload?: string;
  headers?: { [x: string]: string };
  scheduleTime: string;
  externalId?: string;
}

export interface APIGatewayEventRequestContext {
  accountId: string;
  apiId: string;
  authorizer?: AuthResponseContext | null;
  connectedAt?: number;
  connectionId?: string;
  domainName?: string;
  eventType?: string;
  extendedRequestId?: string;
  httpMethod: string;
  identity: {
    accessKey: string | null;
    accountId: string | null;
    apiKey: string | null;
    apiKeyId: string | null;
    caller: string | null;
    cognitoAuthenticationProvider: string | null;
    cognitoAuthenticationType: string | null;
    cognitoIdentityId: string | null;
    cognitoIdentityPoolId: string | null;
    sourceIp: string;
    user: string | null;
    userAgent: string | null;
    userArn: string | null;
  };
  messageDirection?: string;
  messageId?: string | null;
  path: string;
  stage: string;
  requestId: string;
  requestTime?: string;
  requestTimeEpoch: number;
  resourceId: string;
  resourcePath: string;
  routeKey?: string;
}

export interface APIGatewayProxyEvent {
  body: string | null;
  headers: { [name: string]: string };
  multiValueHeaders: { [name: string]: string[] };
  httpMethod: string;
  isBase64Encoded: boolean;
  path: string;
  pathParameters: { [name: string]: string } | null;
  queryStringParameters: { [name: string]: string } | null;
  multiValueQueryStringParameters: { [name: string]: string[] } | null;
  stageVariables: { [name: string]: string } | null;
  requestContext: APIGatewayEventRequestContext;
  resource: string;
}
