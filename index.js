require('dotenv/config');
const axios = require('axios');

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


//---------------------------------------------------------GENERATE IMAGE FUNCTION---------------------------------------------------------------------
async function generateImage(prompt) {
    try {
        console.log('Generating image with prompt:', prompt);

        const response = await axios.post(
            'https://api.openai.com/v1/images/generations',
            {
                prompt: prompt,
                n: 1,
                size: "1024x1024",
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('Response received:', response.data);

        if (response.data && response.data.data && response.data.data.length > 0) {
            const imageData = response.data.data[0].url;
            return imageData;
        } else {
            throw new Error('Failed to generate image');
        }
    } catch (error) {
        console.error('Error generating image:', error);
        console.error(error);
        return null;
    }
}

// ---------------------------------------------------------RESPONSE GENERATION--------------------------------------------------------------------
// Listening for events in channels that the bot is in
async function handleMessage(message) {
    console.log(`Message author bot status: ${message.author.bot}, Author details:`, message.author);
    // Prevent the bot from replying to its own messages
    if (message.author.bot) {
        // console.log("Exiting handleMessage: message is from a bot");
        return;
    }

    // Prevent the bot from replying to messages that start with the prefix !image
    if (message.content.startsWith('!image')) {
        // Extract the prompt from the message content
        const prompt = message.content.replace('!image ', '');

        // Return the image url from the generateImage function
        const imageUrl = await generateImage(prompt);

        // If the image url is not null, send the image in a DM to the user
        if (imageUrl) {
            const imageAttachment = new AttachmentBuilder(imageUrl, { name: 'generated-image.png' });
            // message.channel.send({ files: [imageAttachment] });
            message.author.send({ content: `Here's your generated image based on the description: "${prompt}"`,
            files: [imageAttachment]});
        } else {
            message.channel.send('Sorry, I was unable to generate an image.');
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

// ---------------------------------------------------------MODERATION-----------------------------------------------------------------------------
       

    // Convert message content to lower case to make the check case-insensitive
    const messageContentLowerCase = message.content.toLowerCase();

    // Check if the message contains any of the naughty words
    const containsNaughtyWord = naughtyWords.some(keyword => messageContentLowerCase.includes(keyword));

    // Use OpenAI automoderation to check for inappropriate content
    const moderation = await openai.moderations.create({ input: message.content });
    const flaggedByOpenAI = moderation.results[0].flagged;

    // If the message contains a naughty word or is flagged by OpenAI, add the user to the ban list and send a DM warning
    if (containsNaughtyWord || flaggedByOpenAI) {
        // Add user to ban list if not already added
        if (!banList.includes(message.author.id)) {
            banList.push(message.author.id);
            try {
                await message.author.send('Please refrain from using naughty or inappropriate words.');
            } catch (error) {
                console.error(`Could not send DM to ${message.author.tag}.`, error);
            }
        }

        // If the user is in the ban list and still uses a naughty word or flagged content
        if (banList.includes(message.author.id)) {
            // Delete the message
            try {
                await message.delete();
            } catch (error) {
                console.error(`Could not delete message from ${message.author.tag}.`, error);
            }

            // Ban the user from the server
            try {
                await message.guild.members.ban(message.author.id, { reason: 'Violating the ban list rules after being warned.' });
                console.log(`${message.author.tag} has been banned from the server.`);
            } catch (banError) {
                console.error(`Could not ban ${message.author.tag}:`, banError);
            }    
        }
    }
};

client.on('messageCreate', handleMessage);   

client.login(process.env.TOKEN);

module.exports = {
    client: client,
    handleMessage: handleMessage,
};
