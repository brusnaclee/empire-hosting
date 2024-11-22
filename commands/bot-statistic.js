const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const os = require('os');
const { exec } = require('child_process');
const ms = require('ms');

module.exports = {
	name: 'statistic',
	description: 'View the bot statistics.',
	options: [],
	run: async (client, interaction) => {
		try {
			// Fetch basic stats
			const totalGuilds = client.guilds.cache.size;
			const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
			const totalChannels = client.channels.cache.size;
			const shardSize = client.shard?.count || 1;
			const voiceConnections = client.voice?.adapters?.size || 0;
			const usedMemory = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
			const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
			const uptime = ms(client.uptime, { long: true });

			// Fetch OS and CPU info
			let osVersion = 'Unknown OS';
			let cpuInfo = 'Unknown CPU';
			exec('lsb_release -d', (error, stdout) => {
				if (!error) osVersion = stdout.split(':')[1]?.trim();
			});

			exec('lscpu', (error, stdout) => {
				if (!error) {
					const modelMatch = stdout.match(/Model name:\s+(.+)/);
					cpuInfo = modelMatch ? modelMatch[1] : cpuInfo;
				}
			});

			await interaction.deferReply();

			// Create the main embed
			const embed = new EmbedBuilder()
				.setTitle(`<a:statistic:1117010987040645220> ${client.user.username} Statistics`)
				.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
				.setColor('#00FF00')
				.setTimestamp()
				.addFields(
					{
						name: 'General Information',
						value: `\`\`\`
• User Count: ${totalMembers}
• Server Count: ${totalGuilds}
• Channel Count: ${totalChannels}
• Shard Count: ${shardSize}
• Connected Voice Channels: ${voiceConnections}
• Commands: ${client.commands.size}
• Uptime: ${uptime}
• Ping: ${client.ws.ping}ms
\`\`\``,
					},
					{
						name: 'Music Stats',
						value: `\`\`\`
• Currently Playing: ${client.player?.currentlyPlaying || 'None'}
• Total Playtime: ${client.player?.totalPlaytime || '0h 0m'}
• Songs in Queue: ${client.player?.queueSize || 0}
\`\`\``,
					},
					{
						name: 'Hardware Information',
						value: `\`\`\`
• OS: ${os.platform()} (${osVersion})
• Architecture: ${os.arch()}
• CPU: ${cpuInfo}
• Memory Usage: ${usedMemory}MB / ${totalMemory}MB
\`\`\``,
					},
					{
						name: 'Bot Information',
						value: `\`\`\`
• Node.js Version: ${process.version}
• Discord.js Version: ${require('discord.js').version}
• Developer: brusnaclee#0
\`\`\``,
					},
				);

			// Buttons for interactive sections
			const buttons = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('general_info')
					.setLabel('General Info')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('music_info')
					.setLabel('Music Stats')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('hardware_info')
					.setLabel('Hardware Info')
					.setStyle(ButtonStyle.Primary),
			);

			// Send the embed with buttons
			await interaction.editReply({ embeds: [embed], components: [buttons] });

			// Button Interaction Handler
			const collector = interaction.channel.createMessageComponentCollector({
				filter: (i) => i.user.id === interaction.user.id,
				time: 60000, // 1 minute
			});

			collector.on('collect', async (i) => {
				if (i.customId === 'general_info') {
					embed.setDescription(`**General Information:**\n\n\`\`\`
• User Count: ${totalMembers}
• Server Count: ${totalGuilds}
• Channel Count: ${totalChannels}
• Shard Count: ${shardSize}
• Connected Voice Channels: ${voiceConnections}
• Commands: ${client.commands.size}
• Uptime: ${uptime}
• Ping: ${client.ws.ping}ms
\`\`\``);
					await i.update({ embeds: [embed] });
				} else if (i.customId === 'music_info') {
					embed.setDescription(`**Music Statistics:**\n\n\`\`\`
• Currently Playing: ${client.player?.currentlyPlaying || 'None'}
• Total Playtime: ${client.player?.totalPlaytime || '0h 0m'}
• Songs in Queue: ${client.player?.queueSize || 0}
\`\`\``);
					await i.update({ embeds: [embed] });
				} else if (i.customId === 'hardware_info') {
					embed.setDescription(`**Hardware Information:**\n\n\`\`\`
• OS: ${os.platform()} (${osVersion})
• Architecture: ${os.arch()}
• CPU: ${cpuInfo}
• Memory Usage: ${usedMemory}MB / ${totalMemory}MB
\`\`\``);
					await i.update({ embeds: [embed] });
				}
			});

			collector.on('end', async () => {
				await interaction.editReply({ components: [] });
			});
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content: 'An error occurred while retrieving statistics.',
				ephemeral: true,
			});
		}
	},
};
