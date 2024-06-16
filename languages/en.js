const config = require('../config.js');
const language = {
	loadevent: 'Loaded player event',
	loadcmd: 'Loaded command',
	ready: ' successfully connected.',
	loadslash: 'Successfully reloaded application [/] commands.',
	error1:
		"The Bot Token You Entered Into Your Project Is Incorrect Or Your Bot's INTENTS Are OFF!",
	error2:
		'Please set the bot token in token.js or in your .env file in your project!',
	loadclientevent: 'Loaded client event',
	embed1:
		'You must have the <@&{djRole}>(DJ) role set on this server to use this command. Users without this role cannot use the {cmdMAP}',
	message1: 'You are not connected to an audio channel. ',
	message2: 'You are not on the same audio channel as me. ',
	message3: 'Missing permission',
	msg4: 'Something went wrong',
	msg5: 'No music currently playing. ',
	msg6: 'Save Music',
	msg7: 'Write playlist name.',
	msg8: 'This song is live streaming, no duration data to display. 🎧',
	msg9: '** Success:** Time data updated.',
	msg10: "You don't already have a playlist with this name. ",
	msg11: 'This music is already in this playlist. ❌',
	msg12: 'added to your music playlist.',
	error3: 'Error reloading application [/] commands: ',
	error4:
		"WARN: It looks like you didn't write the mongodb url? If you do not enter a valid mongodb url in the config.js file, you will not be able to use the bot.",
	msg13: ` Started playing:`,
	msg14:
		'The queue is currently empty. Please consider adding more music to enjoy.',
	msg15: 'I disconnected because there is no one left in my channel.',
	msg16:
		"I'm having trouble connecting to the voice channel. Like someone disconnected me? Im very sad. 😔",
	msg17: 'There is no previous track! ',
	msg18: 'Now playing **{queue.previousTracks[1].title}**. ',
	msg19: ' Bot Statistics',
	msg20: 'Refresh',
	msg21: '**Your Time Ended!**',
	msg22: '**✅ Data Updated.**',
	msg23: 'The queue is empty. ',
	msg24: 'The queue has just been cleared. 🗑️',
	msg26:
		"If you don't specify a DJ role, you won't be able to use the command!",
	msg25: 'The DJ role is successfully set to <@&{role}>.',
	msg27: 'The DJ role is successfully deleted.',
	msg28: 'The DJ role is not already set.',
	msg29: `Please enter a valid filter name. ❌\n{filters}`,
	msg30: `I couldn't find a filter with that name. ❌\n{filters}`,
	msg31: `Applied: **{filter}**, Filter Status: **{status}**\n **Remember, if the music is long, the filter application time may be longer accordingly.**`,
	msg32: `Hello <@{interaction.user.id}>!
		Welcome to **{client.user.username} Command Help Page!**
		
		**Instruction**

		> Use **/** as the global prefix.
		> Use **/help [followed by your question for ask anything to our AI]** to see clear details.
		
		**Music Control Panel Button Instruction**

		> ◀️ button for play the preveous music.
		> 
		> ⏸️ button for pause the music.
		> 
		> ⏯️ button for resume the music.
		> 
		> ▶️ button for skip the current music.
		> 
		> 📃 button for show the lyrics.
		> 
		> ⏹️ button for stop the music.
		> 
		> <:save:1117815593043775569> button for save the music to your playlist.
		> 
		> 🔀 button for shuffle the music on the queue.
		> 
		> <:download:1230868574722064446> button for download the music via gdrive.
		> 
		> <:autoplay:1230869965435961394> button for turn the queue's autoplay on or off.
		
		**Bot Information**

		> ***help, statistic, invite, ping.***

		**Music Commands**

		> ***play music, play next, play playlist, search.***

		**Music Control**

		> ***autoplay, volume, shuffle, loop, filter, seek, remove, move, clear, back, skip, pause, resume, stop.***

		**Music Information**

		> ***nowplaying, lyrics, download, queue, time, suggest.***

		**Playlist Commands**

		> ***playlist create, playlist delete, playlist add-music, playlist delete-music, playlist lists, playlist top, save.***
		
		**Admin Server Commands**

		> ***channel add, channel remove, dj set, dj reset, language.***

		**Feedback**

		> ***feedback, report.***

		Looking to hang out, report bugs, or give feedback? Join [The Great Empire]({config.support}) and connect with fellow music lovers!

		[Invite Me]({config.botInvite}) • [Support Server]({config.support2}) • [Vote]({config.voteManager.vote_url}) • [Website]({config.supportServer}) • [Sponsor]({config.sponsor.url})
		`,
	msg33: 'Bot Commands',
	msg34: 'You already have an active command here. ❌',
	msg35: 'Queue',
	msg36: 'Now Playing Music',
	msg37: 'Stop Loop',
	msg38: 'Loop System',
	msg39: `> **How about making a choice?**
   >  
   > **Queue:** Loops the queue.
   > **Now Playing Music:** Loops the current song.
   > **Stop Loop:** Stopping the loop.`,
	msg40: 'Queue Loop Mode',
	msg41: 'Something went wrong. ',
	msg42: 'Now Playing Music Loop Mode',
	msg43: 'Loop mode is already inactive. ',
	msg44: `Loop Mode **Stopped** `,
	msg45: "Time's Up",
	msg46: 'Loop System - Ended',
	msg47: 'Save Playlist',
	msg48: 'music paused! ',
	msg49: `Message Ping`,
	msg50: `Message Latency`,
	msg51: `API Latency`,
	msg52: `There is no playlist. `,
	msg53: `You don't have permission to play this playlist. `,
	msg54: `You don't already have a music with this name. `,
	msg55: `I can't join your voice channel. <a:Cross:1116983956227772476>`,
	msg56: `Loading playlist... `,
	msg57: `<@{interaction.member.id}>, Added **{music_filter.length}** tracks to the queue. `,
	msg58: `There is no playlist with this name. `,
	msg59: `Write the name of the track you want to search. `,
	msg60: `No results found! `,
	msg61: 'Loading music(s)... ',
	msg62: 'playlist added to the queue. ',
	msg63: `Queue is empty. `,
	msg64: 'Server Music List',
	msg65: 'Currently Playing',
	msg66: 'Requested by',
	msg67: 'Page',
	msg68: `The command processor has been cancelled. `,
	msg69: `Server Music List - Time Ended!`,
	msg70: `Your time has expired to use this command, you can type \`/queue\` to use the command again.`,
	msg71: `Something went wrong. It's like you haven't stopped the music before.`,
	msg72: 'Track resumed! ',
	msg73: `Please enter a valid song name. `,
	msg74: `No search results found! `,
	msg75: 'Searched Music',
	msg76: 'Choose a song from **1** to **{maxTracks.length}** ⬇️',
	msg77: `Music search cancelled.`,
	msg78: `Loading... 🎧`,
	msg79: 'added to queue. ',
	msg80: `Song search time expired.`,
	msg81: 'Cancel',
	msg82: `The number you entered is higher than the amount of songs in the queue. `,
	msg83: 'Successfully skipped ',
	msg84: `This song is live streaming, no duration data to display. 🎧`,
	msg85: `Music stopped. Thank you for using our service `,
	msg86: 'Update',
	msg87: `Current volume: **{queue.volume}** <a:Musicon:1116994369833144350>\n**To change the volume, from \`1\` to \`{maxVol}\` Type a number between.**`,
	msg88: `The volume you want to change is already the current volume `,
	msg89: `**Type a number from \`1\` to \`{maxVol}\` to change the volume .** `,
	msg90: 'Volume changed:',
	msg91: `Write the name of the playlist you want to create. ❌`,
	msg92: `A playlist with this name already exists. ❌`,
	msg93: `You can't have more than 30 playlists. ❌`,
	msg94: 'Creating playlist... 🎧',
	msg95: 'Playlist created! 🎧',
	msg96: `You don't have a playlist with this name. ❌
Please create the playlist first by /playlist create (name of playlist)`,
	msg97: 'Deleting playlist... 🎧',
	msg98: 'Playlist deleted! 🎧',
	msg99: `Write the name of the track you want to search. ❌`,
	msg100: `Write the name of the playlist you want to add the music to. ❌`,
	msg101: `You can't have more than {max_music} musics in a playlist. ❌`,
	msg102: 'Loading music(s)... 🎧',
	msg103: 'All musics added to your playlist! 🎧',
	msg104: `This music is already in this playlist. `,
	msg105: 'added to the playlist! 🎧',
	msg106: `Write the name of the playlist you want to delete the music to. ❌`,
	msg107: `You don't have a music with this name. ❌`,
	msg108: 'Deleting music... 🎧',
	msg109: 'Music deleted! 🎧',
	msg110: 'Write the name of the playlist you want to search. ❌',
	msg111: `You don't have any music in this playlist. ❌`,
	msg112: 'Top Public Playlists',
	msg113: `Your time has expired to use this command, you can type \`/playlist top\` to use the command again.`,
	msg114: `There is no public playlist. ❌`,
	msg115: 'Your Playlists',
	msg116: `musics`,
	msg117: `You don't have any playlist. ❌`,
	msg118:
		'Your time has expired to use this command, you can type `/playlist list {name}` to use the command again.',
	msg119:
		'Use the **/play playlist <list-name>** command to listen to these playlists.\nType **/playlist list <list-name>** to see the music in a list.',
	msg120: 'Please specify a text channel.',
	msg121:
		'<#{channel}> added to the command usage channel list, now bot command can be used only on the channels in the list.',
	msg122: 'There is no data already registered.',
	msg123: '<#{channel}> deleted to the command usage channel list.',
	msg124: 'This channel is already on the command usage channel list.',
	msg125: 'This channel is not a text channel.',
	msg126:
		' Here is the list of channels you can command on this server: {channel_filter}',
	msg127: 'Command is not defined.',
	error7:
		'Please try this command again later. Possible bug reported to bot developers.',
	msg128:
		"You silenced me while the music was playing. That's why I stopped the music. If you undo the mute, I will continue. 😔",
	msg129: 'plays',
	msg130: 'Please write a valid number.',
	msg131:
		'in order to use the commands in the list, you need to vote for the bot.',
	msg132: 'No music already paused.',
	msg133: 'I shuffled the playlist order.',
	msg134: 'Incorrect usage. Example: `5:50` | `1:12:43`',
	msg135: 'Playing time was set to {queue.formattedCurrentTime} sucessfully',
	msg136:
		"Autoplay is now turned on. I'm going to turn on random music from now on.",
	msg137: 'Autoplay is off now.',
	msg138: 'Channel: **{queue?.connection.channel.name}** ',
	msg141:
		"I'm going out now because no music is playing for 2 minutes, see you again... 👋",
	msg142: 'Track {trackName} has been deleted.',
	msg143: 'Duration',
	msg144: 'Next Song',
	msg145: 'Estimated time until played',
	msg146: 'Estimated Time',
	msg147: 'Queue Position',
	msg148:
		"I've been waiting for 3 minutes, but unfortunately, there's still no music playing. Thank you for choosing our service.",
	msg149:
		'The **{trackName}** has been moved from **queue {fromOrder}** to **queue {toOrder}**.',
};
module.exports = language;
