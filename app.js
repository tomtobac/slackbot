// 4 scrapping
const jsdom = require("node-jsdom");

// 4 ajax
const fetch = require('node-fetch');

// The memory data store is a collection of useful functions we can include in our RtmClient
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const config = require('./config');

const rtm = new RtmClient(config.env.token, {
  // Sets the level of logging we require
  logLevel: 'error',
  // Initialise a data store for our client, this will load additional helper functions for the storing and retrieval of data
  dataStore: new MemoryDataStore()
});

rtm.start();

// Wait for the client to connect
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  // Get the user's name
  const user = rtm.dataStore.getUserById(rtm.activeUserId);
  // Get the team's name
  const team = rtm.dataStore.getTeamById(rtm.activeTeamId);
  // Log the slack team name and the bot's name
  console.log('Connected to ' + team.name + ' as ' + user.name);
});

rtm.on(RTM_EVENTS.MESSAGE, function (message) {

  if (!message.text || !message.text.includes(config.env.bot_name)) return;

  const channel = message.channel;
  const text = message.text;
  const user = rtm.dataStore.getUserById(message.user)

  switch (true) {
    case text.includes('dinar'):
    case text.includes('launch'):
    case text.includes('menu'):
      console.log('Asked for launch ->', user.profile.first_name);
      getLaunch(text, channel)
      break;
    case text.includes('boob'):
    case text.includes('teta'):
      console.log('Asked for boobs ->', user.profile.first_name)
      getBoobs(channel)
      break;
    case text.includes('top20'):
      console.log('Asked for top20 ->', user.profile.first_name)
      top20(channel);
    break;
    case text.includes('butt'):
    case text.includes('culo'):
      console.log('Asked for butts ->', user.profile.first_name)
      getButts(channel)
      break;
    case text.includes('fuck you'):
      fuckYou(channel);
      break;
    default:
      console.log(`K putes dises ${user.profile.first_name}!?`)
      rtm.sendMessage(`K putes dises ${user.profile.first_name}!?\n\`\`\`Pots demanar: menu, tetas, top20 o culo. \`\`\``, channel, () => {});
  }


});

/* UTILS */

function getLaunch(text, channel) {
  jsdom.env({
    url: config.env.url,
    scripts: [],
    done: function (errors, window) {
      const boxes = window.document.querySelectorAll('.w-pricing-item-h')._toArray()
      const menus = boxes.map(box => {
        const date = box.querySelector('.w-pricing-item-title').textContent.trim();
        const dishes = box.querySelectorAll('.w-pricing-item-feature')._toArray()
          .map(x => x.textContent)
        return {
          date: date,
          dishes: dishes
        }
      })
      const menu = menus.find(menu => menu.date.includes(new Date().getDay()))

      if (!menu) {
        rtm.sendMessage('No hi ha dinar avui... :fu:', channel, () => { })
        return;
      }

      const message = `
        \`\`\`
        ${menu.dishes.reduce((pre, curr) => { return pre += curr + '\n' }, '')}
        \`\`\`
      `

      rtm.sendMessage(message, channel, function messageSent() { });
    }
  });
}

function getBoobs(channel) {
  // TOP 20
  // http://api.oboobs.ru/boobs/0/20/-interest/
  const id = Math.floor((Math.random() * (3500 - 1) + 1));
  fetch(`http://api.oboobs.ru/boobs/${id}`)
    .then(data => data.json())
    .then(data => rtm.sendMessage(`Model: ${data[0].model || '#404 - NOT FOUND'} - Rank: ${data[0].rank}\nhttp://media.oboobs.ru/${data[0].preview}`, channel, () => { }))
    .catch(err => console.log(err))
}
/**
 * Get random picture of top 20 boobs
 */
function top20(channel) {
  // TOP 20
  // http://api.oboobs.ru/boobs/0/20/-interest/
  const id = Math.floor((Math.random() * (20 - 1) + 1));
  fetch(`http://api.oboobs.ru/boobs/0/20/-interest/`)
    .then(data => data.json())
    .then(data => rtm.sendMessage(`Model: ${data[id - 1].model || '#404 - NOT FOUND'} - Rank: ${data[id - 1].rank}\nhttp://media.oboobs.ru/${data[id-1].preview}`, channel, () => { }))
    .catch(err => console.log(err))
}

function getButts(channel) {
  const id = Math.floor((Math.random() * (3500 - 1) + 1));
  fetch(`http://api.obutts.ru/butts/${id}`)
    .then(data => data.json())
    .then(data => rtm.sendMessage(`Model: ${data[0].model || '#404 - NOT FOUND'} - Rank: ${data[0].rank}\nhttp://media.obutts.ru/${data[0].preview}`, channel, () => { }))
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

function fuckYou(channel) {
  fetch(`https://api.giphy.com/v1/gifs/search?q=fuck+you&api_key=dc6zaTOxFJmzC`)
    .then(data => data.json())
    .then(res => {
      const id = Math.floor(Math.random() * (res.data.length - 1) + 1)
      console.log(res.data[id].embed_url)
      rtm.sendMessage(`FUCK YOU!\n${res.data[id].url}`, channel, () => { })
    })
    .catch(err => console.log(err))
}