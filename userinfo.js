const Discord = require("discord.js");
module.exports = {
	userinfo: (guildmember) => {
        	var user = guildmember.user;
			
			let avatarurl = user.avatarURL;
			let isBot = user.bot;
			let createdDate = user.createdAt;
			let tag = user.discriminator;
			let id = user.id;
			let usernameinfo = user.username;
			let status = user.presence.status;
			let isPlaying = user.presence.game != null;
			let gamePlaying;
			if(isPlaying)
				gamePlaying = user.presence.game.name;
            let isStreaming = false;
            if(isPlaying)
                isStreaming = user.presence.game.streaming;
			let streamURL;
			if(isStreaming)
				streamURL = user.presence.game.url;
			let hasSentMessage = guildmember.lastMessage != null;
			let lastMessageAt;
			if(hasSentMessage)
				lastMessageAt = guildmember.lastMessage.createdAt;
			let hasNickname = guildmember.displayName != null;
			let nickname;
			if(hasNickname)
				nickname = guildmember.displayName;
			let isServerMuted = guildmember.serverMute;
			let isServerDeafen = guildmember.serverDeaf;
			let isSelfMute = guildmember.selfMute;
			let isSelfDeafen = guildmember.selfDeaf;
			let joinedAt = guildmember.joinedAt;
			let inVoice = guildmember.voiceChannel != null;
			let voicechannel;
			if(inVoice)
                voicechannel = guildmember.voiceChannel;
            const embed = new Discord.RichEmbed()
                .setAuthor(usernameinfo + "#" + tag + " / " + nickname, avatarurl)
				.setColor(0x00AE86)
				.setTitle("Stats for user:")

				.setDescription("Discord handle: " + usernameinfo + "#" + tag + "\n" +
					"Userid: " + id + "\n" +
					(isBot ? "User is a bot" : "User is not a bot") +"\n" +
					"User created at: " + createdDate + "\n" +
					"Current status: " + status + "\n" + 
					"Self muted: " + (isSelfMute ? "Yes" : "No") + "\n" +
					"Self deafen: " + (isSelfDeafen ? "Yes" : "No") + "\n" +
					(isPlaying ? "User is playing: " + gamePlaying : "User is not playing") + "\n" +
					(isStreaming ? "User is streaming at: " + streamURL : ""))
				
                .setFooter("This information was generated using srbot")
                .setThumbnail(avatarurl)
				.setTimestamp()

				.addField("Stats for this server:",
					"Server muted: " + (isServerMuted ? "Yes" : "No") + "\n" + 
					"Server deafen: " + (isServerDeafen ? "Yes" : "No") + "\n" +
					"Joined at: " + joinedAt + "\n" +
					(inVoice ? "Currently in voicechannel: " + voicechannel.name : "Currently not in voicechannel") + "\n" +
					(hasSentMessage ? "Last message on server: " + lastMessageAt : "Never sent a message on this server") + "(experimental)");
            return {embed};
    }
}