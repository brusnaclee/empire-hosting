const config = require('../config.js');
const {
	EmbedBuilder,
	ButtonBuilder,
	InteractionType,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	ButtonStyle,
} = require('discord.js');

const db = require('../mongoDB');
const fs = require('fs');
const ytdl = require('ytdl-core');
module.exports = async (client, interaction) => {
	let lang = await db?.musicbot?.findOne({ guildID: interaction?.guild?.id });
	lang = lang?.language || client.language;
	lang = require(`../languages/${lang}.js`);
	try {
		if (!interaction?.guild) {
			return interaction?.reply({
				content: 'This bot is only for servers and can be used on servers.',
				ephemeral: true,
			});
		} else {
			function cmd_loader() {
				if (interaction?.type === InteractionType.ApplicationCommand) {
					fs.readdir(config.commandsDir, (err, files) => {
						if (err) throw err;
						files.forEach(async (f) => {
							let props = require(`.${config.commandsDir}/${f}`);
							if (interaction.commandName === props.name) {
								try {
									let data = await db?.musicbot?.findOne({
										guildID: interaction?.guild?.id,
									});
									if (data?.channels?.length > 0) {
										let channel_control = await data?.channels?.filter(
											(x) =>
												!interaction?.guild?.channels?.cache?.get(x?.channel)
										);

										if (channel_control?.length > 0) {
											for (const x of channel_control) {
												await db?.musicbot
													?.updateOne(
														{ guildID: interaction?.guild?.id },
														{
															$pull: {
																channels: {
																	channel: x?.channel,
																},
															},
														},
														{ upsert: true }
													)
													.catch((e) => {});
											}
										} else {
											data = await db?.musicbot?.findOne({
												guildID: interaction?.guild?.id,
											});
											let channel_filter = data?.channels?.filter(
												(x) => x.channel === interaction?.channel?.id
											);

											if (
												!channel_filter?.length > 0 &&
												!interaction?.member?.permissions?.has(
													'0x0000000000000020'
												)
											) {
												channel_filter = data?.channels
													?.map((x) => `<#${x.channel}>`)
													.join(', ');
												return interaction
													?.reply({
														content: `<a:Cross:1116983956227772476> ${lang.msg126.replace(
															'{channel_filter}',
															channel_filter
														)}`,
														ephemeral: true,
													})
													.catch((e) => {});
											}
										}
									}
									if (
										interaction?.member?.permissions?.has(
											props?.permissions || '0x0000000000000800'
										)
									) {
										const DJ = client.config.opt.DJ;
										if (
											props &&
											DJ.commands.includes(interaction?.commandName)
										) {
											let djRole = await db?.musicbot
												?.findOne({ guildID: interaction?.guild?.id })
												.catch((e) => {});
											if (djRole) {
												const roleDJ = interaction?.guild?.roles?.cache?.get(
													djRole?.role
												);
												if (
													!interaction?.member?.permissions?.has(
														'0x0000000000000020'
													)
												) {
													if (roleDJ) {
														if (
															!interaction?.member?.roles?.cache?.has(
																roleDJ?.id
															)
														) {
															const embed = new EmbedBuilder()
																.setColor(client.config.embedColor)
																.setTitle(client?.user?.username)
																.setThumbnail(client?.user?.displayAvatarURL())
																.setDescription(
																	lang.embed1
																		.replace('{djRole}', roleDJ?.id)
																		.replace(
																			'{cmdMAP}',
																			client.config.opt.DJ.commands
																				.map((astra) => '`' + astra + '`')
																				.join(', ')
																		)
																)
																.setTimestamp()
																.setFooter({ text: `Empire ❤️` });
															return interaction
																?.reply({ embeds: [embed], ephemeral: true })
																.catch((e) => {});
														}
													}
												}
											}
										}
										if (props && props.voiceChannel) {
											if (!interaction?.member?.voice?.channelId)
												return interaction
													?.reply({
														content: `${lang.message1} <a:alert:1116984255755599884>`,
														ephemeral: true,
													})
													.catch((e) => {});
											const guild_me = interaction?.guild?.members?.cache?.get(
												client?.user?.id
											);
											if (guild_me?.voice?.channelId) {
												if (
													guild_me?.voice?.channelId !==
													interaction?.member?.voice?.channelId
												) {
													return interaction
														?.reply({
															content: `${lang.message2} <a:alert:1116984255755599884>`,
															ephemeral: true,
														})
														.catch((e) => {});
												}
											}
										}
										return props.run(client, interaction);
									} else {
										return interaction?.reply({
											content: `${lang.message3}: **${
												props?.permissions
													?.replace('0x0000000000000020', 'MANAGE GUILD')
													?.replace('0x0000000000000800', 'SEND MESSAGES') ||
												'SEND MESSAGES'
											}**`,
											ephemeral: true,
										});
									}
								} catch (e) {
									return interaction?.reply({
										content: `${lang.msg4}...\n\n\`\`\`${e?.message}\`\`\``,
										ephemeral: true,
									});
								}
							}
						});
					});
				}
			}

			if (config.voteManager.status === true && config.voteManager.api_key) {
				if (
					config.voteManager.vote_commands.includes(interaction?.commandName)
				) {
					try {
						const topSdk = require('@top-gg/sdk');
						let topApi = new topSdk.Api(config.voteManager.api_key, client);
						await topApi
							?.hasVoted(interaction?.user?.id)
							.then(async (voted) => {
								if (!voted) {
									const embed2 = new EmbedBuilder()
										.setTitle('Vote ' + client?.user?.username)
										.setColor(client?.config?.embedColor)
										.setDescription(`${config.voteManager.vote_commands
										.map((cs) => `\`${cs}\``)
										.join(', ')} - ${lang.msg131}
> ${config.voteManager.vote_url}`);
									return interaction?.reply({
										content: '',
										embeds: [embed2],
										ephemeral: true,
									});
								} else {
									cmd_loader();
								}
							});
					} catch (e) {
						cmd_loader();
					}
				} else {
					cmd_loader();
				}
			} else {
				cmd_loader();
			}

			if (interaction?.type === InteractionType.MessageComponent) {
				const queue = client?.player?.getQueue(interaction?.guildId);
				switch (interaction?.customId) {
					case 'save':
						const fs = require('fs');

						const axios = require('axios');

						const queue = client?.player?.getQueue(interaction?.guildId);

						await interaction.deferReply({
							content: 'loading',
						});

						if (!queue || !queue.playing) {
							return interaction
								.editReply({
									content: `${lang.msg5} <a:alert:1116984255755599884>`,
									ephemeral: true,
								})
								.then(() => {
									setTimeout(async () => {
										await interaction
											.deleteReply()
											.catch((err) => console.error(err));
									}, 5000); // 60 seconds or 1 minutes
								});
						}

						const song = queue.songs[0];
						const songName = song.name;
						const songURL = song.url;

						const musicUrl = `https://stormy-ambitious-venom.glitch.me/api/download?musicUrl=${encodeURIComponent(
							songURL
						)}&musicName=${encodeURIComponent(songName)}`;

						axios
							.get(musicUrl)
							.then((response) => {
								const googleDriveLink = response.data.googleDriveLink;

								const embed = new EmbedBuilder()
									.setTitle(`${songName}`)
									.setThumbnail(song.thumbnail)
									.setColor(client.config.embedColor)
									.setDescription(
										`[Download from Google Drive](${googleDriveLink})`
									)
									.setTimestamp()
									.setFooter({ text: `Empire ❤️` });

								interaction
									.editReply({ embeds: [embed] })
									.then(() => {
										console.log('Link sent successfully.');

										setTimeout(async () => {
											await interaction
												.deleteReply()
												.catch((err) => console.error(err));
										}, 300000); // 300 seconds
									})
									.catch((err) => {
										console.error('Error sending embed message:', err);
									});
							})
							.catch((error) => {
								console.error('Error fetching download link:', error);
								interaction
									.editReply({
										content: 'Error fetching download link.',
										ephemeral: true,
									})
									.then(() => {
										setTimeout(async () => {
											await interaction
												.deleteReply()
												.catch((err) => console.error(err));
										}, 5000); // 5 seconds
									})
									.catch((err) => {
										console.error('Error sending error message:', err);
									});
							});

						break;
					case 'saveTrack':
						{
							const queue = client?.player?.getQueue(interaction?.guildId);
							if (!queue || !queue?.playing) {
								return interaction
									?.reply({
										content: `${lang.msg5} <a:alert:1116984255755599884>`,
										embeds: [],
										components: [],
										ephemeral: true,
									})
									.catch((e) => {});
							} else {
								const Modal = new ModalBuilder()
									.setCustomId('playlistModal')
									.setTitle(lang.msg6);

								const PlayList = new TextInputBuilder()
									.setCustomId('playlist')
									.setLabel(lang.msg7)
									.setRequired(true)
									.setStyle(TextInputStyle.Short);

								const PlaylistRow = new ActionRowBuilder().addComponents(
									PlayList
								);

								Modal.addComponents(PlaylistRow);

								await interaction?.showModal(Modal).catch((e) => {});
							}
						}
						break;
					case 'time': {
						const queue = client?.player?.getQueue(interaction?.guildId);
						if (!queue || !queue?.playing) {
							return interaction
								?.reply({
									content: `${lang.msg5} <a:alert:1116984255755599884>`,
									embeds: [],
									components: [],
									ephemeral: true,
								})
								.catch((e) => {});
						} else {
							let music_percent = queue.duration / 100;
							let music_percent2 = queue.currentTime / music_percent;
							let music_percent3 = Math.round(music_percent2);
							let estimated = queue.duration - queue.currentTime;
							let formattedestimated = Math.round(estimated);

							const currentTime = Math.floor(Date.now() / 1000);
							const estimatedTime = currentTime + formattedestimated;
							const formattedestimatedTime = `Estimated time: <t:${estimatedTime}:R>`;

							const embed = new EmbedBuilder()
								.setColor(client?.config?.embedColor)
								.setTitle(queue?.songs[0]?.name)
								.setThumbnail(queue?.songs[0]?.thumbnail)
								.setTimestamp()
								.setDescription(
									`**${queue?.formattedCurrentTime} / ${queue?.formattedDuration} (${music_percent3}%)**\n ${formattedestimatedTime} <a:loading1:1149363140186882178>`
								)
								.setFooter({ text: `Empire ❤️` });
							interaction?.message?.edit({ embeds: [embed] }).catch((e) => {});
							interaction
								?.reply({
									content: `<a:Ceklis:1116989553744552007> ${lang.msg9}`,
									embeds: [],
									components: [],
									ephemeral: true,
								})
								.catch((e) => {});
						}
					}

					case 'lyric_button':
						try {
							const axios = require('axios');
							const songNames = '';
							const artistNames = '';
							const queue = client.player.getQueue(interaction.guild.id);
							await interaction.deferReply({
								content: 'loading',
								ephemeral: true,
							});

							let titles = '';
							let artists = typeof artistNames === 'string' ? artistNames : ' ';
							if (songNames) {
								// If the song name is provided, use that song
								title = songNames;
							} else {
								// If the song name is not provided, use the currently playing song
								if (!queue || !queue.playing) {
									return interaction
										.editReply({
											content: `${lang.msg5} <a:alert:1116984255755599884>`,
											ephemeral: true,
										})
										.then(() => {
											setTimeout(async () => {
												await interaction
													.deleteReply()
													.catch((err) => console.error(err));
											}, 5000); // 60 seconds or 1 minutes
										});
								}
								titles = queue.songs[0].name;
							}

							const removeUnwantedWords = (str) => {
								return str
									.replace(
										/\(.*?\)|\[.*?\]|\bofficial\b|\bmusic\b|\bvideo\b|\blive\b|\blyrics\b|\blyric\b|\blirik\b|\bHD\b|\bversion\b|\bfull\b|\bnew\b|\bMV\b|\bmv\b|\bcover\b|\bremix\b|\bfeat\b|\bft\b|\bfeaturing\b|\bver\b|\bversion\b|\bedit\b|\bclip\b|\bteaser\b|\btrailer\b|\bofficial audio\b|\bperformance\b|\bconcert\b|\bkaraoke\b|\btour\b|\bremastered\b|\bremake\b|\bintro\b|\boutro\b|\bvisualizer\b|\bvisual\b|\btrack\b|\bcensored\b|['.,":;\/\\|\[\]()]/gi, // Menambahkan unwanted words dan simbol
										''
									)
									.replace(/\bft\.?.*$/i, '')
									.replace(/\bby\b.*$/i, '')
									.trim();
							};

							titles = removeUnwantedWords(titles);

							const lyricsResponse = await axios.get(
								'https://geniusempire.vercel.app/api/lyrics',
								{ params: { title: titles || ' ', artist: artists || ' ' } }
							);
							const lirik = lyricsResponse.data.lyrics;

							if (lyricsResponse.status === 404) {
								return interaction
									.editReply({
										content: 'Lyrics for this song were not found.',
										ephemeral: true,
									})
									.then(() => {
										setTimeout(async () => {
											await interaction
												.deleteReply()
												.catch((err) => console.error(err));
										}, 60000); // 60 seconds or 1 minutes
									});
							}

							const embed = new EmbedBuilder()
								.setColor(client.config.embedColor)
								.setTitle(titles)
								.setDescription(lirik)
								.setTimestamp()
								.setFooter({ text: 'Empire ❤️' });

							// Edit the reply with ephemeral set to false
							await interaction
								.editReply({ embeds: [embed], ephemeral: true })
								.then(() => {
									setTimeout(async () => {
										await interaction
											.deleteReply()
											.catch((err) => console.error(err));
									}, 600000); // 600 seconds or 10 minutes
								});
						} catch (error) {
							let lang = await db?.musicbot?.findOne({
								guildID: interaction.guild.id,
							});
							lang = lang?.language || client.language;
							lang = require(`../languages/${lang}.js`);
							const queue = client.player.getQueue(interaction.guild.id);
							const axios = require('axios');

							const songNames = '';
							const artistNames = '';

							let titles = '';
							let artists = typeof artistNames === 'string' ? artistNames : ' ';
							if (songNames) {
								// If the song name is provided, use that song
								titles = songNames;
							} else {
								// If the song name is not provided, use the currently playing song
								if (!queue || !queue.playing) {
									return interaction
										.editReply({
											content: `${lang.msg5} <a:alert:1116984255755599884>`,
											ephemeral: true,
										})
										.then(() => {
											setTimeout(async () => {
												await interaction
													.deleteReply()
													.catch((err) => console.error(err));
											}, 5000); // 60 seconds or 1 minutes
										});
								}
								titles = queue.songs[0].name;
							}

							const removeUnwantedWords = (str) => {
								return str
									.replace(
										/\(.*?\)|\[.*?\]|\bofficial\b|\bmusic\b|\bvideo\b|\blive\b|\blyrics\b|\blyric\b|\blirik\b|\bHD\b|\bversion\b|\bfull\b|\bnew\b|\bMV\b|\bmv\b|\bcover\b|\bremix\b|\bfeat\b|\bft\b|\bfeaturing\b|\bver\b|\bversion\b|\bedit\b|\bclip\b|\bteaser\b|\btrailer\b|\bofficial audio\b|\bperformance\b|\bconcert\b|\bkaraoke\b|\btour\b|\bremastered\b|\bremake\b|\bintro\b|\boutro\b|\bvisualizer\b|\bvisual\b|\btrack\b|\bcensored\b|['.,":;\/\\|\[\]()]/gi, // Menambahkan unwanted words dan simbol
										''
									)
									.replace(/\bft\.?.*$/i, '')
									.replace(/\bby\b.*$/i, '')
									.trim();
							};

							titles = removeUnwantedWords(titles);

							if (error.code === 10062 || error.status === 404) {
								return interaction
									.editReply({ content: lang.msg4, ephemeral: true })
									.then(() => {
										setTimeout(async () => {
											await interaction
												.deleteReply()
												.catch((err) => console.error(err));
										}, 10000);
									});
							}
							interaction.editReply({
								content:
									'The song is not available in the database, attempting to search with AI. <a:loading1:1149363140186882178>',
								ephemeral: true,
							});

							const url = 'https://gemini-empire.vercel.app/api/chatbot';
							const data = {
								prompt: `
			Could you give me full lyric of this song
			song name: ${titles}`,
							};

							const maxRetries = 5;
							let attempts = 0;

							const makeRequest = () => {
								axios
									.post(url, data)
									.then((response) => {
										const result = response.data;
										// Send the recommendation message with buttons
										const embed = new EmbedBuilder()
											.setTitle(`${titles}`)
											.setDescription(`${result}`)
											.setColor(client.config.embedColor)
											.setTimestamp();

										interaction
											.editReply({ embeds: [embed], ephemeral: false })
											.then(() => {
												setTimeout(async () => {
													await interaction
														.deleteReply()
														.catch((err) => console.error(err));
												}, 600000); // 600 seconds or 10 minutes
											})
											.catch((e) => {});
									})
									.catch((error) => {
										attempts++;
										if (attempts < maxRetries) {
											makeRequest();
										} else {
											if (error.code === 10062 || error.status === 404) {
												return interaction
													.editReply({ content: lang.msg4, ephemeral: true })
													.then(() => {
														setTimeout(async () => {
															await interaction
																.deleteReply()
																.catch((err) => console.error(err));
														}, 10000);
													});
											}
											interaction
												.editReply({
													content:
														'An error occurred while processing the request.',
													ephemeral: true,
												})
												.then(() => {
													setTimeout(async () => {
														await interaction
															.deleteReply()
															.catch((err) => console.error(err));
													}, 10000);
												});
											console.error('Error making the request:', error);
										}
									});
							};

							// Initial call to makeRequest
							makeRequest();
						}

						break;

					case 'back_button':
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
									guild_me?.voice?.channelId !==
									interaction?.member?.voice?.channelId
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

							let song = await queue.previous();
							const embed = new EmbedBuilder()
								.setColor('00FF7D')
								.setThumbnail(song.thumbnail)
								.setTimestamp()
								.setDescription(
									`${lang.msg18.replace(
										'{queue.previousTracks[1].title}',
										song.name
									)} <a:Ceklis:1116989553744552007>`
								)
								.setFooter({ text: 'Empire ❤️' });

							await interaction
								.update({ embeds: [embed], components: [] })
								.then(() => {
									setTimeout(async () => {
										await interaction
											.deleteReply()
											.catch((err) => console.error(err));
									}, 300000); // 300 seconds or 5 minutes
								})
								.catch((e) => {});
						} catch (e) {
							interaction
								.reply({
									content: `${lang.msg17} <a:Cross:1116983956227772476>`,
									ephemeral: true,
								})
								.catch((e) => {});
						}
						break;

					case 'pause_button':
						try {
							const queue = client.player.getQueue(interaction.guild.id);
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
									guild_me?.voice?.channelId !==
									interaction?.member?.voice?.channelId
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
							const success = queue.pause();
							const successEmoji = '<a:Ceklis:1116989553744552007>';
							const failureEmoji = '<a:Cross:1116983956227772476>';
							const embed = new EmbedBuilder()
								.setColor('00FF7D')
								.setThumbnail(queue.songs[0].thumbnail)
								.setTimestamp()
								.setDescription(
									success
										? `**${queue.songs[0].name}** - ${lang.msg48}${successEmoji}`
										: lang.msg41 + failureEmoji
								)
								.setFooter({ text: 'Empire ❤️' });

							const backBtn = new ButtonBuilder()
								.setCustomId('back_button')
								.setEmoji('◀️')
								.setStyle(ButtonStyle.Secondary);

							const resumeBtn = new ButtonBuilder()
								.setCustomId('resume_button')
								.setEmoji('⏯️')
								.setStyle(ButtonStyle.Success);

							const lyricBtn = new ButtonBuilder()
								.setCustomId('lyric_button')
								.setEmoji('📃')
								.setStyle(ButtonStyle.Secondary);

							const stopBtn = new ButtonBuilder()
								.setCustomId('stop_button')
								.setEmoji('⏹️')
								.setStyle(ButtonStyle.Danger);

							const skipBtn = new ButtonBuilder()
								.setCustomId('skip_button')
								.setEmoji('▶️')
								.setStyle(ButtonStyle.Secondary);

							const saveButton = new ButtonBuilder()
								.setCustomId('saveTrack')
								.setEmoji('1117815593043775569')
								.setStyle(ButtonStyle.Secondary);

							const shufleButton = new ButtonBuilder()
								.setCustomId('shufle')
								.setEmoji('🔀')
								.setStyle(ButtonStyle.Secondary);

							const downloadButton = new ButtonBuilder()
								.setCustomId('save')
								.setEmoji('1230868574722064446')
								.setStyle(ButtonStyle.Secondary);

							const autoplayButton = new ButtonBuilder()
								.setCustomId('autoplay')
								.setEmoji('1230869965435961394')
								.setStyle(ButtonStyle.Secondary);

							const actionRow = new ActionRowBuilder().addComponents(
								backBtn,
								resumeBtn,
								skipBtn
							);

							const actionRow2 = new ActionRowBuilder().addComponents(
								lyricBtn,
								stopBtn,
								saveButton
							);

							const actionRow3 = new ActionRowBuilder().addComponents(
								shufleButton,
								downloadButton,
								autoplayButton
							);

							const replyMessage = await interaction
								.update({
									embeds: [embed],
									components: [actionRow, actionRow2, actionRow3],
								})
								.catch((e) => {});

							while (!queue.playing) {
								await new Promise((resolve) => setTimeout(resolve, 1000));
							}

							const resumeEmbed = new EmbedBuilder()
								.setColor('00FF7D')
								.setThumbnail(queue.songs[0].thumbnail)
								.setTimestamp()
								.setDescription(
									`**${queue.songs[0].name}**, ${lang.msg72} <a:Ceklis:1116989553744552007>`
								)
								.setFooter({ text: 'Empire ❤️' });

							const pauseBtn = new ButtonBuilder()
								.setCustomId('pause_button')
								.setEmoji('⏸️')
								.setStyle(ButtonStyle.Success);

							const actionRowResume = new ActionRowBuilder().addComponents(
								backBtn,
								pauseBtn,
								skipBtn
							);
							await replyMessage
								.edit({
									embeds: [resumeEmbed],
									components: [actionRowResume, actionRow2, actionRow3],
								})
								.catch(console.error);
						} catch (e) {
							const queue = client.player.getQueue(interaction.guild.id);
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
									guild_me?.voice?.channelId !==
									interaction?.member?.voice?.channelId
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
							const successEmoji = '<a:Ceklis:1116989553744552007>';
							const embed = new EmbedBuilder()
								.setColor('00FF7D')
								.setThumbnail(queue.songs[0].thumbnail)
								.setTimestamp()
								.setDescription(
									`**${queue.songs[0].name}** - ${lang.msg48}${successEmoji}`
								)
								.setFooter({ text: 'Empire ❤️' });

							const backBtn = new ButtonBuilder()
								.setCustomId('back_button')
								.setEmoji('◀️')
								.setStyle(ButtonStyle.Secondary);

							const resumeBtn = new ButtonBuilder()
								.setCustomId('resume_button')
								.setEmoji('⏯️')
								.setStyle(ButtonStyle.Success);

							const lyricBtn = new ButtonBuilder()
								.setCustomId('lyric_button')
								.setEmoji('📃')
								.setStyle(ButtonStyle.Secondary);

							const stopBtn = new ButtonBuilder()
								.setCustomId('stop_button')
								.setEmoji('⏹️')
								.setStyle(ButtonStyle.Danger);

							const skipBtn = new ButtonBuilder()
								.setCustomId('skip_button')
								.setEmoji('▶️')
								.setStyle(ButtonStyle.Secondary);

							const saveButton = new ButtonBuilder()
								.setCustomId('saveTrack')
								.setEmoji('1117815593043775569')
								.setStyle(ButtonStyle.Secondary);

							const shufleButton = new ButtonBuilder()
								.setCustomId('shufle')
								.setEmoji('🔀')
								.setStyle(ButtonStyle.Secondary);

							const downloadButton = new ButtonBuilder()
								.setCustomId('save')
								.setEmoji('1230868574722064446')
								.setStyle(ButtonStyle.Secondary);

							const autoplayButton = new ButtonBuilder()
								.setCustomId('autoplay')
								.setEmoji('1230869965435961394')
								.setStyle(ButtonStyle.Secondary);

							const actionRow = new ActionRowBuilder().addComponents(
								backBtn,
								resumeBtn,
								skipBtn
							);

							const actionRow2 = new ActionRowBuilder().addComponents(
								lyricBtn,
								stopBtn,
								saveButton
							);

							const actionRow3 = new ActionRowBuilder().addComponents(
								shufleButton,
								downloadButton,
								autoplayButton
							);

							const replyMessage = await interaction
								.update({
									embeds: [embed],
									components: [actionRow, actionRow2, actionRow3],
								})
								.catch((e) => {});

							// Wait until the music is playing again
							const checkQueuePlaying = async () => {
								while (!queue.playing) {
									await new Promise((resolve) => setTimeout(resolve, 1000));
								}

								setTimeout(async () => {
									const resumeEmbed = new EmbedBuilder()
										.setColor('00FF7D')
										.setThumbnail(queue.songs[0].thumbnail)
										.setTimestamp()
										.setDescription(
											`**${queue.songs[0].name}**, ${lang.msg72} <a:Ceklis:1116989553744552007>`
										)
										.setFooter({ text: 'Empire ❤️' });

									const pauseBtn = new ButtonBuilder()
										.setCustomId('pause_button')
										.setEmoji('⏸️')
										.setStyle(ButtonStyle.Success);

									const actionRowResume = new ActionRowBuilder().addComponents(
										backBtn,
										pauseBtn,
										skipBtn
									);
									await replyMessage
										.edit({
											embeds: [resumeEmbed],
											components: [actionRowResume, actionRow2, actionRow3],
										})
										.catch(console.error);
								}, 1000); // Delay the second update by 1 second
							};

							checkQueuePlaying();
						}
						break;

					case 'stop_button':
						try {
							const queue = client.player.getQueue(interaction.guild.id);
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
									guild_me?.voice?.channelId !==
									interaction?.member?.voice?.channelId
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
							if (!queue || !queue.playing)
								return interaction
									.reply({
										content: `${lang.msg5} <a:alert:1116984255755599884>`,
										ephemeral: true,
									})
									.catch((e) => {});
							queue.stop(interaction.guild.id);
							const embed = new EmbedBuilder()
								.setColor('#FF0000')
								.setTimestamp()
								.setDescription(
									`${lang.msg85} <a:Thankyou:1117120334810857623>`
								)
								.setFooter({ text: 'Empire ❤️' });

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
										const message = await queue.textChannel.messages.fetch(
											messageId
										);
										await message.delete();
									} catch (error) {
										console.error('Gagal menghapus pesan:', error);
									}
								});
							}

							await interaction
								.update({ embeds: [embed], components: [Row] })
								.catch((e) => {});
						} catch (e) {
							interaction
								.reply({
									content: `${lang.msg5} <a:alert:1116984255755599884>`,
									ephemeral: true,
								})
								.catch((e) => {});
						}
						break;

					case 'skip_button':
						try {
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
									guild_me?.voice?.channelId !==
									interaction?.member?.voice?.channelId
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
							const queue = client.player.getQueue(interaction.guild.id);
							if (!queue || !queue.playing)
								return interaction
									.reply({
										content: `${lang.msg5} <a:alert:1116984255755599884>`,
										ephemeral: true,
									})
									.catch((e) => {});
							let old = queue.songs[0];
							const success = await queue.skip();

							const embed = new EmbedBuilder()
								.setColor('00FF7D')
								.setThumbnail(queue.songs[0].thumbnail)
								.setTimestamp()
								.setDescription(
									success
										? `**${old.name}**, ${lang.msg83} <a:Ceklis:1116989553744552007>`
										: `${lang.msg41} <a:Cross:1116983956227772476>`
								)
								.setFooter({ text: `Empire ❤️` });

							await interaction
								.update({ embeds: [embed], components: [] })
								.then(() => {
									setTimeout(async () => {
										await interaction
											.deleteReply()
											.catch((err) => console.error(err));
									}, 300000); // 300 seconds or 5 minutes
								})
								.catch((e) => {});
						} catch (e) {
							interaction
								.reply({
									content: `${lang.msg63} <a:alert:1116984255755599884>`,
									ephemeral: true,
								})
								.catch((e) => {});
						}
						break;

					case 'resume_button':
						try {
							const queue = client.player.getQueue(interaction.guild.id);

							if (!queue)
								return interaction
									.reply({
										content: `${lang.msg63} <a:alert:1116984255755599884>`,
										ephemeral: true,
									})
									.catch((e) => {});

							if (!queue.paused)
								return interaction
									.reply({ content: lang.msg132, ephemeral: true })
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
									guild_me?.voice?.channelId !==
									interaction?.member?.voice?.channelId
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

							const success = queue.resume();
							const successEmoji = '<a:Ceklis:1116989553744552007>';
							const failureEmoji = '<a:Cross:1116983956227772476>';
							const embed = new EmbedBuilder()
								.setColor('00FF7D')
								.setThumbnail(queue.songs[0].thumbnail)
								.setTimestamp()
								.setDescription(
									success
										? `**${queue.songs[0].name}**, ${lang.msg72}${successEmoji}`
										: lang.msg71 + failureEmoji
								)
								.setFooter({ text: 'Empire ❤️' });

							const backBtn = new ButtonBuilder()
								.setCustomId('back_button')
								.setEmoji('◀️')
								.setStyle(ButtonStyle.Secondary);

							const lyricBtn = new ButtonBuilder()
								.setCustomId('lyric_button')
								.setEmoji('📃')
								.setStyle(ButtonStyle.Secondary);

							const pauseBtn = new ButtonBuilder()
								.setCustomId('pause_button')
								.setEmoji('⏸️')
								.setStyle(ButtonStyle.Success);

							const stopBtn = new ButtonBuilder()
								.setCustomId('stop_button')
								.setEmoji('⏹️')
								.setStyle(ButtonStyle.Danger);

							const skipBtn = new ButtonBuilder()
								.setCustomId('skip_button')
								.setEmoji('▶️')
								.setStyle(ButtonStyle.Secondary);

							const saveButton = new ButtonBuilder()
								.setCustomId('saveTrack')
								.setEmoji('1117815593043775569')
								.setStyle(ButtonStyle.Secondary);

							const shufleButton = new ButtonBuilder()
								.setCustomId('shufle')
								.setEmoji('🔀')
								.setStyle(ButtonStyle.Secondary);

							const downloadButton = new ButtonBuilder()
								.setCustomId('save')
								.setEmoji('1230868574722064446')
								.setStyle(ButtonStyle.Secondary);

							const autoplayButton = new ButtonBuilder()
								.setCustomId('autoplay')
								.setEmoji('1230869965435961394')
								.setStyle(ButtonStyle.Secondary);

							const actionRow = new ActionRowBuilder().addComponents(
								backBtn,
								pauseBtn,
								skipBtn
							);

							const actionRow2 = new ActionRowBuilder().addComponents(
								lyricBtn,
								stopBtn,
								saveButton
							);

							const actionRow3 = new ActionRowBuilder().addComponents(
								shufleButton,
								downloadButton,
								autoplayButton
							);

							await interaction
								.update({
									embeds: [embed],
									components: [actionRow, actionRow2, actionRow3],
								})
								.catch((e) => {});
						} catch (e) {
							const queue = client.player.getQueue(interaction.guild.id);

							if (!queue)
								return interaction
									.reply({
										content: `${lang.msg63} <a:alert:1116984255755599884>`,
										ephemeral: true,
									})
									.catch((e) => {});

							if (!queue.paused)
								return interaction
									.reply({ content: lang.msg132, ephemeral: true })
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
									guild_me?.voice?.channelId !==
									interaction?.member?.voice?.channelId
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

							const success = queue.resume();
							const successEmoji = '<a:Ceklis:1116989553744552007>';
							const failureEmoji = '<a:Cross:1116983956227772476>';
							const embed = new EmbedBuilder()
								.setColor('00FF7D')
								.setThumbnail(queue.songs[0].thumbnail)
								.setTimestamp()
								.setDescription(
									success
										? `**${queue.songs[0].name}**, ${lang.msg72}${successEmoji}`
										: lang.msg71 + failureEmoji
								)
								.setFooter({ text: 'Empire ❤️' });

							const backBtn = new ButtonBuilder()
								.setCustomId('back_button')
								.setEmoji('◀️')
								.setStyle(ButtonStyle.Secondary);

							const lyricBtn = new ButtonBuilder()
								.setCustomId('lyric_button')
								.setEmoji('📃')
								.setStyle(ButtonStyle.Secondary);

							const pauseBtn = new ButtonBuilder()
								.setCustomId('pause_button')
								.setEmoji('⏸️')
								.setStyle(ButtonStyle.Success);

							const stopBtn = new ButtonBuilder()
								.setCustomId('stop_button')
								.setEmoji('⏹️')
								.setStyle(ButtonStyle.Danger);

							const skipBtn = new ButtonBuilder()
								.setCustomId('skip_button')
								.setEmoji('▶️')
								.setStyle(ButtonStyle.Secondary);

							const saveButton = new ButtonBuilder()
								.setCustomId('saveTrack')
								.setEmoji('1117815593043775569')
								.setStyle(ButtonStyle.Secondary);

							const shufleButton = new ButtonBuilder()
								.setCustomId('shufle')
								.setEmoji('🔀')
								.setStyle(ButtonStyle.Secondary);

							const downloadButton = new ButtonBuilder()
								.setCustomId('save')
								.setEmoji('1230868574722064446')
								.setStyle(ButtonStyle.Secondary);

							const autoplayButton = new ButtonBuilder()
								.setCustomId('autoplay')
								.setEmoji('1230869965435961394')
								.setStyle(ButtonStyle.Secondary);

							const actionRow = new ActionRowBuilder().addComponents(
								backBtn,
								pauseBtn,
								skipBtn
							);

							const actionRow2 = new ActionRowBuilder().addComponents(
								lyricBtn,
								stopBtn,
								saveButton
							);

							const actionRow3 = new ActionRowBuilder().addComponents(
								shufleButton,
								downloadButton,
								autoplayButton
							);

							await interaction
								.update({
									embeds: [embed],
									components: [actionRow, actionRow2, actionRow3],
								})
								.catch((e) => {});
						}
						break;

					case 'shufle':
						try {
							let lang = await db?.musicbot?.findOne({
								guildID: interaction.guild.id,
							});
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
										guild_me?.voice?.channelId !==
										interaction?.member?.voice?.channelId
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
								try {
									queue.shuffle(interaction);
									const embed = new EmbedBuilder()
										.setColor('00FF7D')
										.setTimestamp()
										.setDescription(`<@${interaction.user.id}>, ${lang.msg133}`)
										.setFooter({ text: 'Empire ❤️' });

									interaction
										.reply({ embeds: [embed] })
										.then(() => {
											setTimeout(async () => {
												await interaction
													.deleteReply()
													.catch((err) => console.error(err));
											}, 300000); // 300 seconds or 5 minutes
										})
										.catch((e) => {});
								} catch (err) {
									return interaction
										.reply({ content: `**${err}**` })
										.catch((e) => {});
								}
							} catch (e) {
								const errorNotifer = require('../functions.js');
								errorNotifer(client, interaction, e, lang);
							}
						} catch (e) {
							const errorNotifer = require('../functions.js');
							errorNotifer(client, interaction, e, lang);
						}
						break;

					case 'autoplay':
						try {
							let lang = await db?.musicbot
								?.findOne({ guildID: interaction?.guild?.id })
								.catch((e) => {});
							lang = lang?.language || client.language;
							lang = require(`../languages/${lang}.js`);
							try {
								const queue = client?.player?.getQueue(interaction?.guild?.id);
								if (!queue || !queue?.playing)
									return interaction
										?.reply({
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
										guild_me?.voice?.channelId !==
										interaction?.member?.voice?.channelId
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

								queue?.toggleAutoplay();

								const replyEmbed = new EmbedBuilder()
									.setColor(queue?.autoplay ? '00FF7D' : '#FF0000')
									.setTimestamp()
									.setDescription(
										queue?.autoplay
											? `${lang.msg136} <a:Ceklis:1116989553744552007>`
											: `${lang.msg137} <a:alert:1116984255755599884>`
									)
									.setFooter({ text: `Empire ❤️` });

								interaction?.reply({ embeds: [replyEmbed] }).then(() => {
									setTimeout(async () => {
										await interaction
											.deleteReply()
											.catch((err) => console.error(err));
									}, 600000); // 600 seconds or 10 minutes
								});
							} catch (e) {
								const errorNotifer = require('../functions.js');
								errorNotifer(client, interaction, e, lang);
							}
						} catch (e) {
							const errorNotifer = require('../functions.js');
							errorNotifer(client, interaction, e, lang);
						}
						break;
				}
			}

			if (interaction?.type === InteractionType.ModalSubmit) {
				switch (interaction?.customId) {
					case 'playlistModal':
						{
							const queue = client?.player?.getQueue(interaction?.guildId);
							if (!queue || !queue?.playing)
								return interaction
									?.reply({
										content: `${lang.msg5} <a:alert:1116984255755599884>`,
										embeds: [],
										components: [],
										ephemeral: true,
									})
									.catch((e) => {});

							const name = interaction?.fields?.getTextInputValue('playlist');

							const playlist = await db?.playlist
								?.findOne({ userID: interaction?.user?.id })
								.catch((e) => {});
							if (
								!playlist?.playlist?.filter((p) => p.name === name).length > 0
							)
								return interaction
									?.reply({
										content: `${lang.msg10} <a:alert:1116984255755599884>`,
										ephemeral: true,
									})
									.catch((e) => {});

							const music_filter = playlist?.musics?.filter(
								(m) =>
									m.playlist_name === name &&
									m.music_name === queue?.songs[0]?.name
							);
							if (!music_filter?.length > 0) {
								await db?.playlist
									?.updateOne(
										{ userID: interaction?.user?.id },
										{
											$push: {
												musics: {
													playlist_name: name,
													music_name: queue?.songs[0]?.name,
													music_url: queue?.songs[0]?.url,
													saveTime: Date.now(),
												},
											},
										},
										{ upsert: true }
									)
									.catch((e) => {});
								return interaction
									?.reply({
										content: `<@${interaction?.user?.id}>, **${queue?.songs[0]?.name}** ${lang.msg12} <a:Ceklis:1116989553744552007>`,
										ephemeral: true,
									})
									.catch((e) => {});
							} else {
								return interaction
									?.reply({
										content: `<@${interaction?.user?.id}>, **${queue?.songs[0]?.name}** ${lang.msg104} <a:alert:1116984255755599884>`,
										ephemeral: true,
									})
									.catch((e) => {});
							}
						}
						break;
				}
			}
		}
	} catch (e) {
		const errorNotifer = require('../functions.js');
		errorNotifer(client, interaction, e, lang);
	}
};
