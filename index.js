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
		// possibly in GPT-4 you don't need GatewayIntentBits and 'Guilds' etc are strings in array
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,  
		GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
    ]
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.on('messageCreate', async (message) => {
    //console.log('Message received:', message.content)
    //console.log('Message metadata: ', message)

	// Prevent the bot from replying to its own messages
    if (message.author.bot) return;
    // if (message.channel.id !== process.env.CHANNEL_ID) return;

    let conversationLog = [{ role: 'system', content: "You are a friendly chatbot that speaks only in limericks." }];

    conversationLog.push({
        role: 'user',
        content: message.content
    });

    await message.channel.sendTyping();

    try {
        const result = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: conversationLog.map(({ role, content }) => ({ role, content }))
        });

        // Log the result to see if it's populated
        console.log('Result:', result);

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