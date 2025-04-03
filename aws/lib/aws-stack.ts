import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  FunctionUrlAuthType,
  HttpMethod,
  Runtime,
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export class AwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dbSG = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'RDSSecurityGroup',
      'sg-08bfb890199722f75',
    );

    dbSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from Lambda',
    );

    const handler = new NodejsFunction(this, 'NestJsLambdaServer', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../dist/lambda.js'),
      depsLockFilePath: path.join(__dirname, '../../package-lock.json'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        DB_HOST: process.env.DB_HOST!,
        DB_PORT: process.env.DB_PORT!,
        DB_NAME: process.env.DB_NAME!,
        DB_USER: process.env.DB_USER!,
        DB_PASS: process.env.DB_PASS!,
      },
      bundling: {
        externalModules: [
          '@aws-sdk/*',
          'aws-sdk',
          'class-transformer',
          'class-validator',
        ],
        nodeModules: [
          '@nestjs/core',
          '@nestjs/common',
          '@nestjs/platform-express',
          'reflect-metadata',
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
