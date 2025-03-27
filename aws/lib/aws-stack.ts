import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  FunctionUrlAuthType,
  HttpMethod,
  Runtime,
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';

export class AwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new NodejsFunction(this, 'NestJsLambdaServer', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/lambda.ts'),
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        DB_HOST: process.env.DB_HOST!,
        DB_PORT: process.env.DB_PORT!,
        DB_NAME: process.env.DB_NAME!,
        DB_USERNAME: process.env.DB_USERNAME!,
        DB_PASSWORD: process.env.DB_PASSWORD!,
      },
      bundling: {
        externalModules: [
          'aws-sdk',
          '@nestjs/microservices',
          '@nestjs/websockets/socket-module',
        ],
        minify: true,
        sourceMap: true,
      },
    });

    const fnUrl = handler.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [HttpMethod.ALL],
        allowedHeaders: ['*'],
      },
    });

    new cdk.CfnOutput(this, 'FunctionUrl', {
      value: fnUrl.url,
      description: 'URL for the Lambda function',
    });
  }
}
