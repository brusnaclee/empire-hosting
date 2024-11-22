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

			// Initialize bot stats
			let totalGuilds = client.guilds.cache.size;
			let totalMembers = client.guilds.cache.reduce(
				(acc, guild) => acc + guild.memberCount,
				0
			);
			let totalChannels = client.guilds.cache.reduce(
				(acc, guild) => acc + guild.channels.cache.size,
				0
			);
			let shardSize = 1;
			let voiceConnections = client?.voice?.adapters?.size || 0;

			// Fetch memory usage
			const usedMemory = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(
				2
			);

			// Execute Linux commands for detailed OS and CPU info
			exec('lsb_release -a', (error, stdout) => {
				if (error) {
					console.error(error);
					return;
				}
				const osInfoLines = stdout.split('\n');
				const descriptionLine = osInfoLines.find((line) =>
					line.startsWith('Description:')
				);
				const osVersion = descriptionLine
					? descriptionLine.split(':')[1].trim()
					: 'Unknown';

				exec('lscpu', (error, cpuInfo) => {
					if (error) {
						console.error(error);
						return;
					}

					// General Embed
					const embed = new EmbedBuilder()
						.setTitle(
							`<a:Statisticreverse:1117043433022947438> ${client.user.username} Statistics <a:Statistic:1117010987040645220>`
						)
						.setThumbnail(
							client.user.displayAvatarURL({ dynamic: true, size: 1024 })
						)
						.setColor(client.config.embedColor)
						.setDescription(
							`**General Information:\n\n
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
• Website Bot: [Click](${config.supportServer})
${
	config.sponsor.status ? `• Sponsor: [Click](${config.sponsor.url})` : ''
}
${
	config.voteManager.status
		? `• Vote: [Click](${config.voteManager.vote_url})`
		: ''
}
**`
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
					interaction.editReply({ embeds: [embed], components: [buttonRow] });

					// Collector for button interactions
					const collector = interaction.channel.createMessageComponentCollector({
						filter: (i) => i.user.id === interaction.user.id,
						time: 120000, // 2 minutes
					});

					collector.on('collect', async (i) => {
						if (i.customId === 'general_info') {
							// Update embed to General Information
							embed.setDescription(
								`**General Information:\n\n
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
• Website Bot: [Click](${config.supportServer})
${
	config.sponsor.status ? `• Sponsor: [Click](${config.sponsor.url})` : ''
}
${
	config.voteManager.status
		? `• Vote: [Click](${config.voteManager.vote_url})`
		: ''
}
**`
							);
							await i.update({ embeds: [embed] });
						} else if (i.customId === 'hardware_info') {
							// Update embed to Hardware Information
							embed.setDescription(
								`**Hardware Information:\n\n
• CPU Info: \`${cpuInfo.trim()}\`
• Host Memory Usage: \`${usedMemory} MB\`
• Bot Memory Usage: \`${(
									process.memoryUsage().rss /
									1024 /
									1024
								).toFixed(2)} MB\`
• Architecture: \`${os.arch()}\`
• OS Version: \`${osVersion}\`
**`
							);
							await i.update({ embeds: [embed] });
						}
					});

					collector.on('end', () => {
						interaction.editReply({ components: [] }).catch(console.error);
					});
				});
			});
		} catch (e) {
			console.error(e);
			await interaction.editReply({
				content: 'An error occurred while fetching statistics.',
			});
		}
	},
};
