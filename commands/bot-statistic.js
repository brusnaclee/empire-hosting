const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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

			// Embed General Information
			const generalEmbed = new EmbedBuilder()
				.setTitle(
					`<a:Statisticreverse:1117043433022947438> ${client.user.username} Statistics <a:Statistic:1117010987040645220>`
				)
				.setColor(client.config.embedColor)
				.setDescription(
					`**General Information:**\n\n` +
					`\`\`\`\n` +
					`• Owner: brusnaclee#0\n` +
					`• Developer: brusnaclee#0\n` +
					`• User Count: ${totalMembers || 0}\n` +
					`• Server Count: ${totalGuilds || 0}\n` +
					`• Channel Count: ${totalChannels || 0}\n` +
					`• Shard Count: ${shardSize || 0}\n` +
					`• Connected Voice: ${voiceConnections}\n` +
					`• Command Count: ${client.commands.map((c) => c.name).length}\n` +
					`• Operation Time: ${uptime}\n` +
					`• Ping: ${ping}\n\n` +
					`• Invite Bot: [Click](${client.config.botInvite})\n` +
					`• Website Bot: [Click](${client.config.supportServer})\n` +
					(client.config.sponsor.status
						? `• Sponsor: [Click](${client.config.sponsor.url})\n`
						: '') +
					(client.config.voteManager.status
						? `• Vote: [Click](${client.config.voteManager.vote_url})\n`
						: '') +
					`\`\`\``
				);

			// Tombol untuk Beralih ke Hardware/Software
			const hardwareButton = new ButtonBuilder()
				.setCustomId('hardware_info')
				.setLabel('Hardware & Software Information')
				.setStyle(ButtonStyle.Success);

			const buttonRow = new ActionRowBuilder().addComponents(hardwareButton);

			// Kirim Embed dan Tombol
			await interaction.editReply({ embeds: [generalEmbed], components: [buttonRow] });

			// Event Handler untuk Tombol
			const filter = (i) => i.user.id === interaction.user.id;
			const collector = interaction.channel.createMessageComponentCollector({
				filter,
				time: 120000, // 2 menit
			});

			collector.on('collect', async (i) => {
				if (i.customId === 'hardware_info') {
					// Hardware & Software Embed
					const os = require('os');
					const { version: discordJsVersion } = require('discord.js');
					const nodeVersion = process.version;
					const memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
					const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);

					const hardwareEmbed = new EmbedBuilder()
						.setTitle(
							`<a:Statisticreverse:1117043433022947438> ${client.user.username} Hardware & Software <a:Statistic:1117010987040645220>`
						)
						.setColor(client.config.embedColor)
						.setDescription(
							`**Hardware & Software Information:**\n\n\`\`\`\n` +
							`• OS: ${os.platform()} (${os.version()})\n` +
							`• Architecture: ${os.arch()}\n` +
							`• CPU: ${os.cpus()[0].model}\n` +
							`• Memory Usage: ${memoryUsage}MB / ${totalMemory}MB\n\n` +
							`• Node.js Version: ${nodeVersion}\n` +
							`• Discord.js Version: ${discordJsVersion}\n` +
							`• Developer: brusnaclee#0\n` +
							`\`\`\``
						);

					await i.update({ embeds: [hardwareEmbed] });
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
