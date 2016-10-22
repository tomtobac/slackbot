// 4 scrapping
var jsdom = require("node-jsdom");

// 4 ajax
var fetch = require('node-fetch');


// The memory data store is a collection of useful functions we can include in our RtmClient
var MemoryDataStore = require('@slack/client').MemoryDataStore;
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
config = require('./config');

var rtm = new RtmClient(config.env.token, {
  // Sets the level of logging we require
  logLevel: 'error',
  // Initialise a data store for our client, this will load additional helper functions for the storing and retrieval of data
  dataStore: new MemoryDataStore()
});

rtm.start();

// Wait for the client to connect
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  // Get the user's name
  var user = rtm.dataStore.getUserById(rtm.activeUserId);

  // Get the team's name
  var team = rtm.dataStore.getTeamById(rtm.activeTeamId);

  // Log the slack team name and the bot's name
  console.log('Connected to ' + team.name + ' as ' + user.name);
});

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
  let channel = message.channel;

  let text = message.text;
  if (!text) return;

  let user = rtm.dataStore.getUserById(message.user)

  if (!text.includes(config.env.bot_name)) return; // we're not called 

  if (text.includes('dinar')) {
    getLaunch(text, channel);
  }

  if (text.includes('boobs') || text.includes('tetas')) {
    getBoobs(channel);
  }


});

/* UTILS */

function getLaunch(text, channel) {
  jsdom.env({
    url: config.env.url,
    scripts: ["http://code.jquery.com/jquery.js"],
    done: function (errors, window) {
      var $ = window.$;

      let items = $(".w-pricing-item-features")
      let rows = []
      items.each(index => {
        rows.push(items[index].children._toArray().map(x => { return x.innerHTML; }))
      })
      let headers = $(".w-pricing-item-title")
      headers.each((index) => rows[index].unshift(headers[index].innerHTML))

      let date = new Date();
      if (text.includes('dema')) date.setDate(date.getDate() + 1)
      let today = rows.find(x => x[0].includes(date.getDate()))
      let message;
      if (today != null) {
        console.log(today);
        let d = today.shift().trim().replace('\n', '');
        message = '```'
        message += `+---------------------------------------------+\n`
        message += `${d} | Tiempo restante: (${diffBetweenDates()})\n`
        message += `+---------------------------------------------+\n`
        message += `${today.map(x => x + '\n')}`
        message += '```'
        message += `\n:knife_fork_plate: ${config.env.url}`

      } else {
        message = `Dema, ${date.toISOString().slice(0, 10)}, no hi ha dinar`
      }
      rtm.sendMessage(message, channel, function messageSent() { });
    }
  });
}

function getBoobs(channel) {

  let max = 2000;
  let min = 1
  let n = Math.random() * (max - min) + min;
  n = Math.floor(n);
  fetch(`http://api.oboobs.ru/boobs/${n}`)
    .then(data => {
      return data.json();
    })
    .then(data => rtm.sendMessage(`http://media.oboobs.ru/${data[0].preview}`, channel, () => { }))
    .catch(err => console.log(err))

}

function diffBetweenDates() {
  let today = new Date()

  if (today.getDay() > 5) return 'Fin de semana'

  if (today.getHours() > 11) return 'Tiempo agotado';

  let maxtime = new Date()
  maxtime.setHours(11, 00, 00, 00)

  return msToTime(Math.abs(maxtime - today))

  function msToTime(s) {
    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;

    function addZeros(n) {
      return n < 10 ? '0' + n : n;
    }

    return addZeros(hrs) + ':' + addZeros(mins) + ':' + addZeros(secs)
  }
}