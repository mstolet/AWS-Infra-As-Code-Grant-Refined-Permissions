import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TaskStack } from '../lib/task-stack';

const app = new cdk.App();

new TaskStack(app, 'TaskStack', {
  env: { account: '363434358349', region: 'eu-central-1' }
})

