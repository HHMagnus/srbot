const Discord = require("discord.js");
const client = new Discord.Client();

const fs = require("fs");
const logsub = require("./logsub.js");
const worldstate = require("./worldstate.js");
var config;

//event when bot starts up
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setGame("Jerking off");
  config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
  logsub.startLog();
  worldstate.start();
});

client.on('messageReactionAdd', (msg,user) =>{
	console.log(msg.user + "," + msg.id + ": added emoji" + msg.emoji.id);
	if(user.id == config.ownerid){
		msg.message.react(msg.emoji);
	}
});

const mc = require('./messagecenter.js');

var stopList = [];
client.on('message', msg => {
	if (msg.author.bot) return;
	if(msg.content.startsWith("+"))
		mc.handle(msg, config);
	else if(msg.content.startsWith("<@" + client.user.id + "> "))
		mc.handle(msg, config);
	else if(msg.channel.type == "dm")
		mc.handle(msg, config);

	if(stopList.includes(msg.author.id)){
		const timetostop = client.emojis.find("name", "timetostop");
  		msg.react(timetostop);
	}

	
});

client.login('MzU2NDg5MzYzODYzMTA5NjMz.DJccdA.1o6h9qb79EOC5_ZLO5FtfV_IK9g');

module.exports = {
	client: client,
	logsub: logsub,
	stopList: stopList
}