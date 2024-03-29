const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const fs = require('fs')
require('dotenv').config

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
const commands = []

for (const file of commandFiles) {
  const command = require(`../commands/${file}`)
  commands.push(command.data.toJSON())
}

const rest = new REST({version: '9'}).setToken(process.env.TOKEN)

async function deployCommands() {
	try {
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		)

		console.log('Deployed Commands')
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	deployCommands,
}