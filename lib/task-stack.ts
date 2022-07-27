import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_codecommit as codecommit } from 'aws-cdk-lib';
import { aws_athena as athena } from 'aws-cdk-lib';
import { aws_lakeformation as lakeformation } from 'aws-cdk-lib';
import { Bucket, BucketEncryption, BucketPolicy, IBucket } from "aws-cdk-lib/aws-s3";
import { aws_glue as glue } from 'aws-cdk-lib';

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
          bucketName: `${Stack.of(this).account}-${Stack.of(this).stackName}-${Stack.of(this).region}-datalake`,
        });


        //   //create user
          const IAMAdmin = new iam.CfnUser(this, 'AdminUser', {
            loginProfile: {
              password: 'Senhamsb1*',
              passwordResetRequired: false,
            },
            policies: [{
              policyDocument: {
                "Version": "2012-10-17",
                "Statement": [
                    {
                      //TODO apply least privilege
                        "Sid": "policies",
                        "Effect": "Allow",
                        "Action": [
                            "*"
                        ],
                        "Resource": [
                         '*'
                        ]
                    }
                ]
            },
              policyName: 'policyName',
            }],
            userName: `${Stack.of(this).account}-${Stack.of(this).stackName}-${Stack.of(this).region}-Admin`,
          });
        const cfnDataLakeSettings = new lakeformation.CfnDataLakeSettings(this, 'MyCfnDataLakeSettings', /* all optional props */ {
          admins: [{
            dataLakePrincipalIdentifier: IAMAdmin.attrArn,
          }],
          trustedResourceOwners: ['arn:aws:iam::363434358349:role/cdk-hnb659fds-cfn-exec-role-363434358349-eu-west-2'],
        });
        const cfnResource = new lakeformation.CfnResource(this, 'LakeFormationDataBucket', {
          resourceArn: s3Bucket.bucketArn,
          useServiceLinkedRole: true,
        });
        cfnResource.addDependsOn(cfnDataLakeSettings);
      //console.log(s3Bucket.bucketName)

        //creating database
        const cfnDatabase = new glue.CfnDatabase(this, 'Database', {
          catalogId: Stack.of(this).account,
          databaseInput: {
            name: "cdk"
        }});

        // //creating table
        const cfnTable = new glue.CfnTable(this, 'Table', {
          catalogId: Stack.of(this).account,
          databaseName: cfnDatabase.ref,
          tableInput: {
            name: 'namei',
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
          }});
          cfnTable.addDependsOn(cfnResource);


          const WorkGroup = new athena.CfnWorkGroup(this, 'WorkGroup', {
            name: "WorkGroups",
            state: "ENABLED",
            workGroupConfiguration: {
                resultConfiguration: {
                    outputLocation: `s3://${s3Bucket.bucketName}/outputs/`
                }
            }
          });
          //creating query
          // const cfnNamedQuery = new athena.CfnNamedQuery(this, 'MyCfnNamedQuerys', {
          //   database: cfnDatabase.ref,
          //   queryString: `SELECT * FROM ${cfnDatabase.ref}.${cfnTable.ref} limit 3;`,
          //   name: "query",
          //   workGroup: WorkGroup.ref,
          // });

        //   //create user
        //   const IAMUser = new iam.CfnUser(this, 'ReaderUser', {
        //     loginProfile: {
        //       password: 'Senhamsb1*',
        //       passwordResetRequired: false,
        //     },
        //     policies: [{
        //       policyDocument: {
        //         "Version": "2012-10-17",
        //         "Statement": [
        //             {
        //                 "Sid": "athenapolicies",
        //                 "Effect": "Allow",
        //                 "Action": [
        //                     "athena:StartQueryExecution",
        //                     "athena:GetQueryExecution",
        //                     "athena:GetQueryResults",
        //                     "athena:ListNamedQueries",
        //                     "athena:GetWorkGroup",
        //                     "athena:ListWorkGroups",
        //                     "athena:UpdateNamedQuery",
        //                     "athena:GetNamedQuery",
        //                     "athena:BatchGetNamedQuery"
        //                 ],
        //                 "Resource": [
        //                   `arn:aws:athena:*:*:workgroup/primary`,
        //                   `arn:aws:athena:*:*:workgroup/${WorkGroup.ref}`,
        //                   `arn:aws:glue:*:*:table/${cfnDatabase.ref}/${cfnTable.ref}`,
        //                   `arn:aws:glue:*:*:database/${cfnDatabase.ref}`,
        //                   `arn:aws:glue:*:*:catalog`
        //                 ]
        //             },
        //             {
        //                 "Sid": "gluepolicies",
        //                 "Effect": "Allow",
        //                 "Action": [
        //                     "glue:GetTables",
        //                     "glue:GetTable",
        //                     "glue:GetDatabases",
        //                     "glue:GetDatabase"
        //                 ],
        //                 "Resource": [
        //                   `arn:aws:athena:*:*:workgroup/primary`,
        //                   `arn:aws:athena:*:*:workgroup/${WorkGroup.ref}`,
        //                   `arn:aws:glue:*:*:table/${cfnDatabase.ref}/${cfnTable.ref}`,
        //                   `arn:aws:glue:*:*:database/${cfnDatabase.ref}`,
        //                   `arn:aws:glue:*:*:catalog`
        //                 ]
        //             },
        //             {
        //                 "Sid": "LakeformationPolicies",
        //                 "Effect": "Allow",
        //                 "Action": [
        //                     "lakeformation:GetDataAccess"
        //                 ],
        //                 "Resource": [
        //                   '*'
        //                 ]
        //             },
        //             {
        //                 "Sid": "s3policies",
        //                 "Effect": "Allow",
        //                 "Action": "s3:*",
        //                 "Resource": /*[
        //                   "arn:aws:s3:::${s3Bucket.ref}",
        //                   "arn:aws:s3:::${s3Bucket.ref}/*"
        //                 ]*/
        //                 "*"
        //             }
        //         ]
        //     },
        //       policyName: 'policyName',
        //     }],
        //     userName: `${Stack.of(this).account}-${Stack.of(this).stackName}-${Stack.of(this).region}-Reader`,
        //   });

          // //granting permissions
          // const cfnPermissions = new lakeformation.CfnPermissions(this, 'MyCfnPermissions', {
          //   dataLakePrincipal: {
          //     dataLakePrincipalIdentifier: IAMUser.attrArn,
          //   },
          //   resource: {
          //     /*databaseResource: {
          //       catalogId: Stack.of(this).account,
          //       name: cfnDatabase.ref,
          //     },*/
          //     // dataLocationResource: {
          //     //   catalogId: Stack.of(this).account,
          //     //   s3Resource: `s3://${s3Bucket.bucketArn}/folder_task3/`,
          //     // },
          //     /*tableResource: {
          //       catalogId: Stack.of(this).account,
          //       databaseName: cfnDatabase.ref,
          //       name: cfnTable.ref,
          //       //tableWildcard: { excludedColumnNames: ['1','2','3','4','5'] },
          //     },*/
          //     tableWithColumnsResource: {
          //       catalogId: Stack.of(this).account,
          //       columnNames: ['1','2','3','4','5','6','7','8','9','10','11'],
          //       columnWildcard: {
          //         excludedColumnNames: ['1','2','3','4','5'],
          //       },
          //       databaseName: cfnDatabase.ref,
          //       name: cfnTable.ref
          //     },
          //   },
          // });

          //creating permission
          /*const cfnPermissions = new lakeformation.CfnPermissions(this, 'MyCfnPermissions', {
            dataLakePrincipal: {
                dataLakePrincipalIdentifier: IAMUser.attrArn,
            },
            resource: {
                tableWithColumnsResource: {
                    catalogId: Stack.of(this).account,
                    columnNames: ['1','2','3','4','5','6','7','8','9','10','11'],
                    //table.columns.map(col => col.name),
                    columnWildcard: {
                        excludedColumnNames: ['1','2','3','4','5'],
                    },
                    databaseName: cfnDatabase.ref,
                    name: cfnTable.ref
                },
            },
          });
          cfnPermissions.addDependsOn(cfnDatabase);*/

  }
}