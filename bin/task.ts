import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TaskStack } from '../lib/task-stack';

const app = new cdk.App();

new TaskStack(app, 'datalake', {
})

