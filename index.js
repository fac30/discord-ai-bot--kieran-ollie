require('dotenv/config');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { OpenAI }  = require('openai');

const client = new Client({
    intents: [
		// possibly in GPT-4 you don't need GatewayIntentBits and 'Guilds' etc are strings in array
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,  
		GatewayIntentBits.GuildMessages]
});

client.commands = new Collection();
client.login(process.env.TOKEN);
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
    console.log('Message received:', message.content)
    console.log('Message metadata: ', message)

    // Prevent the bot from replying to its own messages
    // if (message.author.bot) return;
    // if (message.channel.id !== process.env.CHANNEL_ID) return;

    let conversationLog = [{ role: 'system', content: "You are a friendly chatbot that speaks only in limericks." }];

    conversationLog.push({
        role: 'user',
        content: message.content
    });

    await message.channel.sendTyping();

    try {
        console.log('trying');

        const result = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: conversationLog.map(({ role, content }) => ({ role, content }))
        });

        // Log the result to see if it's populated
        console.log('Result:', result);

        if (result.data.choices && result.data.choices.length > 0) {
            console.log('Generated message:', result.data.choices[0].message);
            message.reply(result.data.choices[0].message);
        } else {
            console.log('No message generated.');
        }
    } catch (error) {
        console.error('Error while calling OpenAI:', error);
        return;
    }
});