const config = require('../config.js');
const { ActivityType } = require('discord.js');

module.exports = async (client) => {
	let lang = client.language;
	lang = require(`../languages/${lang}.js`);

	if (config.mongodbURL || process.env.MONGO) {
		const { REST } = require('@discordjs/rest');
		const { Routes } = require('discord-api-types/v10');
		const rest = new REST({ version: '10' }).setToken(
			config.TOKEN || process.env.TOKEN
		);
		(async () => {
			try {
				await rest.put(Routes.applicationCommands(client.user.id), {
					body: await client.commands,
				});
				console.log(lang.loadslash);
			} catch (err) {
				console.log(lang.error3 + err);
			}
		})();

		console.log(client.user.username + lang.ready);
		let totalMembers;

		if (config.shardManager.shardStatus == true) {
			const promises = [
				client.shard.fetchClientValues('guilds.cache.size'),
				client.shard.broadcastEval((c) =>
					c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
				),
				client.shard.broadcastEval((c) =>
					c.guilds.cache.reduce(
						(acc, guild) => acc + guild.channels.cache.size,
						0
					)
				),
				client.shard.broadcastEval((c) => c.voice?.adapters?.size || 0),
			];
			await Promise.all(promises).then((results) => {
				totalGuilds = results[0].reduce(
					(acc, guildCount) => acc + guildCount,
					0
				);
				totalMembers = results[1].reduce(
					(acc, memberCount) => acc + memberCount,
					0
				);
				totalChannels = results[2].reduce(
					(acc, channelCount) => acc + channelCount,
					0
				);
				shardSize = client.shard.count;
				voiceConnections = results[3].reduce(
					(acc, voiceCount) => acc + voiceCount,
					0
				);
			});
		} else {
			totalGuilds = client.guilds.cache.size;
			totalMembers = client.guilds.cache.reduce(
				(acc, guild) => acc + guild.memberCount,
				0
			);
			totalChannels = client.guilds.cache.reduce(
				(acc, guild) => acc + guild.channels.cache.size,
				0
			);
			shardSize = 1;
			voiceConnections = client?.voice?.adapters?.size || 0;
		}

		const activities = [
			{ name: `With ${totalMembers} Users`, type: ActivityType.Listening },
			{ name: `${config.status}`, type: ActivityType.Listening },
			{ name: 'With AI', type: ActivityType.Playing },
			{ name: `With ${totalMembers} Users`, type: ActivityType.Listening },
			{ name: 'Anime', type: ActivityType.Watching },
			{ name: `${config.status}`, type: ActivityType.Listening },

			// Add more activities as desired
		];

		let activityIndex = 0;

		setInterval(() => {
			client.user.setActivity(activities[activityIndex]);
			activityIndex = (activityIndex + 1) % activities.length;
		}, 30000); // Change activity every 30 seconds

		client.errorLog = config.errorLog;
	} else {
		console.log(lang.error4);
	}

	if (
		client.config.voteManager.status === true &&
		client.config.voteManager.api_key
	) {
		const { AutoPoster } = require('topgg-autoposter');
		const ap = AutoPoster(client.config.voteManager.api_key, client);
		ap.on('posted', () => {});
	}
};
