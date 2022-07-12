const permission_handler = require('../utils/permission-handler.js')
const status_panel = require('../panel/status-panel.js')

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
    // startup things
		console.log(`Logged in as ${client.user.tag}`)
    client.user.setActivity("on the Sussy SMP", { type: "PLAYING"})

    // load commands into cache
    guild = client.guilds.cache.find((g) => g.id === process.env.GUILD_ID)
		await guild.commands.fetch()

    // deploy permissions 
		await permission_handler.deployPermissions(client)
    
    // start status panel
    status_panel.init(client)
	},
}