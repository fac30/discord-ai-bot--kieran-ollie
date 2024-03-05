require('dotenv/config');

// Import the moderation function from the moderation.js file
const moderateMessage = require('./moderation');

// Import the generateImage function from the imageGenerator.js file
const generateImage = require('./imageGenerator');

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { OpenAI }  = require('openai');


/// List of words to check for in messages
const naughtyWords = ['duck', 'spit']
/// List of users who have been warned about using banned words or flagged content
const banList = [];

const client = new Client({
    intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,  
		GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
    ]
});

// Log something once bot is online
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// New instance of OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ---------------------------------------------------------DEAL WITH SLASH COMMANDS---------------------------------------------------------------------
client.commands = new Collection(); 

// Define the path to the commands folder
const commandsPath = path.join(__dirname, 'commands');

// Read all JavaScript files directly from the commands folder
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Loop through each file (for eg slash commands) and require them
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    // Check if the interaction is a command, retrieve command based on name
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    // If no command found, log error
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        // Execute command
        await command.execute(interaction);
    } catch (error) {
        // If command fails to execute, log error
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }

});

// ---------------------------------------------------------RESPONSE GENERATION--------------------------------------------------------------------
// Listening for events in channels that the bot is in
async function handleMessage(message) {
    // Prevent the bot from replying to its own messages or messages without actual content
    if (message.author.bot || !message.content) return;

    console.log("!!!!!!!!!!!!!!!!!Message object:", message);
    // Call the moderation function early to check the message
    await moderateMessage(openai, message, naughtyWords, banList);

    // Your existing code for handling '!image' commands and conversation logic follows
    if (message.content.startsWith('!image')) {
        // Extract the prompt from the message content
        const prompt = message.content.replace('!image ', '');

        // Return the image url from the generateImage function
        const imageUrl = await generateImage(prompt);

       // If the image url is not null, send the image in a DM to the user
    if (imageUrl) {
        const imageAttachment = new AttachmentBuilder(imageUrl, { name: 'generated-image.png' });

        // Ensure we're correctly opening a DM channel and sending the message there
        try {
            const dmChannel = await message.author.createDM(); // This opens a DM channel
            await dmChannel.send({ // Use the send method on the DM channel
                content: `Here's your generated image based on the description: "${prompt}"`,
                files: [imageAttachment]
            });
        } catch (error) {
            console.error('Failed to send DM:', error);
            // Optionally, handle failure (e.g., inform the user in the original channel, log the error, etc.)
        }
    } else {
    await message.channel.send('Sorry, I was unable to generate an image.');
    }   

    } else {
        // Initialise a conversation with system message
        let conversationLog = [{ role: 'system', content: "You are a friendly chatbot that speaks only in limericks." }];

        // Add user message to conversation log
        conversationLog.push({
            role: 'user',
            content: message.content
        });

        // Send typing indicator in channel
        await message.channel.sendTyping();

        try {
            // Call API to generate response
            const result = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: conversationLog.map(({ role, content }) => ({ role, content }))
            });

            // Log the result to see if it's populated
            console.log('Result:', result);

            // If a message is generated, send as reply
            if ((result['choices'][0]['message']['content'])) {
                console.log('Generated message:', result['choices'][0]['message']['content']);
                message.reply(result['choices'][0]['message']['content']);
            } else {
                console.log('No message generated.');
            }
        } catch (error) {
            console.error('Error while calling OpenAI:', error);
            return;
        }
    }
}

client.on('messageCreate', handleMessage);   

client.login(process.env.TOKEN);

module.exports = {
    client: client,
    handleMessage: handleMessage,
    generateImage: generateImage,
};
