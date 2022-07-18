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
    
        //create user
        const IAMUser = new iam.CfnUser(this, 'IAMUser3', {
          path: "/",
          userName: "SensitiveReader3",
          managedPolicyArns: [
              "arn:aws:iam::aws:policy/AmazonS3FullAccess",
              "arn:aws:iam::aws:policy/AmazonAthenaFullAccess",
              "arn:aws:iam::aws:policy/AWSCodeCommitFullAccess",
              "arn:aws:iam::aws:policy/AWSGlueConsoleFullAccess"
          ]
        });

        //Creating a bucket from faun
        const s3Bucket = new Bucket(this, 'S3Bucket', {
          encryption: BucketEncryption.S3_MANAGED,
          versioned: true,
        });
        
        //Creates an Athena workgroup
        const AthenaWorkGroup = new athena.CfnWorkGroup(this, 'AthenaWorkGroup', {
          name: "AthenaWorkGroup45",
          state: "ENABLED",
          workGroupConfiguration: {
              resultConfiguration: {
                  outputLocation: `s3://${s3Bucket.bucketArn}/`
               }
          }
      });

      //creating database
      const cfnDatabase = new glue.CfnDatabase(this, 'MyCfnDatabase', {
        catalogId: Stack.of(this).account,
        databaseInput: {
          name: "database_cdk_test"
      }});

      const cfnPermissions = new lakeformation.CfnPermissions(this, 'MyCfnPermissions', {
        dataLakePrincipal: {
          dataLakePrincipalIdentifier: IAMUser.attrArn,
        },
        resource: {
          databaseResource: {
            catalogId: Stack.of(this).account,
            name: "database_cdk_test",
          },
          dataLocationResource: {
            catalogId: Stack.of(this).account,
            s3Resource: `s3://${s3Bucket.bucketArn}/`,
          },
          tableResource: {
            catalogId: Stack.of(this).account,
            databaseName: 'databaseName',
            name: 'name',
            tableWildcard: { },
          },
          tableWithColumnsResource: {
            catalogId: Stack.of(this).account,
            columnNames: ['1','2','3','4','5','6','7','8','9','10','11'],
            columnWildcard: {
              excludedColumnNames: ['6','7','8','9','10','11'],
            },
            databaseName: "database_cdk_test",
            name: 'name',
          },
        },
      });

        //creating table
        const GlueTable = new glue.CfnTable(this, 'GlueTable', {
          catalogId: Stack.of(this).account,
          databaseName: "database_cdk_test",
          tableInput: {
              storageDescriptor: {
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
                  location: s3Bucket.bucketArn,
              },
              name: "table_cdk_test"
              //Refer to resource
          }
      });


      /*const GlueTable = new glue.CfnTable(this, 'GlueTable', {
        catalogId: Stack.of(this).account,
        databaseName: "database_cdk_test",
        tableInput: {
            owner: "hadoop",
            tableType: "EXTERNAL_TABLE",
            parameters: {
                external: "TRUE",
                has_encrypted_data: "false",
                //transient_lastDdlTime: "1656951835"
            },
            storageDescriptor: {
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
                location: s3Bucket.bucketArn,
                inputFormat: "org.apache.hadoop.mapred.TextInputFormat",
                outputFormat: "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
                compressed: false,
                numberOfBuckets: -1,
                storedAsSubDirectories: false
            },
            retention: 0,
            name: "tableeee"
        }
    });

    const cfnTable = new glue.CfnTable(this, 'MyCfnTable', {
      catalogId: Stack.of(this).account,
      databaseName: "database_cdk_test",
      tableInput: {
        name: 'name',
        owner: Stack.of(this).account,
        //parameters: parameters,
        //partitionKeys: [{
          //name: 'name',
    
          // the properties below are optional
          //comment: 'comment',
          //type: 'type',
        },
        //retention: 0,
      storageDescriptor: {
        bucketColumns: ['1','2','3','4','5','6','7','8','9','10','11'],
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
          //inputFormat: 'inputFormat',
        location: s3Bucket.bucketArn,
          //numberOfBuckets: 1,
          //outputFormat: 'outputFormat',
          //parameters: parameters,
          /*schemaReference: {
            schemaId: {
              registryName: 'registryName',
              schemaArn: 'schemaArn',
              schemaName: 'schemaName',
            },
            schemaVersionId: 'schemaVersionId',
            schemaVersionNumber: 123,
          },
          serdeInfo: {
            name: 'name',
            parameters: parameters,
            serializationLibrary: 'serializationLibrary',
          },
          skewedInfo: {
            skewedColumnNames: ['skewedColumnNames'],
            skewedColumnValueLocationMaps: skewedColumnValueLocationMaps,
            skewedColumnValues: ['skewedColumnValues'],
          },
          sortColumns: [{
            column: 'column',
            sortOrder: 123,
          }],
          storedAsSubDirectories: false,
        },
        tableType: 'tableType',
        targetTable: {
          catalogId: 'catalogId',
          databaseName: 'databaseName',
          name: 'name',
        },
        viewExpandedText: 'viewExpandedText',
        viewOriginalText: 'viewOriginalText',
      },
    });*/

        //creating query
        const cfnNamedQuery = new athena.CfnNamedQuery(this, 'MyCfnNamedQuery', {
          database: 'database_cdk_test',
          queryString: 'SELECT * FROM "database_cdk_test"."table_cdk_test" limit 3;',
          workGroup: 'AthenaWorkGroup45',
      });
  }
}