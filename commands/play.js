const {
	ApplicationCommandOptionType,
	EmbedBuilder,
	Discord,
} = require('discord.js');
const axios = require('axios');
const db = require('../mongoDB');

let calculate = [];

const updateCalculate = (value) => {
	return new Promise((resolve, reject) => {
		calculate = value;

		if (calculate !== undefined && calculate > 0) {
			resolve(calculate);
		} else {
			setTimeout(() => {
				updateCalculate(calculate).then(resolve).catch(reject);
			}, 1000);
		}
	});
};

module.exports = {
	name: 'play',
	description: 'Play a track.',
	permissions: '0x0000000000000800',
	options: [
		{
			name: 'music',
			description: 'Play music from other platforms.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'name',
					description: 'Write your music name.',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		},
		{
			name: 'playlist',
			description: 'Write your playlist name.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'name',
					description: 'Write the name of the playlist that you was create.',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		},
		{
			name: 'next',
			description: 'Play music for the next time.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'name',
					description: 'Write your music name or URL.',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		},
	],
	voiceChannel: true,

	run: async (client, interaction) => {
		let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);

		const queue = client?.player?.getQueue(interaction?.guildId);
		beforeposition = queue?.songs?.length || 0;

		try {
			let stp = interaction.options.getSubcommand();

			if (stp === 'playlist') {
				let playlistw = interaction.options.getString('name');
				let playlist = await db?.playlist?.find().catch((e) => {});
				if (!playlist?.length > 0)
					return interaction
						.reply({
							content: `${lang.msg52} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.catch((e) => {});

				let arr = 0;
				for (let i = 0; i < playlist.length; i++) {
					if (
						playlist[i]?.playlist?.filter((p) => p.name === playlistw)?.length >
						0
					) {
						let playlist_owner_filter = playlist[i].playlist.filter(
							(p) => p.name === playlistw
						)[0].author;
						let playlist_public_filter = playlist[i].playlist.filter(
							(p) => p.name === playlistw
						)[0].public;

						if (playlist_owner_filter !== interaction.member.id) {
							if (playlist_public_filter === false) {
								return interaction
									.reply({
										content: `${lang.msg53} <a:Cross:1116983956227772476>`,
										ephemeral: true,
									})
									.catch((e) => {});
							}
						}

						const music_filter = playlist[i]?.musics?.filter(
							(m) => m.playlist_name === playlistw
						);
						if (!music_filter?.length > 0)
							return interaction
								.reply({
									content: `${lang.msg54} <a:alert:1116984255755599884>`,
									ephemeral: true,
								})
								.catch((e) => {});

						interaction
							.reply({
								content: `${lang.msg56} <a:loading1:1149363140186882178>`,
								ephemeral: true,
							})
							.catch((e) => {});

						let songs = [];
						music_filter.map((m) => songs.push(m.music_url));

						setTimeout(async () => {
							const playl = await client?.player?.createCustomPlaylist(songs, {
								member: interaction.member,
								properties: { name: playlistw, source: 'custom' },
								parallel: true,
							});

							await interaction
								.editReply({
									content: `${lang.msg57
										.replace('{interaction.member.id}', interaction.member.id)
										.replace(
											'{music_filter.length}',
											music_filter.length
										)} <a:Ceklis:1116989553744552007>`,
									ephemeral: true,
								})
								.catch((e) => {});

							try {
								await client.player.play(
									interaction.member.voice.channel,
									playl,
									{
										member: interaction.member,
										textChannel: interaction.channel,
										interaction,
									}
								);
							} catch (e) {
								if (e.errorCode === 'VOICE_MISSING_PERMS') {
									const voiceChannelId = interaction.member.voice.channel.id;
									const voiceChannelName =
										interaction.member.voice.channel.name;
									const embedError = new EmbedBuilder()
										.setTitle('🚫 Error Joining Voice')
										.setColor('#FF5555')
										.setDescription(
											`I do not have permission to join the voice channel **${voiceChannelName}** (ID: ${voiceChannelId}). 
											
											Please check the permissions for this channel and ensure I have permission to join and speak. 
											
											Error Details:
											**Error Code:** \`VOICE_MISSING_PERMS\`
											
											If you need assistance, reach out to the server owner or an administrator.`
										)
										.setFooter({ text: 'Empire ❤️' })
										.setTimestamp();

									try {
										const userId = interaction.user.id;
										const user = await client.users.fetch(userId);
										await user.send({ embeds: [embedError] });
									} catch (dmError) {
										console.error('Error sending DM to user:', dmError);
									}

									await interaction
										.editReply({
											content: `I encountered an issue joining the voice channel **${voiceChannelName}** due to missing permissions. Please check the settings. <a:alert:1116984255755599884>`,
											ephemeral: true,
										})
										.catch((e) => {});

									await new Promise((resolve) => setTimeout(resolve, 15000));
									await interaction
										.deleteReply()
										.catch((err) => console.error(err));

									return;
								}

								await interaction
									.editReply({
										content: `${lang.msg60} <a:alert:1116984255755599884>`,
										ephemeral: true,
									})
									.catch((e) => {});
							}

							playlist[i]?.playlist
								?.filter((p) => p.name === playlistw)
								.map(async (p) => {
									await db.playlist
										.updateOne(
											{ userID: p.author },
											{
												$pull: {
													playlist: {
														name: playlistw,
													},
												},
											},
											{ upsert: true }
										)
										.catch((e) => {});

									await db.playlist
										.updateOne(
											{ userID: p.author },
											{
												$push: {
													playlist: {
														name: p.name,
														author: p.author,
														authorTag: p.authorTag,
														public: p.public,
														plays: Number(p.plays) + 1,
														createdTime: p.createdTime,
													},
												},
											},
											{ upsert: true }
										)
										.catch((e) => {});
								});
						}, 3000);
					} else {
						arr++;
						if (arr === playlist.length) {
							return interaction
								.reply({
									content: `${lang.msg58} <a:alert:1116984255755599884>`,
									ephemeral: true,
								})
								.catch((e) => {});
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}
					}
				}
			}

			if (stp === 'music') {
				const name = interaction.options.getString('name');
				if (!name)
					return interaction
						.reply({
							content: `${lang.msg59} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.catch((e) => {});

				await interaction
					.reply({
						content: `${lang.msg61} <a:loading1:1149363140186882178>`,
						ephemeral: true,
					})
					.catch((e) => {});
				try {
					await client.player.play(interaction.member.voice.channel, name, {
						member: interaction.member,
						textChannel: interaction.channel,
						interaction,
					});
				} catch (e) {
					console.log(e);

					if (e.errorCode === 'VOICE_MISSING_PERMS') {
						const voiceChannelId = interaction.member.voice.channel.id;
						const voiceChannelName = interaction.member.voice.channel.name;
						const embedError = new EmbedBuilder()
							.setTitle('🚫 Error Joining Voice')
							.setColor('#FF5555')
							.setDescription(
								`I do not have permission to join the voice channel **${voiceChannelName}** (ID: ${voiceChannelId}). 
								
								Please check the permissions for this channel and ensure I have permission to join and speak. 
								
								Error Details:
								**Error Code:** \`VOICE_MISSING_PERMS\`
								
								If you need assistance, reach out to the server owner or an administrator.`
							)
							.setFooter({ text: 'Empire ❤️' })
							.setTimestamp();

						try {
							const userId = interaction.user.id;
							const user = await client.users.fetch(userId);
							await user.send({ embeds: [embedError] });
						} catch (dmError) {
							console.error('Error sending DM to user:', dmError);
						}

						await interaction
							.editReply({
								content: `I encountered an issue joining the voice channel **${voiceChannelName}** due to missing permissions. Please check the settings. <a:alert:1116984255755599884>`,
								ephemeral: true,
							})
							.catch((e) => {});

						await new Promise((resolve) => setTimeout(resolve, 15000));
						await interaction.deleteReply().catch((err) => console.error(err));

						return;
					}

					await interaction
						.editReply({
							content: `${lang.msg60} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.catch((e) => {});

					// Menunggu 3 detik
					await new Promise((resolve) => setTimeout(resolve, 2000));

					// Mengedit balasan kembali setelah 3 detik
					await interaction
						.editReply({
							content:
								'Song is not found, please check again the song name/URL or if you put URL playlist, please make it public playlist instead of private playlist',
							ephemeral: true,
						})
						.catch((e) => {});

					await new Promise((resolve) => setTimeout(resolve, 10000));
				}

				await interaction.deleteReply().catch((err) => console.error(err));

				const voiceChannelName = interaction.member.voice.channel.name;
				const guildName = interaction.guild.name;
				const userName = interaction.user.tag;
				const channelId = interaction.channel.id;
				const voiceChannelId = interaction.member.voice.channel.id;

				// Buat pesan embed
				const embed = new EmbedBuilder()
					.setTitle('Now Playing')
					.setColor(client.config.embedColor)
					.addFields(
						{ name: 'Bot is playing', value: name },
						{
							name: 'Voice Channel',
							value: `${voiceChannelName} (${voiceChannelId})`,
						},
						{ name: 'Server', value: `${guildName} (${interaction.guild.id})` },
						{ name: 'User', value: `${userName} (${interaction.user.id})` },
						{
							name: 'Channel Name',
							value: `${interaction.channel.name} (${channelId})`,
						}
					)
					.setTimestamp();

				// URL webhook Discord
				const webhookURL =
					'https://discord.com/api/webhooks/1218479311192068196/vW4YsB062NwaMPKpGHCC-xFNEH7BVmeVtdIdBoIXsCclu5oRe-xf_Is9lpQiTRfor5pN';

				// Kirim pesan embed ke webhook
				axios.post(webhookURL, { embeds: [embed] }).catch((error) => {
					console.error('Error sending embed message:', error);
				});
			}

			if (stp === 'next') {
				const name = interaction.options.getString('name');
				if (!name)
					return interaction
						.reply({
							content: `${lang.msg59} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.catch((e) => {});

				await interaction
					.reply({
						content: `${lang.msg61} <a:loading1:1149363140186882178>`,
						ephemeral: true,
					})
					.catch((e) => {});

				try {
					await client.player.play(interaction.member.voice.channel, name, {
						member: interaction.member,
						textChannel: interaction.channel,
						interaction,
					});

					const queue = client.player.getQueue(interaction.guild.id);

					if (queue.songs.length > 2) {
						const lastTrack = queue.songs.pop(); // Remove the last track from the queue
						queue.songs.splice(1, 0, lastTrack); // Insert the last track at index 2
					}
				} catch (e) {
					console.log(e);

					if (e.errorCode === 'VOICE_MISSING_PERMS') {
						const voiceChannelId = interaction.member.voice.channel.id;
						const voiceChannelName = interaction.member.voice.channel.name;
						const embedError = new EmbedBuilder()
							.setTitle('🚫 Error Joining Voice')
							.setColor('#FF5555')
							.setDescription(
								`I do not have permission to join the voice channel **${voiceChannelName}** (ID: ${voiceChannelId}). 
								
								Please check the permissions for this channel and ensure I have permission to join and speak. 
								
								Error Details:
								**Error Code:** \`VOICE_MISSING_PERMS\`
								
								If you need assistance, reach out to the server owner or an administrator.`
							)
							.setFooter({ text: 'Empire ❤️' })
							.setTimestamp();

						try {
							const userId = interaction.user.id;
							const user = await client.users.fetch(userId);
							await user.send({ embeds: [embedError] });
						} catch (dmError) {
							console.error('Error sending DM to user:', dmError);
						}

						await interaction
							.editReply({
								content: `I encountered an issue joining the voice channel **${voiceChannelName}** due to missing permissions. Please check the settings. <a:alert:1116984255755599884>`,
								ephemeral: true,
							})
							.catch((e) => {});

						await new Promise((resolve) => setTimeout(resolve, 15000));
						await interaction.deleteReply().catch((err) => console.error(err));

						return;
					}

					await interaction
						.reply({
							content: `${lang.msg60} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.catch((e) => {});

					await new Promise((resolve) => setTimeout(resolve, 2000));

					await interaction
						.editReply({
							content:
								'Song is not found, please check again the song name/URL or if you put URL playlist, please make it public playlist instead of private playlist',
							ephemeral: true,
						})
						.catch((e) => {});

					await new Promise((resolve) => setTimeout(resolve, 10000));
				}
				await interaction.deleteReply().catch((err) => console.error(err));

				const voiceChannelName = interaction.member.voice.channel.name;
				const guildName = interaction.guild.name;
				const userName = interaction.user.tag;
				const channelId = interaction.channel.id;
				const voiceChannelId = interaction.member.voice.channel.id;

				// Buat pesan embed
				const embed = new EmbedBuilder()
					.setTitle('Now Playing')
					.setColor(client.config.embedColor)
					.addFields(
						{ name: 'Bot is playing', value: name },
						{
							name: 'Voice Channel',
							value: `${voiceChannelName} (${voiceChannelId})`,
						},
						{ name: 'Server', value: `${guildName} (${interaction.guild.id})` },
						{ name: 'User', value: `${userName} (${interaction.user.id})` },
						{
							name: 'Channel Name',
							value: `${interaction.channel.name} (${channelId})`,
						}
					)
					.setTimestamp();

				// URL webhook Discord
				const webhookURL =
					'https://discord.com/api/webhooks/1218479311192068196/vW4YsB062NwaMPKpGHCC-xFNEH7BVmeVtdIdBoIXsCclu5oRe-xf_Is9lpQiTRfor5pN';

				// Kirim pesan embed ke webhook
				axios.post(webhookURL, { embeds: [embed] }).catch((error) => {
					console.error('Error sending embed message:', error);
				});
			}
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}

		afterposition = queue?.songs?.length || 0;
		calculate = afterposition - beforeposition;
		beforeposition = afterposition;

		await updateCalculate(calculate);
		return calculate;
	},
	updateCalculate: updateCalculate,
};
