const ytdl = require('ytdl-core');

const streamOptions = { seek: 0, volume: 1 };

var servers = {};

module.exports = {
    skipPlaying: (msg) =>{
        skipPlaying(msg);
    },
    stopPlaying: (msg) =>{
        stopPlaying(msg);
    },
    queue: (channel, streamLink, msg) =>{
        queue(channel,streamLink, msg);
    },
    playSound: (channel, fileURL) => {
        return playSoundInChannel(channel, fileURL);
    },
    displayQueue: (msg) =>{
        displayQueue(msg);
    }
}

function getServer(serverid){
    if(!servers[serverid]) servers[serverid] = {
        ytAudioQueue: [],
        isPlaying: false,
        dispatcher: null,
        musicTextChannel: null
    };
    return servers[serverid];
}

function playSoundInChannel(channel, fileURL){
    var server = getServer(channel.guild.id);
    if(!server.isPlaying){
        server.isPlaying = true;
        channel.join()
				.then(connection => {
					console.log('Connected!');
                    server.dispatcher = connection.playFile(fileURL);
					server.dispatcher.on("end", str =>{
                        console.log("played");
                        channel.leave();
                        server.isPlaying = false;
					});
				})
                .catch(console.error);
        return true;
    }else
        return false;
}

function skipPlaying(msg){
    var server = getServer(msg.guild.id);
    if(server.isPlaying){
        server.dispatcher.end();
        msg.channel.send("Successfully skipped!");
    }else{
        msg.channel.send("Currently not playing!");
    }
    
}
function stopPlaying(msg){
    var server = getServer(msg.guild.id);
    if(server.isPlaying){
        let songLength = server.ytAudioQueue.length;
        server.ytAudioQueue = [];
        server.dispatcher.end();
        msg.channel.send("Stopped playing! Skipped " + songLength + " songs");
    }else{
        msg.channel.send("Currently not playing!");
    }
    
}

function queue(channel, streamLink, msg){
    var server = getServer(msg.guild.id);
    if(server.isPlaying){
        ytdl.getInfo(streamLink).then(info =>{
            msg.channel.send("added " + info.title + " to queue");
        });
        server.ytAudioQueue.push(streamLink);
    }else{
        server.musicTextChannel = msg.channel;
        playStream(channel,streamLink,msg);
    }
}

function playStream(channel, streamLink, msg){
    var server = getServer(channel.guild.id);
    server.isPlaying =true;
    channel.join()
			.then(connection => {
                server.ytAudioQueue.push(streamLink);
                playNext(connection);
			})
			.catch(console.error);
}

function playNext(connection){
    var server = getServer(connection.channel.guild.id);
    if(server.ytAudioQueue.length < 1){
        connection.disconnect();
        server.isPlaying = false;
        console.log("Disconnection from voicechat");
        return;
    }
    var streamLink = server.ytAudioQueue[0];
    server.ytAudioQueue.splice(0,1);
    console.log("Gonna play: " + streamLink);
    ytdl.getInfo(streamLink).then(info =>{
        server.musicTextChannel.send("Now playing: " + info.title);
    });
    const stream = ytdl(streamLink/*, { filter : 'audioonly' }*/);
    server.dispatcher = connection.playStream(stream, streamOptions);
				server.dispatcher.on("end", str=>{
                    console.log("played");
                    playNext(connection);
				});
}

function displayQueue(msg){
    var server = getServer(msg.guild.id);
    if(server.ytAudioQueue.length > 0){
        ytdl.getInfo(server.ytAudioQueue[0]).then(info =>{
            msg.channel.send("Currently " + server.ytAudioQueue.length + " songs in queue" + "\n" +
                "Next song: " + info.title);
        });
    }else{
        msg.channel.send("Currently no songs in queue");
    }
}