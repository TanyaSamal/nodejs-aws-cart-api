#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsStack } from '../lib/aws-stack';

const app = new cdk.App();
new AwsStack(app, 'AwsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
