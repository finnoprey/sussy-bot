const { SlashCommandBuilder } = require('@discordjs/builders')
const status_panel = require('../panel/status-panel.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('maintenance')
		.setDescription('Toggles the maintenance mode on the status panel.'),
	async execute(interaction) {
        if (status_panel.status == 'Under Maintenance') {
            status_panel.setStatus('Online')
            await interaction.reply({ content: 'Disabled maintenance mode!', ephemeral: true })
        } else {
            status_panel.setStatus('Under Maintenance')
            status_panel.updateStatusMessage()
            console.log(status_panel.status)
            await interaction.reply({ content: 'Enabled maintenance mode!', ephemeral: true })
        }
	},
}