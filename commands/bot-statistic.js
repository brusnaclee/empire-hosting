const config = require('../config.js');
const db = require('../mongoDB');
const os = require('os');
const { exec } = require('child_process');

module.exports = {
	name: 'statistic',
	description: 'View the bot statistics.',
	options: [],
	permissions: '0x0000000000000800',
	run: async (client, interaction) => {
		let lang = await db?.musicbot
			?.findOne({ guildID: interaction.guild.id })
			.catch(() => {});
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);

		try {
			const {
				ActionRowBuilder,
				ButtonBuilder,
				EmbedBuilder,
				ButtonStyle,
			} = require('discord.js');

			let totalGuilds, totalMembers, totalChannels, shardSize, voiceConnections;

			if (config.shardManager.shardStatus) {
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
					totalGuilds = results[0].reduce((acc, count) => acc + count, 0);
					totalMembers = results[1].reduce((acc, count) => acc + count, 0);
					totalChannels = results[2].reduce((acc, count) => acc + count, 0);
					shardSize = client.shard.count;
					voiceConnections = results[3].reduce((acc, count) => acc + count, 0);
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

			await interaction.deferReply({ content: 'loading...' });

			const usedMemory = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(
				2
			);
			const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
			const freeMemory = (os.freemem() / 1024 / 1024).toFixed(2);
			const botMemoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(
				2
			);

			// Gather OS information
			exec('lsb_release -a', (error, stdout) => {
				const osInfo = error
					? 'Unknown OS'
					: stdout.split('Description:')[1]?.trim() || 'Unknown OS';

				exec('lscpu', (error, stdout) => {
					const cpuInfo = error
						? 'Unknown CPU'
						: os.cpus()[0]?.model || 'Unknown CPU';
					const cores = os.cpus().length;
					const speed = os.cpus()[0]?.speed || 'Unknown';

					const embed = new EmbedBuilder()
						.setTitle(`📊 Bot Statistics - ${client.user.username}`)
						.setThumbnail(
							client.user.displayAvatarURL({ dynamic: true, size: 1024 })
						)
						.setColor(client.config.embedColor)
						.setTimestamp().setDescription(`**= GENERAL STATISTICS =**
• **Servers**: ${totalGuilds.toLocaleString()}
• **Users**: ${totalMembers.toLocaleString()}
• **Channels**: ${totalChannels.toLocaleString()}
• **Voice Connections**: ${voiceConnections}
• **Commands**: ${client.commands.size}
• **Shards**: ${shardSize}
• **Ping**: ${client.ws.ping} ms
• **Uptime**: <t:${Math.floor(Date.now() / 1000 - client.uptime / 1000)}:R>

**= SYSTEM INFORMATION =**
• **OS**: ${osInfo}
• **Platform**: ${os.platform()}
• **Arch**: ${os.arch()}
• **CPU**: 
> **Model**: ${cpuInfo}
> **Cores**: ${cores}
> **Speed**: ${speed} MHz
• **Memory**:
> **Total**: ${totalMemory} MB
> **Free**: ${freeMemory} MB
> **Used**: ${usedMemory} MB
> **Bot Usage**: ${botMemoryUsage} MB`);

					interaction.editReply({ embeds: [embed] });
				});
			});
		} catch (e) {
			console.error(e);
			await interaction.editReply({
				content:
					lang.msgError || 'An error occurred while fetching statistics.',
			});
		}
	},
};
