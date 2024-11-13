const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { DeezerPlugin } = require('@distube/deezer');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { fetch } = require('undici');
const config = require('./config.js');
const fs = require('fs');

const cookies = JSON.parse(fs.readFileSync('cookies.json'));

const cookieString = cookies
	.map((cookie) => `${cookie.name}=${cookie.value}`)
	.join('; ');

const cookiesclient = {
	dispatch: (url, opts) => {
		opts.headers = {
			...opts.headers,
			cookie: cookieString,
		};
		return fetch(url, opts);
	},
};

const client = new Client({
	partials: [
		Partials.Channel, // for text channel
		Partials.GuildMember, // for guild member
		Partials.User, // for discord user
	],
	intents: [
		GatewayIntentBits.Guilds, // for guild related things
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations, // for discord Integrations
		GatewayIntentBits.GuildVoiceStates, // for voice related things
	],
});

client.config = config;
client.player = new DisTube(client, {
	leaveOnStop: config.opt.voiceConfig.leaveOnStop,
	leaveOnFinish: config.opt.voiceConfig.leaveOnFinish,
	leaveOnEmpty: config.opt.voiceConfig.leaveOnEmpty.status,
	emitNewSongOnly: true,
	emitAddSongWhenCreatingQueue: false,
	emitAddListWhenCreatingQueue: false,
	ytdlOptions: {
		requestOptions: {
			client: cookiesclient,
		},
	},
	plugins: [
		new SpotifyPlugin(),
		new SoundCloudPlugin(),
		new YtDlpPlugin(),
		new DeezerPlugin(),
	],
});

const player = client.player;
client.language = config.language || 'en';
let lang = require(`./languages/${config.language || 'en'}.js`);

fs.readdir('./events', (_err, files) => {
	files.forEach((file) => {
		if (!file.endsWith('.js')) return;
		const event = require(`./events/${file}`);
		let eventName = file.split('.')[0];
		console.log(`${lang.loadclientevent}: ${eventName}`);
		client.on(eventName, event.bind(null, client));
		delete require.cache[require.resolve(`./events/${file}`)];
	});
});

fs.readdir('./events/player', (_err, files) => {
	files.forEach((file) => {
		if (!file.endsWith('.js')) return;
		const player_events = require(`./events/player/${file}`);
		let playerName = file.split('.')[0];
		console.log(`${lang.loadevent}: ${playerName}`);
		player.on(playerName, player_events.bind(null, client));
		delete require.cache[require.resolve(`./events/player/${file}`)];
	});
});

client.commands = [];
fs.readdir(config.commandsDir, (err, files) => {
	if (err) throw err;
	files.forEach(async (f) => {
		try {
			if (f.endsWith('.js')) {
				let props = require(`${config.commandsDir}/${f}`);
				client.commands.push({
					name: props.name,
					description: props.description,
					options: props.options,
				});
				console.log(`${lang.loadcmd}: ${props.name}`);
			}
		} catch (err) {
			console.log(err);
		}
	});
});

if (config.TOKEN || process.env.TOKEN) {
	client.login(config.TOKEN || process.env.TOKEN).catch((e) => {
		console.log(lang.error1);
	});
} else {
	setTimeout(() => {
		console.log(lang.error2);
	}, 2000);
}

if (config.mongodbURL || process.env.MONGO) {
	const mongoose = require('mongoose');
	mongoose
		.connect(config.mongodbURL || process.env.MONGO, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(async () => {
			console.log(`Connected MongoDB`);
		})
		.catch((err) => {
			console.log('\nMongoDB Error: ' + err + '\n\n' + lang.error4);
		});
} else {
	console.log(lang.error4);
}
