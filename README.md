# Slack App with ChatGPT

This is a Slack App that uses the ChatGPT Completions API to respond to messages in Slack.

## System Requirements

- AWS Account with Power User Access or Administrator Access
- OpenAI API key

## Usage

1. Invite the bot to a channel
2. Send a message to the bot by mentioning it in a message

   - `@<bot-name> <prompt>` (e.g. `@bot-name Please help me with my homework`)

3. The bot will respond with a chat completion
4. You can also send a DM to the bot

## Setup

1. Create a Slack App at https://api.slack.com/apps
2. Add a Bot User to the Slack App
3. Install the Slack App to your workspace
4. Clone this repo
5. In AWS Systems Manager Parameter Store, with stage name(like `prod` or `stg`), create the following parameters:

   - `/slackbot-with-chatgpt-api/#{stage name}/OPENAI_API_KEY`: ChatGPT API key
   - `/slackbot-with-chatgpt-api/#{stage name}/SLACK_APP_TOKEN`: Slack App token (OAuth Access Token)
   - `/slackbot-with-chatgpt-api/#{stage name}/SLACK_BOT_ID`: Slack Bot ID (Bot User ID)
   - `/slackbot-with-chatgpt-api/#{stage name}/SLACK_BOT_TOKEN`: Slack Bot token (Bot User OAuth Access Token)
   - `/slackbot-with-chatgpt-api/#{stage name}/SLACK_SIGNING_SECRET`: Slack signing secret (Basic Information > App Credentials > Signing Secret)

6. Deploy the Lambda function with Serverless Framework (if you don't specify a stage name, it will default to `stg`)

   - `sls deploy --stage prod`
   - run `AWS_SDK_LOAD_CONFIG=1 sls deploy --aws-profile <profile name>`, if you use specific AWS profile and not default profile

7. In Slack App, add the following Event Subscriptions

   - `app_mention` (Subscribe to bot events)
   - `message.im` (Subscribe to bot events)
   - `message.channels` (Subscribe to bot events)

8. In Slack App, add the following OAuth Scopes

   - `channels:history`
   - `chat:write`
   - `chat:write.customize`
   - `groups:history`
   - `im:history`
   - `mpim:history`

9. In Slack App, set Event Subscriptions Request URL to the API Gateway URL of the Lambda function
10. In Slack App, set Interactive Components Request URL to the API Gateway URL of the Lambda function

11. If you want to remove the Slack App, run `sls remove --stage prod`
