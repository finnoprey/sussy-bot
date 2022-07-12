require('dotenv').config()
const fs = require('fs')
const { Client, Collection, Intents, MessageEmbed, MessageAttachment } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES] })

const command_deployer = require('./utils/deploy-commands.js')
command_deployer.deployCommands()

// loading of events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
	const event = require(`./events/${file}`)
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args))
	} else {
		client.on(event.name, (...args) => event.execute(...args))
	}
}

// loading of command
client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.data.name, command)
}

// command handling
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return

	const command = client.commands.get(interaction.commandName)
	if (!command) return

	await handleCommand(command, interaction)
})

async function handleCommand(command, interaction) {
	const [err, data] = await catchErrorAsync(command.execute(interaction))
	if (err) {
		console.error(err)
		await interaction.followUp({ content: 'Whoops, there was an error!', ephemeral: true })
	} else {
		return data;
	}
}

function catchErrorAsync(promise) {
	return promise.then(data => [null, data])
		.catch(err => [err])
}

client.login(process.env.TOKEN)