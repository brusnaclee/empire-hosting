const db = require('../mongoDB');
const {
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} = require('discord.js');
module.exports = async (client, oldState, newState) => {
	const queue = client.player.getQueue(oldState.guild.id);
	if (queue || queue?.playing) {
		if (client?.config?.opt?.voiceConfig?.leaveOnEmpty?.status === true) {
			let lang = await db?.musicbot?.findOne({
				guildID: queue?.textChannel?.guild?.id,
			});
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);
			setTimeout(async () => {
				let botChannel = oldState?.guild?.channels?.cache?.get(
					queue?.voice?.connection?.joinConfig?.channelId
				);
				if (botChannel) {
					if (botChannel.id == oldState.channelId)
						if (botChannel?.members?.find((x) => x == client?.user?.id)) {
							if (botChannel?.members?.size == 1) {
								const embed = new EmbedBuilder()
									.setColor('#FF0000')
									.setTimestamp()
									.setDescription(
										`${lang.msg15} <a:Thankyou:1117120334810857623>`
									)
									.setFooter({ text: `Empire ❤️` });

								const linkvote = new ButtonBuilder()
									.setLabel('Vote Us!')
									.setURL('https://top.gg/bot/1044063413833302108/vote')
									.setStyle(ButtonStyle.Link);

								const linkinvite = new ButtonBuilder()
									.setLabel('Invite Us!')
									.setURL(
										'https://discord.com/oauth2/authorize?client_id=1044063413833302108&permissions=414585318465&scope=bot+applications.commands'
									)
									.setStyle(ButtonStyle.Link);

								const Row = new ActionRowBuilder().addComponents(
									linkvote,
									linkinvite
								);

								await queue?.textChannel
									?.send({ embeds: [embed], components: [Row] })
									.catch((e) => {});
								if (queue.lastPlaylistMessageId) {
									try {
										queue.textChannel.messages
											.fetch(queue.lastPlaylistMessageId)
											.then((message) => {
												if (message) {
													message.delete().catch(console.error);
												}
											})
											.catch(console.error);
									} catch (error) {
										console.error(
											'Gagal menghapus pesan dari queue.lastPlaylistMessageId:',
											error
										);
									}
								}

								if (queue.lastMessagesId) {
									queue.lastMessagesId.forEach(async (messageId) => {
										try {
											const message = await queue.textChannel.messages.fetch(
												messageId
											);
											await message
												.edit({ components: [] })
												.catch(console.error); // Hapus komponen tombol dari pesan sebelumnya
										} catch (error) {
											console.error('Gagal menghapus pesan:', error);
										}
									});
								}
								// Hapus semua pesan yang telah terkirim sebelumnya
								if (queue.lastSongMessageId) {
									queue.lastSongMessageId.forEach(async (messageId) => {
										try {
											const message = await queue.textChannel.messages.fetch(
												messageId
											);
											await message.delete();
										} catch (error) {
											console.error('Gagal menghapus pesan:', error);
										}
									});
								}
								if (queue || queue?.playing) {
									return queue?.stop(oldState.guild.id);
								}
							}
						}
				}
			}, client?.config?.opt?.voiceConfig?.leaveOnEmpty?.cooldown || 60000);
		}

		if (!newState.channel) {
			// Tambahkan logika atau kode yang ingin dijalankan ketika bot di-kick dari voice channel di sini
			let lang = await db?.musicbot?.findOne({
				guildID: queue?.textChannel?.guild?.id,
			});
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);

			const embed = new EmbedBuilder()
				.setColor('#FF0000')
				.setTimestamp()
				.setDescription(`${lang.msg16} `)
				.setFooter({ text: `Empire ❤️` });

			const linkvote = new ButtonBuilder()
				.setLabel('Vote Us!')
				.setURL('https://top.gg/bot/1044063413833302108/vote')
				.setStyle(ButtonStyle.Link);

			const linkinvite = new ButtonBuilder()
				.setLabel('Invite Us!')
				.setURL(
					'https://discord.com/oauth2/authorize?client_id=1044063413833302108&permissions=414585318465&scope=bot+applications.commands'
				)
				.setStyle(ButtonStyle.Link);

			const Row = new ActionRowBuilder().addComponents(linkvote, linkinvite);

			await queue?.textChannel
				?.send({ embeds: [embed], components: [Row] })
				.catch((e) => {});
			if (queue.lastPlaylistMessageId) {
				try {
					queue.textChannel.messages
						.fetch(queue.lastPlaylistMessageId)
						.then((message) => {
							if (message) {
								message.delete().catch(console.error);
							}
						})
						.catch(console.error);
				} catch (error) {
					console.error(
						'Gagal menghapus pesan dari queue.lastPlaylistMessageId:',
						error
					);
				}
			}

			if (queue.lastMessagesId) {
				queue.lastMessagesId.forEach(async (messageId) => {
					try {
						const message = await queue.textChannel.messages.fetch(messageId);
						await message.edit({ components: [] }).catch(console.error); // Hapus komponen tombol dari pesan sebelumnya
					} catch (error) {
						console.error('Gagal menghapus pesan:', error);
					}
				});
			}
			// Hapus semua pesan yang telah terkirim sebelumnya
			if (queue.lastSongMessageId) {
				queue.lastSongMessageId.forEach(async (messageId) => {
					try {
						const message = await queue.textChannel.messages.fetch(messageId);
						await message.delete();
					} catch (error) {
						console.error('Gagal menghapus pesan:', error);
					}
				});
			}
			if (queue || queue?.playing) {
				return queue?.stop(oldState.guild.id);
			}
		}

		if (newState.id === client.user.id) {
			let lang = await db?.musicbot?.findOne({
				guildID: queue?.textChannel?.guild?.id,
			});
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);

			if (oldState.serverMute === false && newState.serverMute === true) {
				if (queue?.textChannel) {
					try {
						await queue?.pause();
					} catch (e) {
						return;
					}
					const embed = new EmbedBuilder()
						.setColor('#FF0000')
						.setTimestamp()
						.setDescription(`${lang.msg128}`)
						.setFooter({ text: `Empire ❤️` });

					await queue?.textChannel
						?.send({ embeds: [embed] })
						.then((newMessage) => {
							queue.MuteMessageId = newMessage.id; // Menyimpan ID pesan baru dengan nama lastPlaylistMessageId
						})
						.catch((e) => {});
				}
			}
			if (oldState.serverMute === true && newState.serverMute === false) {
				if (queue?.textChannel) {
					try {
						await queue.resume();
					} catch (e) {
						return;
					}

					if (queue.MuteMessageId) {
						queue.textChannel.messages
							.fetch(queue.MuteMessageId)
							.then((message) => {
								if (message) {
									message.delete().catch(console.error);
								}
							})
							.catch(console.error);
					}
				}
			}
		}
	}
};
