const config = require('../config.js');
const db = require('../mongoDB');
const os = require('os');
const { exec } = require('child_process'); // Menambahkan child process
module.exports = {
	name: 'statistic',
	description: 'View the bot statistics.',
	options: [],
	permissions: '0x0000000000000800',
	run: async (client, interaction) => {
		let lang = await db?.musicbot
			?.findOne({ guildID: interaction.guild.id })
			.catch((e) => {});
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);
		try {
			const {
				ActionRowBuilder,
				ButtonBuilder,
				EmbedBuilder,
				ButtonStyle,
			} = require('discord.js');
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

			const usedMemory = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(
				2
			);

			exec('getprop ro.build.version.release', (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				const osVersion = stdout.trim(); // Menghapus spasi di sekitar hasil eksekusi

				// Menjalankan perintah lscpu menggunakan child process
				exec('lscpu', (error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}
					const cpuInfoOutput = stdout; // Mengambil output dari lscpu

					// Mencocokkan informasi yang dibutuhkan menggunakan regex
					const regexTotalCPU = /CPU\(s\):\s+(\d+)/g;
					const regexModelName = /Model name:\s+(.*)/g;
					const regexCoresPerSocket = /Core\(s\) per socket:\s+(\d+)/g;
					const regexScalingMHz = /CPU\(s\) scaling MHz:\s+(\d+)/g;
					const regexMaxMHz = /CPU max MHz:\s+([\d.]+)/g;
					const regexMinMHz = /CPU min MHz:\s+([\d.]+)/g;

					let totalCPU = regexTotalCPU.exec(cpuInfoOutput);
					let modelNameMatches = [...cpuInfoOutput.matchAll(regexModelName)];
					let coresPerSocketMatches = [
						...cpuInfoOutput.matchAll(regexCoresPerSocket),
					];
					let scalingMHzMatches = [...cpuInfoOutput.matchAll(regexScalingMHz)];
					let maxMHzMatches = [...cpuInfoOutput.matchAll(regexMaxMHz)];
					let minMHzMatches = [...cpuInfoOutput.matchAll(regexMinMHz)];

					// Menyusun informasi yang ditemukan ke dalam format yang diinginkan
					let cpuInfo = '';
					if (totalCPU) {
						cpuInfo += `\`\`\`${totalCPU[0]}\n\n`;
					}
					modelNameMatches.forEach((match, index) => {
						cpuInfo += `Model Name ${index + 1}: ${match[1]}\n`;
						if (coresPerSocketMatches[index]) {
							cpuInfo += `Cores per Socket: ${coresPerSocketMatches[index][1]}\n`;
						}
						if (scalingMHzMatches[index]) {
							cpuInfo += `Scaling MHz: ${scalingMHzMatches[index][1]}%\n`;
						}
						if (maxMHzMatches[index]) {
							cpuInfo += `Max MHz: ${maxMHzMatches[index][1]}\n`;
						}
						if (minMHzMatches[index]) {
							cpuInfo += `Min MHz: ${minMHzMatches[index][1]}\n`;
						}
						cpuInfo += '\n';
					});
					cpuInfo += '```'; // Menutup tag ``` di akhir cpuInfo

					const embed = new EmbedBuilder()
						.setTitle(
							'<a:Statisticreverse:1117043433022947438> ' +
								client.user.username +
								lang.msg19 +
								' <a:Statistic:1117010987040645220>'
						)
						.setThumbnail(
							client.user.displayAvatarURL({ dynamic: true, size: 1024 })
						)
						.setColor(client.config.embedColor)
						.setTimestamp();

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

					embed.setDescription(`**General Information:\n\n
• Owner: \`brusnaclee#0\`
• Developer: \`brusnaclee#0\`
• User Count: \`${totalMembers || 0}\`
• Server Count: \`${totalGuilds || 0}\`
• Channel Count: \`${totalChannels || 0}\`
• Shard Count: \`${shardSize || 0}\`
• Connected Voice: \`${voiceConnections}\`
• Command Count: \`${client.commands.map((c) => c.name).length}\`
• Operation Time: <t:${Math.floor(Number(Date.now() - client.uptime) / 1000)}:R>
• Ping: \`${client.ws.ping} MS\`
• Invite Bot: [Click](${config.botInvite})
• Website bot: [Click](${config.supportServer})
${
	config.sponsor.status == true
		? `• Sponsor: [Click](${config.sponsor.url})`
		: ``
}
${
	config.voteManager.status == true
		? `• Vote: [Click](${config.voteManager.vote_url})`
		: ``
}
**`);

					interaction
						.reply({
							embeds: [embed],
							components: [buttonRow],
						})
						.then(() => {
							const filter = (interaction) =>
								interaction.user.id === interaction.user.id;
							const collector =
								interaction.channel.createMessageComponentCollector({
									filter,
									time: 120000, // 120 seconds or 2 minute
								});

							collector.on('collect', async (interaction) => {
								if (interaction.customId === 'general_info') {
									embed.setDescription(`**General Information:\n\n
• Owner: \`brusnaclee#0\`
• Developer: \`brusnaclee#0\`
• User Count: \`${totalMembers || 0}\`
• Server Count: \`${totalGuilds || 0}\`
• Channel Count: \`${totalChannels || 0}\`
• Shard Count: \`${shardSize || 0}\`
• Connected Voice: \`${voiceConnections}\`
• Command Count: \`${client.commands.map((c) => c.name).length}\`
• Operation Time: <t:${Math.floor(Number(Date.now() - client.uptime) / 1000)}:R>
• Ping: \`${client.ws.ping} MS\`
• Invite Bot: [Click](${config.botInvite})
• Website bot: [Click](${config.supportServer})
${
	config.sponsor.status == true
		? `• Sponsor: [Click](${config.sponsor.url})`
		: ``
}
${
	config.voteManager.status == true
		? `• Vote: [Click](${config.voteManager.vote_url})`
		: ``
}
**`);
									await interaction.update({ embeds: [embed] });
								} else if (interaction.customId === 'hardware_info') {
									embed.setDescription(`**Hardware Information:\n\n
• CPU Info:${cpuInfo}
• Host Memory Usage: \`${usedMemory} MB\`
• Bot Memory Usage: \`${(process.memoryUsage().rss / 1024 / 1024).toFixed(
										2
									)} MB\`
• Architecture: \`${os.arch()}\`
• OS Version: \`${osVersion}\`
• Platform: \`${os.platform()}\`
**`);
									await interaction.update({ embeds: [embed] });
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
						});
				});
			});
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
