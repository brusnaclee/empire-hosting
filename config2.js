require('dotenv').config();
module.exports = {
	TOKEN: process.env.TOKEN2,
	ownerID: '522711969560657921', //write your discord user id. example: ["id"] or ["id1","id2"]
	ownerID2: ['522711969560657921', '558280654412840993'],
	GEMINI: process.env.GEMINI,
	GENIUS: process.env.GENIUS,
	botInvite:
		'https://discord.com/api/oauth2/authorize?client_id=1119304375140102184&permissions=39997687589953&scope=bot', //write your discord bot invite.
	supportServer: 'https://empire.is-great.net/', //write your discord bot support server invite.
	support: 'https://discord.gg/5fQ25DtVeH',
	mongodbURL: 'mongodb+srv://brusnaclee:2234@empire.kbvvoal.mongodb.net/', //write your mongodb url.
	status: 'your music ❤️🎶❤️ ',
	commandsDir: './commands2', //Please don't touch
	language: 'en', //en, tr, nl, pt, fr, ar, zh_TW, it, ja
	embedColor: '00FFFF', //hex color code
	errorLog: '1108313712449831034', // discord error log channel id.

	sponsor: {
		status: true, //true or false
		url: 'https://linktr.ee/empiresponsor', //.
	},

	voteManager: {
		//optional
		status: true, //true or false
		api_key:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwNDQwNjM0MTM4MzMzMDIxMDgiLCJib3QiOnRydWUsImlhdCI6MTcwODc3NDMxNn0.0Flt_Q8N68A2JSxwt3ia3ZzA5rKyjGaE9ScR-nhq7zI', //write your top.gg api key.
		vote_commands: [], //write your use by vote commands.
		vote_url: 'https://top.gg/bot/1044063413833302108/vote', //write your top.gg vote url.
	},

	shardManager: {
		shardStatus: false, //If your bot exists on more than 1000 servers, change this part to true.
	},

	playlistSettings: {
		maxPlaylist: 50, //max playlist count
		maxMusic: 500, //max music count
	},

	opt: {
		DJ: {
			commands: [
				'back',
				'clear',
				'filter',
				'loop',
				'pause',
				'resume',
				'skip',
				'stop',
				'volume',
				'shuffle',
			], //Please don't touch
		},

		voiceConfig: {
			leaveOnFinish: false, //If this variable is "true", the bot will leave the channel the music ends.
			leaveOnStop: true, //If this variable is "true", the bot will leave the channel when the music is stopped.

			leaveOnEmpty: {
				//The leaveOnEnd variable must be "false" to use this system.
				status: true, //If this variable is "true", the bot will leave the channel when the bot is offline.
				cooldown: 30000, //1000 = 1 second
			},
		},

		maxVol: 200, //You can specify the maximum volume level.
	},
};
