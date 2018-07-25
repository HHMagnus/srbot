const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const http = require('http');

const schedule = require('node-schedule');

var subChannels = {
    normal: {},
    nm: {},
    jv: {},
};
var comChannels = {
    normal: {
        failed: [],
        victory: [],
        all: []
    },
    nm: {
        failed: [],
        victory: [],
        all: []
    },
    jv: {
        failed: [],
        victory: [],
        all: []
    }
}
var playerChannels = {
    normal: {},
    nm: {},
    jv: {}
}

var scheduleNormal;
var scheduleNM;
var scheduleJV;

module.exports = {
    startLog: () => {
        start();
    },
    addSubChannel: (channel, type, sub) =>{
        var subchannel = subChannels[type];
        if(subchannel[sub] == null)
            subchannel[sub] = [];

        if(!subchannel[sub].includes(channel)){
            subchannel[sub].push(channel);
            channel.send("Now logging sub " + sub + " " + type + " runs in this channel");
        }else{
            channel.send("This channel is already receiving sub " + sub + " " + type + " run logs, used \"stopsub <type> <time>\" to stop logging runs.")
        }
    },
    removeSubChannel: (channel, type, sub) =>{
        var subchannel = subChannels[type];
        if(subchannel[sub] != null && subchannel[sub].includes(channel)){
            subchannel[sub].remove(channel);
            channel.send("Successfully stop sub " + sub + " " + type + " runs from being logged in this channel");
        }else{
            channel.send("This channel is not currently used to log sub " + sub + " " + type + " runs. use \"logsub <type> <time>\" to start logging runs");
        }
    },
    addPlayerChannel: (channel, type, player) =>{
		var playerchannel = playerChannels[type];
		if(playerchannel[player] == null)
			playerchannel[player] = [];
		
		if(!playerchannel[player].includes(channel)){
			playerchannel[player].push(channel);
			channel.send("Now logging checkpoints for " + player + " in " + type);
		}else{
			channel.send("This channel is already receiving " + player + "'s " + type + " checkpoints");
		}
    },
    removePlayerChannel: (channel, type, player) =>{
		var playerchannel = playerChannels[type];
		if(playerchannel[player] != null && playerchannel[player].includes(channel)){
			playerchannel[player].remove(channel);
			channel.send("Successfully stopped logging " + player + "'s " + type + " checkpoints");
		}else{
			channel.send("This channel is not currently used to log " + player + "'s " + type + " checkpoints");
		}
    },
    addComChannel: (channel, type, com) =>{
		var typechannel = comChannels[type];
		var comchannel = typechannel[com];
		if(!comchannel.includes(channel)){
			comchannel.push(channel);
			channel.send("Now logging " + type + " " + com);
		}else{
			channel.send("This channel is already receiving " + type + " " + com);
		}
    },
    removeComChannel: (channel, type, com) =>{
        var typechannel = comChannels[type];
		var comchannel = typechannel[com];
		if(comchannel.includes(channel)){
			comchannels.remove(channel);
			channel.send("Successfully stopped logging " + type + "  " + com);
		}else{
			channel.send("This channel is not currently logging " + type + " " + com);
		}
    }
}

var delay = 5;

function start(){
    scheduleNormal = schedule.scheduleJob('*/' + delay + ' * * * * *', function(){getData("normal");});
    scheduleNM = schedule.scheduleJob('*/' + delay + ' * * * * *', function(){getData("nm");});
    scheduleJV = schedule.scheduleJob('*/' + delay + ' * * * * *', function(){getData("jv");});
}

function getData(type){
    console.log("getting data: " + type)
    var hostURL = "content.warframe.com";
    var pathURL = "/dynamic/trialStats.php";
    if(type == "normal"){
        pathURL = "/dynamic/trialStats.php";
    }else if(type == "nm"){
        pathURL = "/dynamic/trialNightmareStats.php";
    }else if(type == "jv"){
        pathURL = "/dynamic/trialGolemStats.php";
    }

    var options = {
        host: hostURL,
        path: pathURL
    }
    var request = http.request(options, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            analyse(data, type);
        });
    });
    request.on('error', function (e) {
        console.log(e.message);
    });
    request.end();
}

var alreadyListed = {
    normal: [],
    nm: [],
    jv: []
};

function analyse(data, type){
    console.log("analysing data from: " + type);
    const dom = new JSDOM(data);
	var newAlreadyListed = [];
    for(var row of dom.window.document.querySelector("table").rows){
        if(row.cells[8].textContent == "Date") continue;
        let runid = row.cells[8].textContent + ";" + row.cells[7].textContent;
		newAlreadyListed.push(runid);
        if(!alreadyListed[type].includes(runid)){
            var runData = {
                type: type,
                obj: row.cells[1].textContent,
                time: row.cells[2].textContent,
                prior: row.cells[3].textContent,
                result: row.cells[4].textContent,
                kills: row.cells[5].textContent,
                deaths: row.cells[6].textContent,
                players: row.cells[7].textContent,
                date: row.cells[8].textContent
            };
            
            notify(runData);
        }
    }
	alreadyListed[type] = newAlreadyListed;
}

function notify(data){
    let runStr = "```" + "Type: " + data.type + "; Date: " + data.date + "; Obj: " + data.obj + "; \nTime: " + data.time + "; Kills: " + data.kills + "; Deaths: " + data.deaths + "; \nPlayers: " + data.players + ";" + "```";
    
    //notify sub
    if(data.obj == "VICTORY"){
        console.log(runStr);

        //notify victory channels
        let typechannels = comChannels[data.type];
        let victorychannels = typechannels["victory"];
        notifyChannels(runStr,victorychannels);

        //notify sub channels
        let subchannel = subChannels[data.type];
        let minuteTime = parseInt(data.time.substring(3,5));
        if(data.time.substring(0,2) != "00"){
            minuteTime += 60 * parseInt(data.time.substring(0,2));
        }
        console.log("telling sub: " + minuteTime);
        for(let i = minuteTime; i < 60; i++){
            let channels = subchannel[i];
            if(channels != null){
                notifyChannels(runStr,channels);
            }
        }
    }else if(data.obj == "FAILED"){
        console.log(runStr);

        //notify failed channels
        let typechannels = comChannels[data.type];
        let failedchannels = typechannels["failed"];
        notifyChannels(runStr,failedchannels);
    }else{
        //notify all channels
        let typechannels = comChannels[data.type];
        let allchannels = typechannels["all"];
        notifyChannels(runStr,allchannels);
    }

    for(let player of data.players.split(", ")){
		console.log("notifying: " + player);
        let typechannels = playerChannels[data.type];
        if(typechannels[player] != null){
            notifyChannels(runStr,typechannels[player]);
        }
    }
}

function notifyChannels(str, channels){
    for(let c of channels){
        c.send(str);
    }
}

Array.prototype.remove = function(element){
    this.splice(this.indexOf(element),1);
}
