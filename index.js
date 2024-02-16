require('dotenv/config');

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { OpenAI }  = require('openai');

/// List of words to check for in messages
const naughtyWords = ['duck', 'spit']
/// List of users who have been warned about using banned words
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

// Listening for events in channels that the bot is in
client.on('messageCreate', async (message) => {
    // ---------------------------------------------------------RESPONSE GENERATION--------------------------------------------------------------------
    console.log('Message received:', message.content)

	// Prevent the bot from replying to its own messages
    if (message.author.bot) return;

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

    // ---------------------------------------------------------MODERATION-----------------------------------------------------------------------------
    // Convert message content to lower case to make the check case-insensitive
    const messageContentLowerCase = message.content.toLowerCase();

    // Check if the message contains any of the naughty words
    const containsNaughtyWord = naughtyWords.some(keyword => messageContentLowerCase.includes(keyword));

    // If the message contains a naughty word, add the user to the ban list and send a DM warning
    if (containsNaughtyWord) {
        //add user to ban list    
        banList.push(message.author.id);
        // Send a DM to the user 
        try {
        await message.author.send('Please refrain from using naughty words.');
        } catch (error) {
        console.error(`Could not send DM to ${message.author.tag}.`);
        }
    }

    // Check if the user is in the ban list and still uses a naughty word
    if (containsNaughtyWord && banList.includes(message.author.id)) {
        let banUser = message.author.id;
        // Delete the message
        try {
        await message.delete();
        } catch (error) {
        console.error(`Why you no delete message from ${message.author.tag}?`, error);
        }

        // Kick the user from the server
        try {
        await message.guild.members.ban(banUser, { reason: 'Violating the ban list rules after being warned.' });
        console.log(`${banUser.tag} has been banned from the server and cancelled from the universe.`);
        } catch (banError) {
        console.error(`Why you no ban ${banUser.tag}?:`, banError);
        }    
    }

    //Use openai automoderation to check for inappropriate content
    const moderation = await openai.moderations.create({ input: message.content });

    if (moderation.results[0].flagged)  {
        console.log('Inappropriate content detected:', moderation.results);
        // DM user
        message.author.send('Please refrain from using inappropriate content.');
        // Add user to ban list
        banList.push(message.author.id);
    } else if (moderation.results[0].flagged && banList.includes(message.author.id)){
        let banUser = message.author.id;
        // Delete the message
        try {
        await message.delete();
        } catch (error) {
        console.error(`Why you no delete message from ${message.author.tag}?`, error);
        }

        // Kick the user from the server
        try {
        await message.guild.members.ban(banUser, { reason: 'Violating the ban list rules after being warned.' });
        console.log(`${banUser.tag} has been banned from the server and cancelled from the universe.`);
        } catch (banError) {
        console.error(`Why you no ban ${banUser.tag}?:`, banError);
        }
    }
     
});

client.login(process.env.TOKEN);