const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const os = require('os');
const { execSync } = require('child_process');

module.exports = {
	name: 'statistic',
	description: 'View the bot statistics.',
	options: [],
	run: async (client, interaction) => {
		try {
			await interaction.deferReply();

			// Informasi Umum
			const totalGuilds = client.guilds.cache.size;
			const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
			const totalChannels = client.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0);
			const shardSize = client.shard?.count || 1;
			const voiceConnections = client.voice?.adapters?.size || 0;
			const uptime = `<t:${Math.floor(Number(Date.now() - client.uptime) / 1000)}:R>`;
			const ping = `${client.ws.ping}ms`;

			// Statistik Musik (Distube)
			let currentlyPlaying = 'None';
			let totalPlaytime = '0h 0m';
			let queueSize = 0;

			const queue = client.distube.getQueue(interaction.guild.id); // Ambil antrean
			if (queue) {
				currentlyPlaying = queue.songs[0]?.name || 'None';
				queueSize = queue.songs.length - 1;
				totalPlaytime = queue.formattedDuration || '0h 0m';
			}

			// Informasi Hardware dan Software
			const osInfo = execSync('lsb_release -d', { encoding: 'utf-8' }).split(':')[1].trim();
			const cpuInfo = execSync('lscpu | grep "Model name:"', { encoding: 'utf-8' }).split(':')[1].trim();
			const memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
			const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
			const nodeVersion = process.version;
			const discordJsVersion = require('discord.js').version;

			// Embed Utama
			const embed = new EmbedBuilder()
				.setTitle(`${client.user.username} Statistics`)
				.setColor(client.config.embedColor)
				.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
				.setDescription(
					'**Use the buttons below to view detailed statistics.**'
				);

			// Tombol
			const generalButton = new ButtonBuilder()
				.setCustomId('general_info')
				.setLabel('General Information')
				.setStyle(ButtonStyle.Success);

			const hardwareButton = new ButtonBuilder()
				.setCustomId('hardware_info')
				.setLabel('Hardware & Software Information')
				.setStyle(ButtonStyle.Success);

			const buttonRow = new ActionRowBuilder().addComponents(generalButton, hardwareButton);

			// Kirim Embed dengan Tombol
			await interaction.editReply({ embeds: [embed], components: [buttonRow] });

			// Event Handler untuk Tombol
			const filter = (i) => i.user.id === interaction.user.id;
			const collector = interaction.channel.createMessageComponentCollector({
				filter,
				time: 120000, // 2 menit
			});

			collector.on('collect', async (i) => {
				if (i.customId === 'general_info') {
					embed.setDescription(
						`**General Information**\n\n\`\`\`
• Owner: brusnaclee#0
• Developer: brusnaclee#0
• User Count: ${totalMembers || 0}
• Server Count: ${totalGuilds || 0}
• Channel Count: ${totalChannels || 0}
• Shard Count: ${shardSize || 0}
• Connected Voice: ${voiceConnections}
• Command Count: ${client.commands.map((c) => c.name).length}
• Operation Time: ${uptime}
• Ping: ${ping}
• Invite Bot: [Click](${client.config.botInvite})
• Website bot: [Click](${client.config.supportServer})
\`\`\`
**Currently Playing: ${currentlyPlaying}**
**Total Playtime: ${totalPlaytime}**
**Songs in Queue: ${queueSize}**
`
					);
					await i.update({ embeds: [embed] });
				} else if (i.customId === 'hardware_info') {
					embed.setDescription(
						`**Hardware & Software Information**\n\n\`\`\`
• OS: ${osInfo}
• Architecture: ${os.arch()}
• CPU: ${cpuInfo}
• Memory Usage: ${memoryUsage}MB / ${totalMemory}MB

• Node.js Version: ${nodeVersion}
• Discord.js Version: ${discordJsVersion}
• Developer: brusnaclee#0
\`\`\``
					);
					await i.update({ embeds: [embed] });
				}
			});

			collector.on('end', async () => {
				await interaction.editReply({ components: [] }).catch(console.error);
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
