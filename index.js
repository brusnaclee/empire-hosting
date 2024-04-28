const Discord = require('discord.js-selfbot-v13');
const { ShardingManager } = require('discord.js');
const config = require('./config.js');

const client = new Discord.Client({
	readyStatus: false,
	checkUpdate: false,
});

function formatTime() {
	const date = new Date();
	const options = {
		timeZone: 'Asia/Jakarta',
		hour12: false,
		hour: 'numeric',
		minute: 'numeric',
	};
	return new Intl.DateTimeFormat('en-US', options).format(date);
}

function getNextUpdateDelay() {
	const currentTime = new Date();
	// Menghitung delay agar update terjadi setiap 1 menit (60000 milidetik)
	const delay =
		60000 * 1 -
		(currentTime.getSeconds() * 1000 + currentTime.getMilliseconds());
	return delay;
}

client.on('ready', async () => {
	console.log(`${client.user.tag} - rich presence started!`);

	const r = new Discord.RichPresence()
		.setApplicationId('1105488263130664960')
		.setType('LISTENING')
		.setURL('https://empire.is-great.net/')
		.setState('Doing something good')
		.setName('My Music')
		.setDetails(`Making a Bot [${formatTime()}]`)
		.setStartTimestamp(Date.now())
		.setAssetsLargeImage(
			'https://cdn.discordapp.com/attachments/1115546058135720047/1210428399303266314/Empire_logo.png?ex=662b1fcb&is=6618aacb&hm=9d330ce251cf128d8a1573980047a3866f83aa4fa29e8268a6c3a922d4305ff6&'
		)
		.setAssetsLargeText('Lets be a friend 👍')
		.setAssetsSmallImage(
			'https://cdn.discordapp.com/attachments/1115546058135720047/1210428468152762388/member.gif?ex=662b1fdb&is=6618aadb&hm=bda03e1af0a62d823ec637898e646b027b083bb594549efdc4ef2cd9468489b5&'
		)
		.setAssetsSmallText('Hello')
		.addButton('My Bot Website', 'https://empire.is-great.net/');

	client.user.setActivity(r);
	client.user.setPresence({ status: 'idle' });

	let prevTime = null;
	setInterval(() => {
		const newTime = formatTime();
		if (newTime !== prevTime) {
			const newDetails = `Making a Bot [${newTime}]`;
			r.setDetails(newDetails);
			client.user.setActivity(r);
			prevTime = newTime;
		}
	}, getNextUpdateDelay()); // Menggunakan fungsi getNextUpdateDelay() untuk interval 1 menit
});

const mySecret =
	'NTIyNzExOTY5NTYwNjU3OTIx.GsJbLN.pVcMZIircYiWhR0tGPgCPdnXhn9YzgfcyUsRlQ';
client.login(mySecret); // Memindahkan client.login(mySecret) ke sini

if (config.shardManager.shardStatus == true) {
	const manager = new ShardingManager('./bot.js', {
		token: config.TOKEN || process.env.TOKEN,
	});
	manager.on('shardCreate', (shard) =>
		console.log(`Launched shard ${shard.id}`)
	);
	manager.spawn();
} else {
	require('./bot.js'); // Menambahkan require("./bot.js") di bagian terakhir
}
