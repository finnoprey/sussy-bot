const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('comment')
		.setDescription('Adds an alert to the status panel.')
		.addStringOption(
			option => option
			.setName('message')
			.setDescription('The message for the comment.')
			.setRequired(true)),
	async execute(interaction) {
		await interaction.reply({ content: 'Your comment has been added.', ephemeral: true})

		let comment = interaction.options.getString('message')

		let guild = interaction.client.guilds.cache.find((g) => g.id === process.env.GUILD_ID)
    let status_channel = guild.channels.cache.find(channel => channel.name === "status")

		const embed = new MessageEmbed()
			.setColor('#55acee')
			.setTitle(':mega:  Update From Staff')
			.setDescription(comment)
			.setTimestamp()

		status_channel.send({ embeds: [ embed ] })
	},
}