const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const db = require('../mongoDB');
module.exports = {
	name: 'stop',
	description: 'Stop and clear the queue music.',
	permissions: '0x0000000000000800',
	options: [],
	voiceChannel: true,
	run: async (client, interaction) => {
		let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);

		try {
			const queue = client.player.getQueue(interaction.guild.id);
			if (!queue || !queue.playing)
				return interaction
					.reply({
						content: `${lang.msg5} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.catch((e) => {});

			if (!interaction?.member?.voice?.channelId)
				return interaction
					?.reply({
						content: `${lang.message1} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 5000); // 5 second
					})
					.catch((e) => {});
			const guild_me = interaction?.guild?.members?.cache?.get(
				client?.user?.id
			);
			if (guild_me?.voice?.channelId) {
				if (
					guild_me?.voice?.channelId !== interaction?.member?.voice?.channelId
				) {
					return interaction
						?.reply({
							content: `${lang.message2} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.then(() => {
							setTimeout(async () => {
								await interaction
									.deleteReply()
									.catch((err) => console.error(err));
							}, 5000); // 5 second
						})
						.catch((e) => {});
				}
			}
			queue.stop(interaction.guild.id);
			const embed = new EmbedBuilder()
				.setColor('#FF0000')
				.setTimestamp()
				.setDescription(`${lang.msg85} <a:Thankyou:1117120334810857623>`)
				.setFooter({ text: `Empire ❤️` });

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

			// Hapus semua pesan yang telah terkirim sebelumnya\
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

			return interaction.reply({ embeds: [embed] }).catch((e) => {});
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
