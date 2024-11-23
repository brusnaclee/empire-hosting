const config = require('../config.js');
const db = require('../mongoDB');
const os = require('os');
const { exec } = require('child_process');

module.exports = {
	name: 'statistic',
	description: 'View the bot statistics.',
	options: [],
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
			await interaction.deferReply();

			let totalGuilds;
			let totalMembers;
			let totalChannels;
			let shardSize;
			let voiceConnections;
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

			// Fetch memory usage
			const usedMemory = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(
				2
			);

			exec('lscpu', (error, stdout, stderr) => {
				try {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}
					const cpuInfoOutput = stdout;

					// Parse CPU information
					const regexTotalCPU = /CPU\(s\):\s+(\d+)/g;
					const regexModelName = /Model name:\s+(.*)/g;
					const regexCoresPerSocket = /Core\(s\) per socket:\s+(\d+)/g;
					const regexMaxMHz = /CPU max MHz:\s+([\d.]+)/g;
					const regexMinMHz = /CPU min MHz:\s+([\d.]+)/g;

					let totalCPU = regexTotalCPU.exec(cpuInfoOutput);
					let modelNameMatches = [...cpuInfoOutput.matchAll(regexModelName)];
					let coresPerSocketMatches = [
						...cpuInfoOutput.matchAll(regexCoresPerSocket),
					];
					let maxMHzMatches = [...cpuInfoOutput.matchAll(regexMaxMHz)];
					let minMHzMatches = [...cpuInfoOutput.matchAll(regexMinMHz)];

					// Build CPU info string
					let cpuInfo = '';
					if (totalCPU) {
						cpuInfo += `Total CPUs: ${totalCPU[1]}\n\n`;
					}
					modelNameMatches.forEach((match, index) => {
						cpuInfo += `Model Name ${index + 1}: ${match[1]}\n`;
						if (coresPerSocketMatches[index]) {
							cpuInfo += `Cores per Socket: ${coresPerSocketMatches[index][1]}\n`;
						}
						if (maxMHzMatches[index]) {
							cpuInfo += `Max MHz: ${maxMHzMatches[index][1]}\n`;
						}
						if (minMHzMatches[index]) {
							cpuInfo += `Min MHz: ${minMHzMatches[index][1]}\n`;
						}
						cpuInfo += '\n';
					});

					// Create General Embed
					const generalEmbed = new EmbedBuilder()
						.setTitle(`${client.user.username} - General Statistics`)
						.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
						.setColor(client.config.embedColor)
						.setDescription(
							`**General Information**\n\n` +
								`• User Count: \`${totalMembers}\`\n` +
								`• Server Count: \`${totalGuilds}\`\n` +
								`• Channel Count: \`${totalChannels}\`\n` +
								`• Shard Count: \`${shardSize}\`\n` +
								`• Voice Connections: \`${voiceConnections}\`\n` +
								`• Ping: \`${client.ws.ping} ms\`\n`
						);

					// Create Hardware Embed
					const hardwareEmbed = new EmbedBuilder()
						.setTitle(`${client.user.username} - Hardware Statistics`)
						.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
						.setColor(client.config.embedColor)
						.setDescription(
							`**Hardware Information**\n\n` +
								`• CPU Info:\n${cpuInfo}\n` +
								`• Memory Usage: \`${usedMemory} MB\`\n` +
								`• Architecture: \`${os.arch()}\`\n` +
								`• Node.js Version: \`${process.version}\`\n` +
								`• Discord.js Version: \`${require('discord.js').version}\`\n`
						);

					// Buttons
					const generalButton = new ButtonBuilder()
						.setCustomId('general_info')
						.setLabel('General Information')
						.setStyle(ButtonStyle.Success);

					const hardwareButton = new ButtonBuilder()
						.setCustomId('hardware_info')
						.setLabel('Hardware Information')
						.setStyle(ButtonStyle.Success);

					const buttonRow = new ActionRowBuilder().addComponents(
						generalButton,
						hardwareButton
					);

					// Send initial embed with buttons
					interaction.editReply({
						embeds: [generalEmbed],
						components: [buttonRow],
					});

					// Button Interaction Collector
					const collector = interaction.channel.createMessageComponentCollector(
						{
							filter: (i) => i.user.id === interaction.user.id,
							time: 120000, // 2 minutes
						}
					);

					collector.on('collect', async (i) => {
						if (i.customId === 'general_info') {
							await i.update({ embeds: [generalEmbed] });
						} else if (i.customId === 'hardware_info') {
							await i.update({ embeds: [hardwareEmbed] });
						}
					});

					collector.on('end', async () => {
						await interaction
							.editReply({
								components: [],
							})
							.then(() => {
								setTimeout(async () => {
									await interaction
										.deleteReply()
										.catch((err) => console.error(err));
								}, 5000);
							})
							.catch((err) => console.error(err));
					});
				} catch (e) {
					console.error(`Error processing CPU info: ${e.message}`);
				}
			});
		} catch (e) {
			console.error(e);
			await interaction.editReply({
				content: 'An error occurred while fetching statistics.',
			});
		}
	},
};
