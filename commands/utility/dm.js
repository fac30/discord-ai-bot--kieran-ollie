const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Direct messages the response instead.'),
    async execute(interaction) {
        await interaction.reply(result['choices'][0]['message']['content'])
    },
};

