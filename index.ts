// web server
import express from 'express'
import bodyparser from 'body-parser'
import path from 'path'
const app = express()
const port = '80'

// discord bot implementation
import { Client, DynamicImageFormat, Guild, Intents, User, Collection, GuildMember } from 'discord.js'
import { token, serverId } from './config.json'
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_PRESENCES
  ]
})

// misc
import fs from 'fs'
var oldStatus: String
var oldPlatform: String

// saving wars
var abusedServer: Promise<Guild>
var clientUser: User
var userList: Array<String> = new Array()

// working vars
var userStatus: String = ''
var userPlatform = ''
var profileBannerFormat: DynamicImageFormat
var profileBannerHeight: String
var statusIcon: String
var resData: {
  username: String,
  discriminator: String,
  profileBanner: String,
  profileBannerHeight: String,
  profileBannerAccentColor: String,
  profileImage: String,
  imageMargin: String,
  userStatus: String,
  platform: String,
  statusIcon: String,
}

client.once('ready', async () => {
  // WebServer Settings
  app.use(express.urlencoded({ extended: false })) // configure the app to parse requests with urlencoded payloads
  app.use(express.json()) // configure the app to parse requests with JSON payloads
  app.use(bodyparser.text()) // configure the app to be able to read text
  app.use(express.static('static'))
  app.listen(port, function() {
    console.log(`App listening at http://localhost:${port}/`)
  })

  /* Handle GET Requests */
  app.get('/', (req, res) => { // Handle incoming GET requests to http://localhost:(port)/
    res.sendFile(path.join(__dirname + '/index.html')) // Send the index.html file
  })

  app.get('/contact', (req, res) => { // Handle incoming GET requests to http://localhost:(port)/contact
    res.sendFile(path.join(__dirname + '/contact.html')) // Send the contact.html file
  })

  /* Handle POST Requests */
  app.post('/getStatus', (req, res) => {
    if (resData != null) {
      res.status(200).send(resData)
    } else {
      //console.log("Error requesting new Status") // Log the error in the console
      res.sendStatus(500) // Send a 500 error.
    }
  })

  app.post('/setUser', (req, res) => {
    const userId: string = req.body.userId
    const idCheck = checkId(userId)
    if (idCheck.flag) {
      clientUser = client.users.cache.find(user => user.id === userId)
      getStatus()
      console.log("[Info] Started watching " + clientUser.username)
      res.redirect("/")
    } else {
      res.json(idCheck.message)
    }
  })
  abusedServer = client.guilds.fetch(serverId)
  abusedServer.then(async (resultGuild) => {
    resultGuild.members.cache.forEach(member => {
      userList.push(member.id)
    })
  })
  console.log(`Ready to watch`)
})

function getStatus() {
  // resetting old values
  resData = {
    username: '',
    discriminator: '',
    profileBanner: '',
    profileBannerHeight: '',
    profileBannerAccentColor: '',
    profileImage: '',
    imageMargin: '',
    userStatus: '',
    platform: '',
    statusIcon: '',
  }

  // refreshing data on webpage 
  abusedServer.then((result1) => {
    result1.members.fetch(clientUser.id).then(async (result) => {
      await result.user.fetch()
      if (result.presence != null) {
        userStatus = result.presence.status
        userPlatform = JSON.stringify(result.presence.clientStatus).substring(2, JSON.stringify(result.presence.clientStatus).indexOf('"', 2))
      } else {
        userStatus = 'offline'
        userPlatform = ''
      }
      if (result.user.banner != null) {
        profileBannerFormat = result.user.banner.startsWith('a_') ? 'gif' : 'png'
      }
      profileBannerHeight = result.user.banner ? '240' : '120'
      if (userStatus != 'offline') {
        statusIcon = '/statusIcons/' + userStatus + userPlatform + '.png'
      } else {
        statusIcon = '/statusIcons/' + 'offline.png'
      }

      resData = {
        username: result.user.username,
        discriminator: result.user.discriminator,
        profileBanner: result.user.bannerURL({ dynamic: true, size: 600, format: profileBannerFormat }),
        profileBannerHeight: profileBannerHeight,
        profileBannerAccentColor: result.user.hexAccentColor,
        profileImage: result.displayAvatarURL({ dynamic: true, size: 128 }),
        imageMargin: result.user.banner ? '179' : '56',
        userStatus: userStatus,
        platform: userPlatform,
        statusIcon: statusIcon,
      }
      //statusmessage: result.presence.activities[0].state,                      

      if (result.presence != null) {
        oldStatus = result.presence.status
      } else if (result.presence == null) {
        oldStatus = 'offline'
      }
    })
  })
}

function checkId(Id: String): { flag: Boolean, message?: String } {
  var returnObj: {
    flag: Boolean,
    message?: String
  }
  if (Id.length === 18) {
    userList.forEach(id => {
      if (Id === id) {
        returnObj = {
          flag: true
        }
      }
    })
    if (returnObj == null) {
      returnObj = {
        flag: false,
        message: "Id could not be found on selected Server ()"
      }
    }
  } else {
    returnObj = {
      flag: false,
      message: "Id length invalid (should be 18)"
    }
  }
  return returnObj
}

client.on('presenceUpdate', (oldPresence, newPresence) => {
  var day = new Date()
  // time in following format: day/month/year at hour:minute:second
  var time = `${String(day.getDate()).padStart(2, '0')}/${String(day.getMonth() + 1).padStart(2, '0')}/${String(day.getFullYear()).padStart(2, '0')} at ${String(day.getHours()).padStart(2, '0')}:${String(day.getMinutes()).padStart(2, '0')}:${String(day.getSeconds()).padStart(2, '0')}`
  var platform = ''
  if (newPresence != null) {
    // get platform
    switch (JSON.stringify(newPresence.member.presence.clientStatus).substring(2, JSON.stringify(newPresence.member.presence.clientStatus).indexOf('"', 2))) {
      case 'desktop':
        platform = '[D]'
        break
      case 'mobile':
        platform = '[M]'
        break
      case 'web':
        platform = '[W]'
        break
      case 'bot':
        platform = '[B]'
        break
      default:
        platform = '[-]'
        break
    }
    if (clientUser != undefined && newPresence.user.id === clientUser.id) {
      getStatus()
      if (oldStatus !== newPresence.member.presence.status) {
        // write to log
        fs.writeFile(`./logs/${clientUser.username}.txt`, `${time} ${platform} ${newPresence.member.presence.status}\n`, { flag: 'a' }, err => {
          // throwing an error if the status couldn't be logged
          if (err) throw err
        })
        oldStatus = newPresence.member.presence.status
        oldPlatform = platform
      } else if (oldPlatform !== platform) {
        fs.writeFile(`./logs/${clientUser.username}.txt`, `${time} ${platform} ${oldStatus}\n`, { flag: 'a' }, err => {
          // throwing an error if the status couldn't be logged
          if (err) throw err
        })
        oldPlatform = platform
      }
    }
  } else {
    oldStatus = 'offline'
  }
})

client.login(token)