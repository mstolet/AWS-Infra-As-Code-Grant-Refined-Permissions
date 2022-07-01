import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TaskStack } from '../lib/task-stack';
//import { S3BucketStack } from '../lib/s3-stack';
import 'source-map-support/register';

const app = new cdk.App();
new TaskStack(app, 'TaskStack', {
  env: { account: '363434358349', region: 'eu-central-1' }
})
