/**
 * Create a stack using CDK framework.
 */

const sfn = require('@aws-cdk/aws-stepfunctions');
const apigateway = require('@aws-cdk/aws-apigateway');
const lambda = require('@aws-cdk/aws-lambda');
const cdk = require('@aws-cdk/core');
const dynamodb = require('@aws-cdk/aws-dynamodb');

class MainStack extends cdk.Stack {
  constructor(app, id) {
    super(app, id);

    // dynamo table for historical records
    const table = new dynamodb.Table(this, 'Scheduler', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const lambdaCode = new lambda.AssetCode('dist');

    // Check if STATE_MACHINE_ARN exists
    if (!process.env.STATE_MACHINE_ARN) {
      throw new Error('STATE_MACHINE_ARN is not defined');
    }

    const state = sfn.StateMachine.fromStateMachineArn(this, 'StateMachine', process.env.STATE_MACHINE_ARN);

    // submit lambda connected with api gateway
    const submitLambda = new lambda.Function(this, `submit-lambda`, {
      code: lambdaCode,
      handler: 'submit-lambda.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        STATE_MACHINE_ARN: state.stateMachineArn,
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadWriteData(submitLambda);
    state.grantStartExecution(submitLambda);
    const api = new apigateway.RestApi(this, 'api', {
      restApiName: `api`,
    });

    const resource = api.root.addResource('schedule');

    const apiLambdaIntegration = new apigateway.LambdaIntegration(submitLambda);
    resource.addMethod('POST', apiLambdaIntegration);
  }
}

const cdkApp = new cdk.App();
// tslint:disable-next-line:no-unused-expression
new MainStack(cdkApp, 'scheduler-api');
cdkApp.synth();
