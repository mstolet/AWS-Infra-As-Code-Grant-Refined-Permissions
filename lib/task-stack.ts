import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as athena from 'aws-cdk-lib/aws-athena';

export class TaskStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
        //Creates a repo
        const CodeCommitRepository = new codecommit.CfnRepository(this, 'Repo_task3', {
          repositoryName: "Repo_task3"
        });
    
        //create user
        const IAMUser = new iam.CfnUser(this, 'IAMUser', {
          path: "/",
          userName: "SensitiveReader",
          //groups: [
            //  "Task_Data_Lake_task3"
          //],
          managedPolicyArns: [
              "arn:aws:iam::aws:policy/AmazonS3FullAccess",
              "arn:aws:iam::aws:policy/AmazonAthenaFullAccess"
          ]
        });
     
        //Creates an Athena workgroup
        const AthenaWorkGroup = new athena.CfnWorkGroup(this, 'AthenaWorkGroup', {
          name: "AthenaWorkGroup",
          state: "ENABLED",
          workGroupConfiguration: {
              bytesScannedCutoffPerQuery: 1099511627776000,
              enforceWorkGroupConfiguration: false,
              publishCloudWatchMetricsEnabled: true,
              requesterPaysEnabled: false,
              resultConfiguration: {
                  outputLocation: "s3://testbucket2/"
              }
          }
      });
  }
}

