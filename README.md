# discord-ai-bot--kieran-ollie

## Project description

Our chatbot will work in discord and provide lighthearted limericks in response to user messages by leveraging the Openai API.  

In addition the bot will provide moderation functions for the server, warning users via DM for hateful, racist, bigoted or violent behaviour.  In addition, the user can set a hardcoded set of banned words which users will also receive a DM to warn against using.  Repeated use of these words, or other flagged content by the moderator service will result in a ban from the server.

Users can utilise Dall-E to receive DMs containing images based upon user prompts.  The bot will respond to messages starting with:

`!image`

followed by the prompt the user desires.

## Project setup

You require node.js and npm to run this chatbot.  You can check if they are installed as follows:
**MacOS, Windows and Linux**

`node -v && npm -v`

If you do not have node.js and npm installed, follow instructions to install them depending on whether you are running the software in a Mac, Windows or Linux environment.

## Installing the Discord bot
Clone the repository into your directory:

`git clone git@github.com:fac30/discord-ai-bot--kieran-ollie.git`

### Install dependencies and run the bot
Create a folder for the program and navigate to it:

`npm init -y`

`npm install`

Now you can run the bot with the command:

`npm run dev`

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

**Bot Permissions**
In order for the bot to work within Discord, right click on the server and open server settings.  Under Server Settings, select Roles, then select the bot, then Permissions.  For the full suite of functions, please select:  View Channels, Kick Members, Ban Members and Manage Messages. 

**Hardcoding words to be flagged for moderation**
In index.js, alter the 
