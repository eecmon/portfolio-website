import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export interface InfrastructureStackProps extends cdk.StackProps {
  stage: string;
  region: string;
  contactEmail: string;
  adminAllowedIps: string[];
  allowedOrigins: string[];
  domainName?: string;
}

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props);

    const { stage } = props;

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `portfolio-website-${stage}-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy:
        stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: stage !== 'prod',
    });

    const assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      bucketName: `portfolio-assets-${stage}-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: props.allowedOrigins,
          allowedHeaders: ['*'],
        },
      ],
      removalPolicy:
        stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: stage !== 'prod',
    });

    const table = new dynamodb.Table(this, 'PortfolioTable', {
      tableName: `portfolio-content-${stage}`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy:
        stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    const githubTokenParamName = `/portfolio/${stage}/github-token`;

    const apiLambda = new lambda.Function(this, 'ApiLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda'), {
        exclude: ['*.test.js', '*.test.ts', '__tests__'],
      }),
      environment: {
        TABLE_NAME: table.tableName,
        STAGE: stage,
        ASSETS_BUCKET: assetsBucket.bucketName,
        GITHUB_TOKEN_PARAM: githubTokenParamName,
      },
    });

    table.grantReadWriteData(apiLambda);
    assetsBucket.grantReadWrite(apiLambda);

    apiLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      resources: [
        `arn:aws:ssm:${this.region}:${this.account}:parameter${githubTokenParamName}`,
      ],
    }));

    const api = new apigateway.LambdaRestApi(this, 'PortfolioApi', {
      handler: apiLambda,
      proxy: true,
    });

    const editorDetectionFunction = new cloudfront.Function(
      this,
      'EditorDetectionFunction',
      {
        code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var clientIp = event.viewer.ip;
  var allowedIps = ${JSON.stringify(props.adminAllowedIps)};

  var isAllowed = allowedIps.some(function(allowed) {
    // Exact match (covers IPv4 and full IPv6)
    if (allowed.toLowerCase() === clientIp.toLowerCase()) return true;
    // IPv6 /64 prefix match: compare first 4 colon-separated groups.
    // This ignores privacy-extension suffix that rotates on every connection.
    if (clientIp.indexOf(':') !== -1 && allowed.indexOf(':') !== -1) {
      var clientPrefix = clientIp.split(':').slice(0, 4).join(':').toLowerCase();
      var allowedPrefix = allowed.split(':').slice(0, 4).join(':').toLowerCase();
      if (clientPrefix === allowedPrefix) return true;
    }
    return false;
  });

  request.headers['x-editor-allowed'] = { value: isAllowed ? 'true' : 'false' };
  request.headers['x-viewer-ip'] = { value: clientIp };
  return request;
}
        `),
      }
    );

    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            function: editorDetectionFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      additionalBehaviors: {
        'api/*': {
          origin: new origins.RestApiOrigin(api),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: new cloudfront.OriginRequestPolicy(
            this,
            'ApiOriginRequestPolicy',
            {
              headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
                'x-editor-allowed',
                'x-viewer-ip'
              ),
              cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),
              queryStringBehavior:
                cloudfront.OriginRequestQueryStringBehavior.all(),
            }
          ),
          functionAssociations: [
            {
              function: editorDetectionFunction,
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            },
          ],
        },
        'uploads/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(assetsBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: websiteBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: assetsBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: table.tableName,
    });
  }
}