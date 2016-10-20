var RtmClient = require('@slack/client').RtmClient;
var jsdom = require("node-jsdom");

// The memory data store is a collection of useful functions we can include in our RtmClient
var MemoryDataStore = require('@slack/client').MemoryDataStore;

var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

var token = 'private';

var rtm = new RtmClient(token, {
  // Sets the level of logging we require
  logLevel: 'error',
  // Initialise a data store for our client, this will load additional helper functions for the storing and retrieval of data
  dataStore: new MemoryDataStore()
});

rtm.start();

// Wait for the client to connect
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function() {
  // Get the user's name
  var user = rtm.dataStore.getUserById(rtm.activeUserId);

  // Get the team's name
  var team = rtm.dataStore.getTeamById(rtm.activeTeamId);

  // Log the slack team name and the bot's name
  console.log('Connected to ' + team.name + ' as ' + user.name);
});


var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
  // Listens to all `message` events from the team
  console.log(message)
  let channel = message.channel;
  let text = message.text;
  let user = rtm.dataStore.getUserById(message.user)

  let condition = text.includes('bot-tomeu') && text.includes('dinar');

  if (condition) {
    jsdom.env({
      url: "private",
      scripts: ["http://code.jquery.com/jquery.js"],
      done: function (errors, window) {
          var $ = window.$;

          let items = $(".w-pricing-item-features")
          let rows = []
          items.each(index => {
            rows.push(items[index].children._toArray().map(x => {return x.innerHTML;}))
          })
          let headers = $(".w-pricing-item-title")
          headers.each((index) => rows[index].unshift(headers[index].innerHTML))

          let date = new Date();
          if (text.includes('dema')) date.setDate(date.getDate() + 1)
          let today = rows.find(x => x[0].includes(date.getDate()))
          console.log(`date asked: ${date.getDate()}`)
          let message;
          if (today != null){
            message = '```' + today.reduce((prev,curr) => prev += curr + '\n') + '```'
          }else {
            message = `Avui, ${date.toISOString().slice(0, 10)}, no hi ha dinar`
          }
          rtm.sendMessage(message, channel, function messageSent() {});
        }
      });


    // setTimeout(() => rtm.sendMessage(`que paso wey!`, channel, null), 2000)
  }
});
