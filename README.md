# discord-ai-bot--kieran-ollie
## Project setup

### Install dependencies
Create a folder for the program and navigate to it:
`npm init -y`
`npm install discord.js openai dotenv axios`



## Installing the Discord bot
## Setting up the `.env` file
### What is a `.env` file?
A [`.env` file](https://blog.bitsrc.io/a-gentle-introduction-to-env-files-9ad424cc5ff4) is a way of storing sensitive information in key-value pairs known as environment variables. These are access keys and tokens that _shouldn't be public_.  

### Configuration
There is a `.env.template` file that contains keys readable by the rest of the code. Values should replace the `..._HERE` text. Below is how to retrieve the relevant values. 

**Token**
Retrieve your bot's token by visiting the [Discord developer's portal](https://discord.com/developers/applications). After creating a bot, click `Reset Token` to retrieve your `TOKEN`. For more on what a token is, visit the [discord.js Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-bot-s-token).

**Channel ID**
In Discord, right click on the relevant server you want to add the bot to, and then select `Copy Server ID`. This should give you your `CHANNEL_ID`.

**OpenAI API Key**
Log into OpenAI and visit the [API keys page](https://platform.openai.com/api-keys) in the developer platform. Click `Create a new secret key` to retrieve the value that corresponds with `OPENAI_API_KEY`.

**Client ID**
The `CLIENT_ID` is the application ID listed in your bot's [Discord Developer's Portal](https://discord.com/developers) page. More on that [here](https://discordjs.guide/creating-your-bot/command-deployment.html#command-registration).
