# AWS Infra As Code project

# Description
This project uses Cloud Development Kit, a AWS tool for infrastructure as code, to create a AWS IAM user with refined LakeFormation permissions so only some of the columns in a data base is displayed for it when a query is made in AWS Athena, for example. This is usefull when you have sensitive information among your data that your user cannot see.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
