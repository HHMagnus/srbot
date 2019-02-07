# (Legacy) srbot
This bot was made to extract data about a gamemode in Warframe, which is no longer available. And as such it will no longer be supported.
--
This bot was used to keep track of the leaderboards for the Trials gamemode in Warframe. It would send messages on discord each time a new checkpoint was hit with the given time.

The bot is built in node.js using the discord.js library.
Certain commands require certain permissions. The permission hierarchy is as follows:
- User (Default)
- DJ (special server role required)
- Admin
- Owner
Certain commands require certain permissions. The permissions is updated in the config.js.

All commands starts with either + or tagging the bot.

The format is as follows, \<command> <...arguments>(\<role required>), \<description>)

Supported commands:
  - +help (User), shows help menu.
  - +userinfo \<name> (User), show information about a given user name, role, ids, ect.
  - +setgame \<Game> (Owner), sets the game the bot is playing
  - +p \<url> (DJ), plays music from a video or livestream
  - +skip (DJ), skips the current song
  - +queue (User), shows the song queue
  - +stop (DJ), stops the music
  - +add \<cmd> \<url> (Admin), adds an image to be displayed every time <cmd> is typed in chat
  - +remove \<cmd> (Admin), removes the behaviour of the previous command
  - +memelist (Admin), shows all commands that display images
  
Legacy commands:
  - +playerlog \<type> \<name> (Admin), keeps track of the current checkpoints of the Trial
  - +playerstop \<type> \<name> (Admin), stops the previous command
  - +logsub \<type> \<time> (Admin), logs all runs below a given time
  - +stopsub \<type> \<time> (Admin), stops logging all runs below a given time
