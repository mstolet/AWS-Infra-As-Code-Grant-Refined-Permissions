import * as cdk from '@aws-cdk/core';
import * as s3 from "@aws-cdk/aws-s3";

export class S3BucketStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, "testbucket2",{
      versioned: false,
      bucketName: "testbucket2",
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
  }
}  
