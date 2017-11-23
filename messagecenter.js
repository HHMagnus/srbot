const fs = require("fs");
const userinfo = require('./userinfo.js');
const musichandler = require('./musichandler.js');

var memes;

module.exports = {
	handle: (msg, config) => {
		var client = module.parent.exports.client;

		let isOwner = false;
		if(msg.author.id == config.ownerid)
			isOwner = true;

		let isAdmin = false;
		if(isOwner){
			isAdmin = true;
		}
		if(config.adminid.includes(msg.author.id))
			isAdmin = true;

		let isDJ = false;
		if(isAdmin)
			isDJ = true;
		if(msg.member != null){
			for(var role of msg.member.roles.values())
				if(role.name == "DJ")
					isDJ = true;
		}

		let content = msg.content;
		if(content.startsWith("+"))
			content = content.substring(1);
		if(content.startsWith("<@" + client.user.id + "> "))
			content = content.substring(22);
		console.log("Received command: " + msg.content + " | from: " + msg.author.id);

		//makes sure memes object exists.
		if(memes == null){
			memes = JSON.parse(fs.readFileSync("./memes.json", "utf8"));
		}
		
		//probably should add some real command here
		if(content == "help"){
			msg.reply("use prefix \"+\"")
		}

		// gives userinfo about a user
		else if(content.startsWith("userinfo")){
			let username = "";
			if(content.length > 9){
				username = content.substring(9);
				username = username.slice(3,-1);
			}else
				username = msg.author.id;
			console.log(username);
			var guildmember = msg.guild.members.get(username);
			if(guildmember == null){
				msg.reply("user doesn't exist on  this server");
				return;
			}
			msg.reply(userinfo.userinfo(guildmember));
			
		}

		//sets a game
		else if(content.startsWith("setgame")){
			if(!isOwner){
				msg.reply("Only Nusmag can do this!");
				return;
			}

			client.user.setGame(content.substring(8));
		}
		
		else if(content.startsWith("stop this dude ")){
			if(!isOwner){
				msg.reply("Only a real bro can perform this task!");
				return;
			}
			let name = content.substring(15);
			if(!name.startsWith("<@")){
				msg.reply("Please tag the person you want to stop");
				console.log("Tried to stop: " + name);
				return;
			}
			let id = name.substring(2,name.length-1);
			module.parent.exports.stopList.push(id);
			msg.reply("Roger!");
		}
		
		else if(content.startsWith("he's cool now ")){
			if(!isOwner){
				msg.reply("Only a real bro can perform this task!");
				return;
			}
			
			let name = content.substring(14);
			if(!name.startsWith("<@")){
				msg.reply("Please tag the person you nolonger want to stop");
				return;
			}
			let id = name.substring(2,name.length-1);
			if(module.parent.exports.stopList.includes(id)){
				module.parent.exports.stopList.remove(id);
				msg.reply("But...");
			}else{
				msg.reply("Not telling this guy to stop");
			}
			
		}

		// REMEMBER THIS NEEDS FFMPEG INSTALLED
		else if(content == "tits"){
			var channel = msg.member.voiceChannel;
			if(channel != null && channel.joinable){
				musichandler.playSound(channel,"tits.mp3");
			}
		}else if(content == "airhorn"){
			var channel = msg.member.voiceChannel;
			if(channel != null && channel.joinable){
				musichandler.playSound(channel,"airhorn.mp3");
			}
		}

		// REMEMBER THIS NEEDS FFMPEG INSTALLED
		else if(content.startsWith("p ")){
			// Play streams using ytdl-core
			if(!notDM(msg)){
				msg.reply("This command can only be used in a server");
				return;
			}
			if(!memberInVoiceChannel(msg.member)){
				msg.reply("You're not in vc");
				return;
			}
			var channel = msg.member.voiceChannel;
			
			var streamLink = content.substring(2);

			if(!ValidURL(streamLink)){
				msg.reply("Enter a valid url");
				return;
			}
			if(!(streamLink.startsWith("https://www.youtube.com/") || streamLink.startsWith("http://www.youtube.com/"))){
				msg.reply("only supports youtube atm");
				return;
			}

			musichandler.queue(channel,streamLink,msg);

		}

		// skip music
		else if(content == "skip"){
			if(notDM(msg) && isDJ)
				musichandler.skipPlaying(msg);
		}
		// stop music
		else if(content == "stop"){
			if(notDM(msg) && isDJ)
				musichandler.stopPlaying(msg);
		}

		//display queue
		else if(content == "queue"){
			if(notDM(msg))
				musichandler.displayQueue(msg);

		}
		
		//info about logging player runs
		else if(content == "playerlog"){
			msg.reply("usage: +playerlog <type> <player>. Where type is either normal, nm or jv and player is the name of the player");
		}else if(content == "playerstop"){
			msg.reply("usage: +playerstop <type> <player>. Where type is either normal, nm or jv and player is the name of the player");
		}
		
		//starts logging runs for player
		else if(content.startsWith("playerlog ") || content.startsWith("playerstop ")){
			if(!isAdmin){
				msg.reply("experimental feature, admins only");
				return;
			}
			var splits = content.split(" ");
			if(!splits.length == 3){
				msg.reply("error, usage +" + splits[0] + " <type> <player>");
				return;
			}
			let type = splits[1];
			if(type != "normal" && type != "nm" && type != "jv"){
				msg.reply("error, second argument must be either normal, nm or jv (input: " + type + ")");
				return;
			}
			if(splits[0] == "playerlog")
				module.parent.exports.logsub.addPlayerChannel(msg.channel, type, splits[2]);
			else
				module.parent.exports.logsub.removePlayerChannel(msg.channel, type, splits[2]);
		}

		//info about logging runs sub
		else if(content == "logsub"){
			msg.reply("usage: +logsub <type> <time>. Where type is either normal, nm or jv and time is between 1-60 minutes (to stop logging use \"stopsub\")");
		}
		else if(content == "stopsub"){
			msg.reply("usage: +stopsub <type> <time>. Where type is either normal, nm or jv and time is between 1-60 minutes (to start logging use \"logsub\")");
		}

		//starts logging runs sub
		else if(content.startsWith("logsub ") || content.startsWith("stopsub ")){
			if(!isAdmin){
				msg.reply("experimental feature, admins only");
				return;
			}
			var splits = content.split(" ");
			if(!splits.length == 3){
				msg.reply("error, usage: +" + splits[0] + " <type> <time>");
				return;
			}
			let type = splits[1];
			if(type != "normal" && type != "nm" && type != "jv"){
				msg.reply("error, second argument must be either normal, nm or jv");
				return;
			}
			if(!Number.isInteger(parseInt(splits[2]))){
				msg.reply("error, third argument must be a number (" + splits[2] + ")");
				return;
			}
			let sub = parseInt(splits[2]);
			if(sub < 1 || sub > 59){
				msg.reply("Only supporting values between 1-60 minutes");
				return;
			}
			if(splits[0] == "logsub")
				module.parent.exports.logsub.addSubChannel(msg.channel, type, sub);
			else
				module.parent.exports.logsub.removeSubChannel(msg.channel, type, sub);
		}

		//add new command image
		else if(content.startsWith("add ")){
			if(!isAdmin){
				msg.reply("only admins can add stuff");
				return;
			}

			let split = content.substring(4).split(" ")
			if(!(split.length == 2)){
				msg.reply("Not added, use format: <key> <url>");
				return;
			}

			if(!ValidURL(split[1])){
				msg.reply("Please enter a valid url");
				return;
			}
			if(ValidURL(split[0])){
				msg.reply("Please put url as second argument")
				return;
			}

			memes[split[0]] = split[1];

			saveMemes(memes);

			msg.reply("added: " + split[1] + " to command " + split[0]);
		}

		//removes a meme
		else if(content.startsWith("remove ")){
			if(!isAdmin){
				msg.reply("admins only");
				return;
			}

			let rem = content.substring(7);
			if(memes[rem] == null){
				msg.reply("meme doesn't exist");
				return;
			}

			delete memes[rem];

			saveMemes(memes);
			
			msg.reply("meme: " + rem + ", deleted");
		}
		
		//show the entire memelist
		else if(content == "memelist"){
			msg.reply(("" + Object.keys(memes)).replaceAll(",", ", "));
		}

		//checks if command is a meme
		else if(memes[content] != null){
			msg.channel.send(memes[content]);
		}
	}
} 

//returns true if message is not from a DM or GroupDM
function notDM(msg){
	if(msg.channel.type == "text")
		return true;
	else
		return false;
}

//returns true if GuildMember is in a voice channel
function memberInVoiceChannel(member){
	return member.voiceChannel != null && member.voiceChannel.joinable;
}

// npm install valid-url

function ValidURL(str) {
	var validUrl = require('valid-url');
  
    if (validUrl.isUri(str)){
        return true;
    } else {
        return false;
    }
}

function saveMemes(memes){
	fs.writeFile("./memes.json", JSON.stringify(memes), (err) => {
		if (err) console.error(err)
	});
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};