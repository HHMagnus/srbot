const http = require('http');

const schedule = require('node-schedule');

var channels = [];

var alertChannels = {
	any: [],
	nitain: []
};
module.exports = {
	start: () => {start()},
	addChannel: (channel, tag) => {
		if(alertChannels[tag] == null)
			alertChannels[tag] = [];
		
		if(!alertChannels[tag].includes(channel)){
			alertChannels[tag].push(channel);
			channel.send("Succesfully added alert log for: " + tag);
		}else{
			channel.send("Channel is already used to log alerts for: " + tag);
		}
	},
	removeChannel: (channel, tag) => {
		if(alertChannels[tag] != null && alertChannels[tag].includes(channel)){
			alertChannels[tag].push(channel);
			channel.send("Succesfully removed alert log for: " + tag);
		}else{
			channel.send("Channel is not currently receiving logs for alerts for: " + tag);
		}
	}
}

var scheduleWS;
var delay = 10;

function start(){
	scheduleWS = schedule.scheduleJob('*/' + delay + ' * * * * *', function(){getData();});
}

function getData(){
    console.log("getting World State");
    var hostURL = "origin.warframe.com";
    var pathURL = "/dynamic/worldState.php";
	
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
            analyse(data);
        });
    });
    request.on('error', function (e) {
        console.log(e.message);
    });
    request.end();
}

var alreadyAnnouncedAlerts = [];

function analyse(data){
	console.log("analysing World State");
	
	let jData = JSON.parse(data);
	
	let alerts = jData["Alerts"];
	
	let recent = [];
	for(let a of alerts){
		let id = a["_id"];
		let realId = id["$oid"];
		recent.push(realId);
		/*if(alreadyAnnouncedAlerts.includes(realId))
			continue;*/
		
		alreadyAnnouncedAlerts.push(realId);
		
		let missionInfo = a["MissionInfo"];
		
		let missionType = missionInfo["missionType"];
		let faction = missionInfo["faction"];
		
		let missionReward = missionInfo["missionReward"];
		
		let minLevel = missionInfo["minEnemyLevel"];
		let maxLevel = missionInfo["maxEnemyLevel"];
		
		let loc = missionInfo["location"];
		
		let dateA = a["Expiry"]; let dateB = dateA["$date"]; let dateC = dateB["$numberLong"];
		let date = new Date(Number(dateC));
		let left = timeLeft(date);
		
		console.log("Credits from alert (" + realId + ") " + missionReward["credits"] + " expiration: " + date + " in " + left);
	}
	
	for(let i of alreadyAnnouncedAlerts){
		if(!recent.includes(i))
			alreadyAnnouncedAlerts.remove(i);
	}
	
	
}

function notify(){
	
}
function timeLeft(t){
	return timeLeftString(new Date(), t);
}
function timeLeftString(n, t){
	let days = timeLeftDays(n, t);
	let hour = timeLeftHour(n, t)-days*24;
	let min = timeLeftMin(n, t)-hour*60;
	let sec = timeLeftSec(n, t)-min*60;
	return (days > 0 ? days + "d" : "") + (hour > 0 ? hour + "h" : "") + (min > 0 ? min + "m" : "") + (sec > 0 ? sec + "s" : "") + " left";
}

function timeLeftDays(n,t){
	var t1 = t.getTime();
	var t2 = n.getTime();
	
	return parseInt((t1-t2)/(24*3600*1000));
}

function timeLeftHour(n,t){
	var t1 = t.getTime();
	var t2 = n.getTime();
	
	return parseInt((t1-t2)/(3600*1000));
}

function timeLeftMin(n,t){
	var t1 = t.getTime();
	var t2 = n.getTime();
	
	return parseInt((t1-t2)/(60*1000));
}

function timeLeftSec(n,t){
	var t1 = t.getTime();
	var t2 = n.getTime();
	
	return parseInt((t1-t2)/(1000));
}

Array.prototype.remove = function(element){
    this.splice(this.indexOf(element),1);
}