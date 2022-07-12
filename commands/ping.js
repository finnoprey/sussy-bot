const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Sends a message back!'),
	async execute(interaction) {
		await interaction.reply('Pong!')
	},
}