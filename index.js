require('dotenv/config');
const OpenAI = require("openai").default;

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');


const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
		GatewayIntentBits.MessageContent,  
		GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
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

const naughtyWords = ['duck', 'spit'];

const blackList = new Set();

const conversationHistories = {};

client.on('messageCreate', async (message) => {
    console.log('=> Message content <=', message);
    
    if (message.author.bot) return;
    
    const authorId = message.author.id;
    
    // Initialize the conversation for the channel if it doesn't exist
    if (!conversationHistories[authorId]) {
        conversationHistories[authorId] = [{
            role: 'system',
            content: 'You are a helpful assistant'
            }];
        }
    
        // Add the new user message to the conversation history
        conversationHistories[authorId].push({
            role: 'user',
            content: message.content
        });
    
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: conversationHistories[authorId],
            });
    
            // After receiving the response, add it to the conversation history
            conversationHistories[authorId].push({
                role: 'assistant',
                content: response.choices[0].message.content,
            });
    
            // Reply to the user with the AI's response
            message.reply(response.choices[0].message.content);
        } catch (error) {
            console.error('OpenAI Error:', error);
        }

    // Check for naughty words in the message
    const messageContentLowerCase = message.content.toLowerCase();
    const containsNaughtyWord = naughtyWords.some(keyword => messageContentLowerCase.includes(keyword));

    if (containsNaughtyWord) {
        if (blackList.has(authorId)) {
            // User is already in the blacklist, try to kick them
            try {
                const member = message.guild.members.cache.get(authorId);
                if (member) {
                    await member.kick('Repeated use of banned words.');
                    console.log(`Kicked ${message.author.tag} for repeated offenses.`);
                } else {
                    console.log(`Member not found in guild.`);
                }
            } catch (error) {
                console.error(`Could not kick ${message.author.tag}.`, error);
            }
        } else {
            // First offense, add the user to the blacklist and send a warning DM
            blackList.add(message.author.id);
            try {
                await message.author.send('Your message contains one of the naughty keywords! If you do this again you will be banned!');
            } catch (dmError) {
                console.error(`Could not send DM to ${message.author.tag}.`, dmError);
            }
        }
    }

});
    

client.login(process.env.TOKEN);