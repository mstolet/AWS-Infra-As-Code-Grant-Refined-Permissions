import * as glue_alpha from '@aws-cdk/aws-glue-alpha';
import {
    aws_athena as athena,
    aws_codecommit as codecommit, aws_glue as glue, aws_iam as iam,
    aws_lakeformation as lakeformation,
    aws_s3 as s3,
    Stack,
    StackProps
} from 'aws-cdk-lib';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class TaskStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        //Creates a repo
        new codecommit.CfnRepository(this, 'Repo_task3', {
            repositoryName: "Repo_task3"
        });

        // create user
        const iamUser = new iam.User(this, 'IAMUser', {
            userName: 'SensitiveReader',
            managedPolicies: [
                'AmazonS3FullAccess',
                'AmazonAthenaFullAccess',
                'AWSCodeCommitFullAccess',
                'AWSGlueConsoleFullAccess',
            ].map(policyName => ManagedPolicy.fromManagedPolicyName(this, policyName, policyName))
        })

        //Creating a bucket from faun
        const s3Bucket = new s3.Bucket(this, 'S3Bucket', {
            encryption: s3.BucketEncryption.S3_MANAGED,
            versioned: true,
            serverAccessLogsBucket: this.createServerAccessLogsBucket(),
        });

        //Creates an Athena workgroup
        const athenaWorkGroup = new athena.CfnWorkGroup(this, 'AthenaWorkGroup', {
            name: "AthenaWorkGroup45",
            state: "ENABLED",
            workGroupConfiguration: {
                bytesScannedCutoffPerQuery: 1099511627776000,
                enforceWorkGroupConfiguration: false,
                publishCloudWatchMetricsEnabled: true,
                requesterPaysEnabled: false,
                resultConfiguration: {
                    outputLocation: `s3://${s3Bucket.bucketName}/`
                }
            }
        });

        const databaseName = "database_cdk_test";
        const cfnDatabase = new glue.CfnDatabase(this, 'MyCfnDatabase', {
            catalogId: Stack.of(this).account,
            databaseInput: {
                createTableDefaultPermissions: [{
                    permissions: ['DATA_LOCATION_ACCESS'],
                    principal: {
                        dataLakePrincipalIdentifier: iamUser.userArn,
                    },
                }],
                name: databaseName
            }
        });

        //creating table
        const table = new glue_alpha.Table(this, 'GlueTable', {
            database: glue_alpha.Database.fromDatabaseArn(this, 'MyCfnDatabase', ''),
            tableName: "table_cdk_test",
            columns: ['1', '2', '3', '4', '5', '6', '7', '8', '9','10','11'].map(columnName => ({
                name: columnName,
                type: glue_alpha.Schema.STRING
            })),
            dataFormat: glue_alpha.DataFormat.CSV,
            bucket: s3Bucket,
            s3Prefix: 'folder_task3/',
        });

        //creating permission
        const cfnPermissions = new lakeformation.CfnPermissions(this, 'MyCfnPermissions', {
            dataLakePrincipal: {
                dataLakePrincipalIdentifier: iamUser.userArn,
            },
            resource: {
                tableWithColumnsResource: {
                    catalogId: cfnDatabase.catalogId,
                    columnNames: table.columns.map(col => col.name),
                    columnWildcard: {
                        excludedColumnNames: ['5','6','7','8','9','10','11'],
                    },
                    databaseName: databaseName,
                    name: table.tableName,
                },
            },
        });
        cfnPermissions.addDependsOn(cfnDatabase);

        //creating query
        new athena.CfnNamedQuery(this, 'MyCfnNamedQuery', {
            database: databaseName,
            queryString: `SELECT * FROM "${databaseName}"."${table.tableName}" limit 3;`,
            workGroup: athenaWorkGroup.name,
        });
    }

    //Creating a bucket for access logs
    private createServerAccessLogsBucket = (): s3.IBucket => {
        return new s3.Bucket(this, 'ServerAccessLogsBucket');
    }
}