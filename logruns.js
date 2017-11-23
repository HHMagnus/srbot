const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const http = require('http');

var schedule = require('node-schedule');
var j;



module.exports = {
    logRuns: (channel,name) =>{
        logRuns(channel,name);
    },
    stopLogging: (channel) =>{
        j.cancel();
        channel.send("Stopped logging!");
    }
}

function logRuns(channel, name){
    console.log("now logging for: " + name + " in channel " + channel.name);
    channel.send("starting to log: " + name + "\n" + "type \"stop logging\" to manuel stop log.");
    if(j != null) j.cancel();
    lastDate = new Date().toString();

    var lastDate;
    
    var delayRuns = 5;
    
    var victoryandfail = [];
    
    var lastCheckPointDate;
    
        //schedule a log every <delay> seconds
        j = schedule.scheduleJob('*/' + delayRuns + ' * * * * *', function(){
            var options = {
                host: 'origin.warframe.com',
                path: '/dynamic/trialStats.php'
            }
            var request = http.request(options, function (res) {
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });
                res.on('end', function () {
                    //console.log(data);
                    let date = new Date();
                    const dom = new JSDOM(data);
                    for(var row of dom.window.document.querySelector("table").rows){
                        if(row.cells[7].textContent.split(", ").includes(name)){
                            if(row.cells[1].textContent == "VICTORY" || row.cells[1].textContent == "FAILED"){
                                if(!(victoryandfail.includes(row.cells[8].textContent))){
                                    victoryandfail.push(row.cells[8].textContent);
                                    if(victoryandfail.length > 25)
                                        victoryandfail.shift();
                                    channel.send("```" + "Date: " + row.cells[8].textContent + "; Obj: " + row.cells[1].textContent + "; Time: " + row.cells[2].textContent + "```");
                                    lastDate = date.toString();
                                }
                            }
                            else if(lastCheckPointDate != row.cells[8].textContent){
                                channel.send("```" + "Date: " + row.cells[8].textContent + "; Obj: " + row.cells[1].textContent + "; Time: " + row.cells[2].textContent + "```");
                                lastCheckPointDate = row.cells[8].textContent;
                                lastDate = date.toString();
                            }
                        }
                    }
                    if((date - new Date(lastDate)) > 600000){
                        j.cancel();
                        channel.send("Stopped logging since this person haven't appeared in a raid for 10 minutes");
                    }
                });
            });
            request.on('error', function (e) {
                console.log(e.message);
            });
            request.end();
        });
    
}