const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('attack')
		.setDescription('Replies with Grrr!'),
	async execute(interaction) {
		await interaction.reply('Grrr!');
	},
};

