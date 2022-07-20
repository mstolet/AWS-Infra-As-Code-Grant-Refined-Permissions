import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_codecommit as codecommit } from 'aws-cdk-lib';
import { aws_athena as athena } from 'aws-cdk-lib';
import { aws_lakeformation as lakeformation } from 'aws-cdk-lib';
import { Bucket, BucketEncryption, BucketPolicy, IBucket } from "aws-cdk-lib/aws-s3";
import { aws_glue as glue } from 'aws-cdk-lib';

declare const policyDocument: any;

export class TaskStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

        //Creates a repo
        const CodeCommitRepository = new codecommit.CfnRepository(this, 'Repo_task3', {
          repositoryName: "Repo_task3"
        });
  

        //Creating a bucket from faun
        const s3Bucket = new Bucket(this, 'S3Bucket', {
          encryption: BucketEncryption.S3_MANAGED,
          versioned: true,
        });
        
        //Creates an Athena workgroup
        /*const WorkGroup = new athena.CfnWorkGroup(this, 'AthenaWorkGroup', {
          name: "AthenaWorkGroup45",
          state: "ENABLED",
          workGroupConfiguration: {
              resultConfiguration: {
                  outputLocation: `s3://${s3Bucket.bucketName}/outputs/`
               }
          }
      });*/

      const WorkGroup = new athena.CfnWorkGroup(this, 'WorkGroup', {
        name: "WorkGroupFix",
        description: "",
        state: "ENABLED",
        workGroupConfiguration: {
            enforceWorkGroupConfiguration: true,
            publishCloudWatchMetricsEnabled: true,
            requesterPaysEnabled: false,
            resultConfiguration: {
                outputLocation: `s3://${s3Bucket.bucketName}/outputs/`
            }
        }
    });

      //console.log(s3Bucket.bucketName)

      //creating database
      const cfnDatabase = new glue.CfnDatabase(this, 'MyCfnDatabase', {
        catalogId: Stack.of(this).account,
        databaseInput: {
          name: "database_cdk_test"
      }});

      //creating table
      const cfnTable = new glue.CfnTable(this, 'MyCfnTable', {
        catalogId: Stack.of(this).account,
        databaseName: cfnDatabase.ref,
        tableInput: {
          name: 'name',
          owner: Stack.of(this).account,
          storageDescriptor: {
            bucketColumns: ['1','2','3','4','5','6','7','8','9','10','11'],
            "inputFormat": "org.apache.hadoop.mapred.TextInputFormat",
		        "outputFormat": "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
            serdeInfo: {
              "name": "nomenome",
              "serializationLibrary": "org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe",
              "parameters": {
                "field.delim": ",",
                "serialization.format": ","
              }
            },        
            columns: [
              {
                name: "1",
                type: "string"
              },
              {
                name: "2",
                type: "string"
              },
              {
                name: "3",
                type: "string"
              },
              {
                name: "4",
                type: "string"
              },
              {
                name: "5",
                type: "string"
              },
              {
                name: "6",
                type: "string"
              },
              {
                name: "7",
                type: "string"
              },
              {
                name: "8",
                type: "string"
              },
              {
                name: "9",
                type: "string"
              },
              {
                name: "10",
                type: "string"
              },
              {
                name: "11",
                type: "string"
              }
              ],
            compressed: false,
            location: `s3://${s3Bucket.bucketName}/folder_task3/`,         
          },
          //retention: 0,
        }});

        //create user
        const IAMUser = new iam.CfnUser(this, 'UserFix2', {
          loginProfile: {
            password: 'Senhamsb1*',
            passwordResetRequired: false,
          },
          policies: [{
            policyDocument: {
              "Version": "2012-10-17",
              "Statement": [
                  {
                      "Sid": "VisualEditor0",
                      "Effect": "Allow",
                      "Action": [
                          "glue:GetDatabase",
                          "athena:GetWorkGroup",
                          "athena:StartQueryExecution",
                          "athena:GetQueryExecution",
                          "athena:GetQueryResults",
                          "athena:UpdateWorkGroup",
                          "athena:ListNamedQueries",
                          "glue:GetDatabases"
                      ],
                      "Resource": [
                          "arn:aws:athena:*:363434358349:workgroup/*",
                          cfnDatabase.getAtt('arn'),
                          "arn:aws:glue:*:363434358349:catalog"
                      ]
                  },
                  {
                      "Sid": "VisualEditor1",
                      "Effect": "Allow",
                      "Action": [
                          "glue:GetTables",
                          "glue:GetTable"
                      ],
                      "Resource": [
                          "arn:aws:glue:*:363434358349:database/database_cdk_test",
                          "arn:aws:glue:*:363434358349:catalog",
                          "arn:aws:glue:*:363434358349:table/*"
                      ]
                  },
                  {
                      "Sid": "VisualEditor2",
                      "Effect": "Allow",
                      "Action": "s3:*",
                      "Resource": "*"
                  }
              ]
          },
            policyName: 'policyName',
          }],
          userName: 'UserFix2',
        });

      //granting permissions
      const cfnPermissions = new lakeformation.CfnPermissions(this, 'MyCfnPermissions', {
        dataLakePrincipal: {
          dataLakePrincipalIdentifier: IAMUser.attrArn,
        },
        resource: {
          databaseResource: {
            catalogId: Stack.of(this).account,
            name: cfnDatabase.ref,
          },
          dataLocationResource: {
            catalogId: Stack.of(this).account,
            s3Resource: `s3://${s3Bucket.bucketArn}/folder_task3/`,
          },
          tableResource: {
            catalogId: Stack.of(this).account,
            databaseName: cfnDatabase.ref,
            name: 'name',
            tableWildcard: { },
          },
          tableWithColumnsResource: {
            catalogId: Stack.of(this).account,
            columnNames: ['1','2','3','4','5'],
            columnWildcard: {
              excludedColumnNames: ['6','7','8','9','10','11'],
            },
            databaseName: cfnDatabase.ref,
            name: 'name',
          },
        },
      });

        //creating query
        const cfnNamedQuery = new athena.CfnNamedQuery(this, 'MyCfnNamedQuery', {
          database: cfnDatabase.ref,
          queryString: 'SELECT * FROM "database_cdk_test"."table_cdk_test" limit 3;',
          workGroup: WorkGroup.ref,
      });
  }
}