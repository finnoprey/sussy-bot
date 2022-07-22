const { MessageEmbed, MessageAttachment } = require('discord.js')
const serverUtil = require('minecraft-server-util')
require('dotenv').config()

var guild
var statusChannel
let statusMessageID
const icon = new MessageAttachment('./icon.png')

let players = []
let motd
let slots
let version
let status

function checkStatus(mustSend) {
  console.log('... ' + status)
  
  const beforePlayers = players
  const beforeMotd = motd
  const beforeSlots = slots
  const beforeVersion = version
  const beforeStatus = status

  serverUtil.queryFull(process.env.IP, 25565, { timeout: 2000 })
    .then((result) => {
      players = result.players.list
      motd = result.motd.clean
      slots = result.players.max
      version = result.version
      
      if (motd.toLowerCase().includes('maintenance')) {
        if (motd.toLowerCase().includes('scheduled')) {
          status = 'Scheduled Maintenance'
        } else {
          status = 'Under Maintenance'
        }
      } else {
        status = 'Online'
      }
      
      // PLAYERS
      if (players.length != beforePlayers.length || motd != beforeMotd || slots != beforeSlots || version != beforeVersion || status != beforeStatus || mustSend) {
        // update embed
        updateStatusMessage()
      }
    }).catch((error) => {
      if (error.message.includes('Timed out while querying server for status')) {
        status = 'Offline'
        if (status != beforeStatus || mustSend) {
          updateStatusMessage()
        }
      } else {
        if (status != 'Under Maintenance') {
          status = 'Unknown'
        }
        if (status != beforeStatus || mustSend) {
          updateStatusMessage()
        }
        console.log(error)
      }
    })
}

function updateStatusMessage() {
  // PLAYERS LIST
  let playersString = ''
  if (players) {
    for (const player of players) playersString = playersString + '\n' + player
  }

  // STATUS DEPENDENT CHANGES
  let title
  let color
  let description
  let fields = []

  switch (status) {
    case ('Online'):
      title = ':white_check_mark: Looking Good'
      description = 'The server is currently online.'
      color = '#77b255'
      fields.push({ name: `Players (${players.length}/${slots})` , value: players.length > 0 ? playersString : '...' })
      fields.push({ name: 'Version' , value: version })
      break
    case ('Under Maintenance'):
      title = ':tools: We\'ll Be Back Shortly'
      description = 'The server is under maintenance.'
      color = '#fc9403'
      fields.push({ name: 'What can I do? ' , value: 'Look for a message in the updates channel \nor below and hold tight. Won\'t be long!' })
      sendAlert('The server is under maintenance.')
      break
    case ('Scheduled Maintenance'):
      title = ':warning: Closing Soon'
      description = 'The server is online, but there is \nscheduled maintenance soon.'
      color = '#FFCC4D'
      fields.push({ name: `Players (${players.length}/${slots})` , value: players.length > 0 ? playersString : '...' })
      fields.push({ name: 'Version' , value: version })
      break
    case ('Offline'):
      title = ':rotating_light: Oh No!'
      description = 'The server is currently offline.'
      color = '#dd2e44'
      fields.push({ name: 'What can I do? ' , value: 'Please check the updates channel \nor below this message. Staff have \nbeen notified of the issue and will \nresolve it as soon as possible.' })
      sendAlert('The server is offline.')
      break
    case ('Unknown'):
      title = ':crystal_ball: What\'s This?'
      description = 'The server\'s status is unknown as the bot \nis unable to fetch data!'
      color = '#aa8dd8'
      fields.push({ name: 'What can I do? ' , value: 'Waiting is really the only option, staff \nmembers have been notified.' })
      sendAlert('The server status is unknown.')
      break
  }
  
  const newStatusEmbed = new MessageEmbed()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setThumbnail('attachment://icon.png')
    .addFields(fields)
    .setTimestamp()

  if (statusMessageID) {
    statusChannel.messages.fetch(statusMessageID)
    .then(msg => {
      msg.edit({ embeds: [ newStatusEmbed ] })
    })
  } else {
    statusChannel.send({ embeds: [ newStatusEmbed ], files: [icon] }).then(sent => {
      statusMessageID = sent.id
    })
  }
}

function sendAlert(message) {
  // currently just dm finn
  guild.members.fetch('403366964669579266').then((finn) => finn.send(message))
}

function runIntervalStatus() {
  checkStatus(false)
}

function init(client) {
    guild = client.guilds.cache.find((g) => g.id === process.env.GUILD_ID)
    statusChannel = guild.channels.cache.find(channel => channel.name === "status")
    statusChannel.bulkDelete(100)
    
    checkStatus(true)
    setInterval(() => runIntervalStatus(), 1 * 1000)
}

exports.checkStatus = checkStatus
exports.updateStatusMessage = updateStatusMessage
exports.init = init