import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Alarm, ComparisonOperator } from "aws-cdk-lib/aws-cloudwatch";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";

export class HowToTriggerCloudwatchAlarmFromLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const nodejsFunction = new NodejsFunction(
      this,
      "how-to-trigger-cloudwatch-alarm-from-lambda",
      {
        handler: "handler",
        runtime: Runtime.NODEJS_14_X,
        entry: "src/index.ts",
      }
    );

    const numberOfFunctionErrors = nodejsFunction.metricErrors({
      period: Duration.minutes(1),
    });

    const alarm = new Alarm(
      this,
      "how-to-trigger-cloudwatch-alarm-from-lambda-alarm",
      {
        metric: numberOfFunctionErrors,
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      }
    );

    const topic = new Topic(
      this,
      "how-to-trigger-cloudwatch-alarm-from-lambda-topic"
    );

    topic.addSubscription(new EmailSubscription("your@email.com"));

    alarm.addAlarmAction(new SnsAction(topic));
  }
}
