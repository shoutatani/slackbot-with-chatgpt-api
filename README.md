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

   - `/slackbot-with-chatgpt-api/#{stage name}/OPENAI_API_KEY`: OpenAI API Key (to use OpenAI Completion API)
   - `/slackbot-with-chatgpt-api/#{stage name}/OPENAI_MODEL_NAME`: OpenAI model name (e.g. `gpt-4`)
   - `/slackbot-with-chatgpt-api/#{stage name}/OPENAI_SYSTEM_PROMPT`: ChatGPT system prompt (e.g. `You are helpful assistant`)
   - `/slackbot-with-chatgpt-api/#{stage name}/SLACK_BOT_ID`: Slack Bot ID (e.g. `U01AAABBBCC`) (to judge whether the message is for the bot)
   - `/slackbot-with-chatgpt-api/#{stage name}/SLACK_BOT_TOKEN`: Slack Bot token to send messages and to read messages
   - `/slackbot-with-chatgpt-api/#{stage name}/SLACK_SIGNING_SECRET`: Slack signing secret to verify requests from Slack

6. Deploy the Lambda function with Serverless Framework

   1. `yarn install`
   2. `yarn deploy:prod`
      - If you use specific AWS profile and not default profile, run `AWS_SDK_LOAD_CONFIG=1 yarn deploy:prod --aws-profile <profile name>`

7. In Slack App, add the following Event Subscriptions

   - `app_mention` (to respond to mentions in not participating channels)
   - `message.channels` (to respond to messages in channels)
   - `message.groups` (to respond to messages in private channels)
   - `message.im` (to respond to messages in DMs)
   - `message.mpim` (to respond to messages in group DMs)

8. In Slack App, add the following OAuth Scopes

   - `app_mentions:read` (to read mentions in channels)
   - `channels:history` (to read messages in channels)
   - `chat:write` (to send messages)
   - `groups:history` (to read messages in private channels)
   - `im:history` (to read messages in DMs)
   - `mpim:history` (to read messages in group DMs)
   - `users:read` (to read user IDs)

9. In Slack App, set Event Subscriptions Request URL to the API Gateway URL of the Lambda function
10. In Slack App, set Interactive Components Request URL to the API Gateway URL of the Lambda function

11. If you want to remove the Slack App, run `sls remove --stage prod`
