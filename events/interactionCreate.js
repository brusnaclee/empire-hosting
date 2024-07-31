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
const maxVol = require('../config.js').opt.maxVol;
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
													?.replace(
														'0x0000000000000020',
														'MANAGE GUILD: This command is available only to the owner or admin of the server. Please contact the server owner or admin to use this command.'
													)
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

						const ytdl = require('@distube/ytdl-core');
						const { google } = require('googleapis');
						const youtubeSearch = require('youtube-search-api');
						const scdl = require('soundcloud-downloader').default;

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

						let songName = '';
						let songURL = '';
						let thumbnailURL = '';

						const song = queue.songs[0];
						songName = song.name;
						songURL = song.url;
						const searchResults = await youtubeSearch.GetListByKeyword(
							songName,
							false
						);
						if (searchResults.items.length === 0) {
							return interaction.editReply({
								content: 'No results found for your query.',
								ephemeral: true,
							});
						}
						const firstResult = searchResults.items[0];
						songName = firstResult.title;
						songURL = `https://www.youtube.com/watch?v=${searchResults.items[0].id}`;
						thumbnailURL = firstResult.thumbnail.thumbnails[0].url;

						const musicUrl = songURL;
						const musicName = songName;

						// Inisialisasi Google Drive
						const auth = new google.auth.GoogleAuth({
							keyFile: 'music-empire-421010-fbb0df18fbd8.json',
							scopes: ['https://www.googleapis.com/auth/drive.file'],
						});
						const drive = google.drive({ version: 'v3', auth });

						// SoundCloud Client ID
						const CLIENT_ID = 'FVqQoT3N6EFHpKzah6KOfyx1RQHdXIYD';

						// Function untuk mengecek apakah file sudah ada
						function checkFileExists(fileName) {
							try {
								fs.accessSync(fileName, fs.constants.F_OK);
								return true;
							} catch (err) {
								return false;
							}
						}

						// Cek apakah file dengan nama yang diberikan sudah ada
						let musicNames = 'audio';
						let count = 1;
						while (checkFileExists(`./music/${musicNames}.mp3`)) {
							count++;
							musicNames = `audio${count}`;
						}

						// Download musik dari URL yang diberikan
						const filePath = `./music/${musicNames}.mp3`;
						const fileStream = fs.createWriteStream(filePath);

						if (ytdl.validateURL(musicUrl)) {
							// Jika URL adalah YouTube
							const initialQuality = 'lowestaudio';
							ytdl(musicUrl, { quality: initialQuality }).pipe(fileStream);
						} else if (scdl.isValidUrl(musicUrl)) {
							// Jika URL adalah SoundCloud
							scdl
								.download(musicUrl, CLIENT_ID)
								.then((stream) => {
									stream.pipe(fileStream);
								})
								.catch((err) => {
									throw new Error('Error downloading from SoundCloud');
								});
						} else {
							return interaction
								.editReply({
									content:
										'URL Invalid. Only YouTube and SoundCloud are supported.',
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
						}

						fileStream.on('finish', async () => {
							// Upload musik ke Google Drive
							const fileMetadata = {
								name: `${musicName}.mp3`,
								parents: ['1SNF6krdRx8o3xZldDCLnusAPp6uBhD8e'], // Ganti dengan ID folder tujuan Anda
							};

							const media = {
								mimeType: 'audio/mpeg',
								body: fs.createReadStream(filePath),
							};

							drive.files.create(
								{
									resource: fileMetadata,
									media: media,
									fields: 'id',
								},
								(err, file) => {
									if (err) {
										console.error('Error uploading file to Google Drive:', err);
										fs.unlinkSync(filePath);
										return res
											.status(500)
											.send('Error uploading file to Google Drive.');
									}

									const fileID = file.data.id;
									const fileURL = `https://drive.google.com/file/d/${fileID}/view`;

									const googleDriveLink = fileURL;

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
											console.log(`Link sent successfully. name: ${musicUrl} `);

											setTimeout(async () => {
												await interaction
													.deleteReply()
													.catch((err) => console.error(err));
											}, 300000); // 300 seconds
										})
										.catch((err) => {
											console.error('Error sending embed message:', err);
										});

									fs.unlinkSync(filePath);

									// Schedule file deletion after 5 minutes
									setTimeout(() => {
										drive.files.delete(
											{
												fileId: fileID,
											},
											(err) => {
												if (err) {
													console.error(
														'Error deleting file from Google Drive:',
														err
													);
												} else {
													console.log(
														'File dihapus dari Google Drive setelah 5 menit.'
													);
												}
											}
										);
									}, 5 * 60 * 1000); // 5 minutes in milliseconds
								}
							);
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
							const config = require('../config.js');
							//const lyricsFinder = require('lyrics-finder');
							const geniusApi = require('genius-lyrics-api');
							const apiKey = config.GENIUS;

							const songNames = '';
							const artistNames = ' ';
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
										/\(.*?\)|\[.*?\]|\bofficial\b|\bmusic\b|\bvideo\b|\blive\b|\blyrics\b|\blyric\b|\blirik\b|\bHD\b|\bversion\b|\bfull\b|\bMV\b|\bmv\b|\bcover\b|\bremix\b|\bfeaturing\b|\bver\b|\bversion\b|\bedit\b|\bclip\b|\bteaser\b|\btrailer\b|\bofficial audio\b|\bperformance\b|\bconcert\b|\bkaraoke\b|\btour\b|\bremastered\b|\bremake\b|\bintro\b|\boutro\b|\bvisualizer\b|\bvisual\b|\btrack\b|\bcensored\b|\bopening\b|\bop\b|\bending\b|\bed\b|\bcreditless\b|\bcc\b|['.,":;\/\[\]()\-]/gi, // Menambahkan unwanted words dan simbol termasuk -
										''
									)
									.replace(/\bft\.?.*$/i, '')
									.replace(/\bfeat\.?.*$/i, '')
									.replace(/\bby\b.*$/i, '')
									.replace(/\|.*$/g, '') // Menambahkan regex untuk menghapus semua kata setelah |
									.trim();
							};

							titles = removeUnwantedWords(titles);

							const options = {
								apiKey: apiKey || '',
								title: titles || '',
								artist: artists || ' ',
								optimizeQuery: true,
							};

							const lyrics = await geniusApi.getLyrics(options);

							if (!lyrics) {
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
										}, 5000); // 600 seconds or 10 minutes
									});
							}

							const embed = new EmbedBuilder()
								.setColor(client.config.embedColor)
								.setTitle(titles)
								.setDescription(lyrics)
								.setTimestamp()
								.setFooter({ text: 'Empire ❤️' });

							// Edit the reply with ephemeral set to false
							await interaction
								.editReply({ embeds: [embed], ephemeral: false })
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
							console.error(error);
							if (error.code === 10062 || error.status === 404) {
								return interaction
									.editReply({ content: lang.msg4, ephemeral: true })
									.then(() => {
										setTimeout(async () => {
											await interaction
												.deleteReply()
												.catch((err) => console.error(err));
										}, 5000); // 600 seconds or 10 minutes
									});
							}
							interaction
								.editReply({
									content: 'An error occurred while processing the request.',
									ephemeral: true,
								})
								.then(() => {
									setTimeout(async () => {
										await interaction
											.deleteReply()
											.catch((err) => console.error(err));
									}, 5000); // 600 seconds or 10 minutes
								});
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

							const lyricBtn = new ButtonBuilder()
								.setCustomId('lyric_button')
								.setEmoji('📃')
								.setStyle(ButtonStyle.Secondary);

							const resumeBtn = new ButtonBuilder()
								.setCustomId('resume_button')
								.setEmoji('⏯️')
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
								.setEmoji('💾')
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

							const FseekButton = new ButtonBuilder()
								.setCustomId('Fseek')
								.setEmoji('⏩')
								.setStyle(ButtonStyle.Secondary);

							const BseekButton = new ButtonBuilder()
								.setCustomId('Bseek')
								.setEmoji('⏪')
								.setStyle(ButtonStyle.Secondary);

							const VolupButton = new ButtonBuilder()
								.setCustomId('VolUp')
								.setEmoji('🔊')
								.setStyle(ButtonStyle.Secondary);

							const VoldownButton = new ButtonBuilder()
								.setCustomId('VolDown')
								.setEmoji('🔉')
								.setStyle(ButtonStyle.Secondary);

							const AddButton = new ButtonBuilder()
								.setCustomId('AddMusic')
								.setEmoji('➕')
								.setStyle(ButtonStyle.Secondary);

							const loopButton = new ButtonBuilder()
								.setCustomId('Loops')
								.setEmoji('🔁')
								.setStyle(ButtonStyle.Secondary);

							const actionRow = new ActionRowBuilder().addComponents(
								BseekButton,
								backBtn,
								resumeBtn,
								skipBtn,
								FseekButton
							);

							const actionRow2 = new ActionRowBuilder().addComponents(
								VoldownButton,
								lyricBtn,
								stopBtn,
								autoplayButton,
								VolupButton
							);

							const actionRow3 = new ActionRowBuilder().addComponents(
								shufleButton,
								downloadButton,
								AddButton,
								saveButton,
								loopButton
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

							const lyricBtn = new ButtonBuilder()
								.setCustomId('lyric_button')
								.setEmoji('📃')
								.setStyle(ButtonStyle.Secondary);

							const resumeBtn = new ButtonBuilder()
								.setCustomId('resume_button')
								.setEmoji('⏯️')
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
								.setEmoji('💾')
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

							const FseekButton = new ButtonBuilder()
								.setCustomId('Fseek')
								.setEmoji('⏩')
								.setStyle(ButtonStyle.Secondary);

							const BseekButton = new ButtonBuilder()
								.setCustomId('Bseek')
								.setEmoji('⏪')
								.setStyle(ButtonStyle.Secondary);

							const VolupButton = new ButtonBuilder()
								.setCustomId('VolUp')
								.setEmoji('🔊')
								.setStyle(ButtonStyle.Secondary);

							const VoldownButton = new ButtonBuilder()
								.setCustomId('VolDown')
								.setEmoji('🔉')
								.setStyle(ButtonStyle.Secondary);

							const AddButton = new ButtonBuilder()
								.setCustomId('AddMusic')
								.setEmoji('➕')
								.setStyle(ButtonStyle.Secondary);

							const loopButton = new ButtonBuilder()
								.setCustomId('Loops')
								.setEmoji('🔁')
								.setStyle(ButtonStyle.Secondary);

							const actionRow = new ActionRowBuilder().addComponents(
								BseekButton,
								backBtn,
								resumeBtn,
								skipBtn,
								FseekButton
							);

							const actionRow2 = new ActionRowBuilder().addComponents(
								VoldownButton,
								lyricBtn,
								stopBtn,
								autoplayButton,
								VolupButton
							);

							const actionRow3 = new ActionRowBuilder().addComponents(
								shufleButton,
								downloadButton,
								AddButton,
								saveButton,
								loopButton
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
								.setEmoji('💾')
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

							const FseekButton = new ButtonBuilder()
								.setCustomId('Fseek')
								.setEmoji('⏩')
								.setStyle(ButtonStyle.Secondary);

							const BseekButton = new ButtonBuilder()
								.setCustomId('Bseek')
								.setEmoji('⏪')
								.setStyle(ButtonStyle.Secondary);

							const VolupButton = new ButtonBuilder()
								.setCustomId('VolUp')
								.setEmoji('🔊')
								.setStyle(ButtonStyle.Secondary);

							const VoldownButton = new ButtonBuilder()
								.setCustomId('VolDown')
								.setEmoji('🔉')
								.setStyle(ButtonStyle.Secondary);

							const AddButton = new ButtonBuilder()
								.setCustomId('AddMusic')
								.setEmoji('➕')
								.setStyle(ButtonStyle.Secondary);

							const loopButton = new ButtonBuilder()
								.setCustomId('Loops')
								.setEmoji('🔁')
								.setStyle(ButtonStyle.Secondary);

							const actionRow = new ActionRowBuilder().addComponents(
								BseekButton,
								backBtn,
								pauseBtn,
								skipBtn,
								FseekButton
							);

							const actionRow2 = new ActionRowBuilder().addComponents(
								VoldownButton,
								lyricBtn,
								stopBtn,
								autoplayButton,
								VolupButton
							);

							const actionRow3 = new ActionRowBuilder().addComponents(
								shufleButton,
								downloadButton,
								AddButton,
								saveButton,
								loopButton
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
								.setEmoji('💾')
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

							const FseekButton = new ButtonBuilder()
								.setCustomId('Fseek')
								.setEmoji('⏩')
								.setStyle(ButtonStyle.Secondary);

							const BseekButton = new ButtonBuilder()
								.setCustomId('Bseek')
								.setEmoji('⏪')
								.setStyle(ButtonStyle.Secondary);

							const VolupButton = new ButtonBuilder()
								.setCustomId('VolUp')
								.setEmoji('🔊')
								.setStyle(ButtonStyle.Secondary);

							const VoldownButton = new ButtonBuilder()
								.setCustomId('VolDown')
								.setEmoji('🔉')
								.setStyle(ButtonStyle.Secondary);

							const AddButton = new ButtonBuilder()
								.setCustomId('AddMusic')
								.setEmoji('➕')
								.setStyle(ButtonStyle.Secondary);

							const loopButton = new ButtonBuilder()
								.setCustomId('Loops')
								.setEmoji('🔁')
								.setStyle(ButtonStyle.Secondary);

							const actionRow = new ActionRowBuilder().addComponents(
								BseekButton,
								backBtn,
								pauseBtn,
								skipBtn,
								FseekButton
							);

							const actionRow2 = new ActionRowBuilder().addComponents(
								VoldownButton,
								lyricBtn,
								stopBtn,
								autoplayButton,
								VolupButton
							);

							const actionRow3 = new ActionRowBuilder().addComponents(
								shufleButton,
								downloadButton,
								AddButton,
								saveButton,
								loopButton
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
									}, 300000); // 300 seconds or 5 minutes
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

					case 'Fseek':
						function getFormattedTime(seconds) {
							let hours = Math.floor(seconds / 3600);
							let minutes = Math.floor((seconds % 3600) / 60);
							let remainingSeconds = seconds % 60;

							hours = hours < 10 ? `0${hours}` : hours;
							minutes = minutes < 10 ? `0${minutes}` : minutes;
							remainingSeconds =
								remainingSeconds < 10
									? `0${remainingSeconds}`
									: remainingSeconds;

							return hours > 0
								? `${hours}:${minutes}:${remainingSeconds}`
								: `${minutes}:${remainingSeconds}`;
						}
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

								let position = queue.currentTime + 15;
								let formattedtotalTime = Math.round(position);
								if (isNaN(position))
									return interaction
										.reply({ content: `${lang.msg134}`, ephemeral: true })
										.catch((e) => {});

								let formattedPosition = getFormattedTime(formattedtotalTime);

								queue.seek(formattedtotalTime);
								const embed = new EmbedBuilder()
									.setColor('00FF7D')
									.setTimestamp()
									.setDescription(
										`${lang.msg135.replace(
											'{queue.formattedCurrentTime}',
											formattedPosition
										)}`
									)
									.setFooter({ text: `Empire ❤️` });

								interaction
									.reply({ embeds: [embed] })
									.then(() => {
										setTimeout(async () => {
											await interaction
												.deleteReply()
												.catch((err) => console.error(err));
										}, 30000);
									})
									.catch((e) => {});
							} catch (e) {
								const errorNotifier = require('../functions.js');
								errorNotifier(client, interaction, e, lang);
							}
						} catch (e) {
							const errorNotifer = require('../functions.js');
							errorNotifer(client, interaction, e, lang);
						}

						break;

					case 'Bseek':
						function getFormattedTime(seconds) {
							let hours = Math.floor(seconds / 3600);
							let minutes = Math.floor((seconds % 3600) / 60);
							let remainingSeconds = seconds % 60;

							hours = hours < 10 ? `0${hours}` : hours;
							minutes = minutes < 10 ? `0${minutes}` : minutes;
							remainingSeconds =
								remainingSeconds < 10
									? `0${remainingSeconds}`
									: remainingSeconds;

							return hours > 0
								? `${hours}:${minutes}:${remainingSeconds}`
								: `${minutes}:${remainingSeconds}`;
						}
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

								let position = queue.currentTime - 15;
								let formattedtotalTime = Math.round(position);
								if (isNaN(position))
									return interaction
										.reply({ content: `${lang.msg134}`, ephemeral: true })
										.catch((e) => {});

								if (formattedtotalTime < 0) {
									formattedtotalTime = 0;
								}

								let formattedPosition = getFormattedTime(formattedtotalTime);

								queue.seek(formattedtotalTime);
								const embed = new EmbedBuilder()
									.setColor('00FF7D')
									.setTimestamp()
									.setDescription(
										`${lang.msg135.replace(
											'{queue.formattedCurrentTime}',
											formattedPosition
										)}`
									)
									.setFooter({ text: `Empire ❤️` });

								interaction
									.reply({ embeds: [embed] })
									.then(() => {
										setTimeout(async () => {
											await interaction
												.deleteReply()
												.catch((err) => console.error(err));
										}, 30000);
									})
									.catch((e) => {});
							} catch (e) {
								const errorNotifier = require('../functions.js');
								errorNotifier(client, interaction, e, lang);
							}
						} catch (e) {
							const errorNotifer = require('../functions.js');
							errorNotifer(client, interaction, e, lang);
						}

						break;

					case 'VolUp':
						try {
							let lang = await db?.musicbot?.findOne({
								guildID: interaction.guild.id,
							});
							lang = lang?.language || client.language;
							lang = require(`../languages/${lang}.js`);
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

							const voltime = queue.volume + 15;

							const vol = Math.round(voltime);

							if (!vol)
								return interaction
									.reply({
										content: lang.msg87
											.replace('{queue.volume}', queue.volume)
											.replace('{maxVol}', maxVol),
										ephemeral: true,
									})
									.catch((e) => {});

							if (queue.volume === vol)
								return interaction
									.reply({
										content: `${lang.msg88} <a:alert:1116984255755599884>`,
										ephemeral: true,
									})
									.catch((e) => {});

							if (vol < 0 || vol > maxVol)
								return interaction
									.reply({
										content:
											lang.ms89 +
											' <a:Cross:1116983956227772476>'.replace(
												'{maxVol}',
												maxVol
											),
										ephemeral: true,
									})
									.catch((e) => {});

							const success = queue.setVolume(vol);
							const embed = new EmbedBuilder()
								.setColor('00FF7D')
								.setTimestamp()
								.setDescription(
									success
										? `<a:Headphone:1116990535719206993> ${lang.msg90} ** ${vol} **/**${maxVol}** <a:Musicon:1116994369833144350>`
										: lang.msg41
								)
								.setFooter({ text: `Empire ❤️` });

							interaction
								.reply({ embeds: [embed] })
								.then(() => {
									setTimeout(async () => {
										await interaction
											.deleteReply()
											.catch((err) => console.error(err));
									}, 30000);
								})
								.catch((e) => {});
						} catch (e) {
							const errorNotifer = require('../functions.js');
							errorNotifer(client, interaction, e, lang);
						}

						break;

					case 'VolDown':
						try {
							let lang = await db?.musicbot?.findOne({
								guildID: interaction.guild.id,
							});
							lang = lang?.language || client.language;
							lang = require(`../languages/${lang}.js`);

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

							const voltime = queue.volume - 15;

							const vol = Math.round(voltime);

							if (!vol)
								return interaction
									.reply({
										content: lang.msg87
											.replace('{queue.volume}', queue.volume)
											.replace('{maxVol}', maxVol),
										ephemeral: true,
									})
									.catch((e) => {});

							if (queue.volume === vol)
								return interaction
									.reply({
										content: `${lang.msg88} <a:alert:1116984255755599884>`,
										ephemeral: true,
									})
									.catch((e) => {});

							if (vol < 0 || vol > maxVol)
								return interaction
									.reply({
										content:
											lang.ms89 +
											' <a:Cross:1116983956227772476>'.replace(
												'{maxVol}',
												maxVol
											),
										ephemeral: true,
									})
									.catch((e) => {});

							const success = queue.setVolume(vol);
							const embed = new EmbedBuilder()
								.setColor('00FF7D')
								.setTimestamp()
								.setDescription(
									success
										? `<a:Headphone:1116990535719206993> ${lang.msg90} ** ${vol} **/**${maxVol}** <a:Musicon:1116994369833144350>`
										: lang.msg41
								)
								.setFooter({ text: `Empire ❤️` });

							interaction
								.reply({ embeds: [embed] })
								.then(() => {
									setTimeout(async () => {
										await interaction
											.deleteReply()
											.catch((err) => console.error(err));
									}, 30000);
								})
								.catch((e) => {});
						} catch (e) {
							const errorNotifer = require('../functions.js');
							errorNotifer(client, interaction, e, lang);
						}

						break;

					case 'AddMusic':
						{
							const queue = client?.player?.getQueue(interaction?.guildId);

							const Modal = new ModalBuilder()
								.setCustomId('MusicModal')
								.setTitle(lang.msg150);

							const PlayList = new TextInputBuilder()
								.setCustomId('MusicName')
								.setLabel(lang.msg151)
								.setRequired(true)
								.setStyle(TextInputStyle.Short);

							const PlaylistRow = new ActionRowBuilder().addComponents(
								PlayList
							);

							Modal.addComponents(PlaylistRow);

							await interaction?.showModal(Modal).catch((e) => {});
						}
						break;

					case 'Loops':
						{
							let lang = await db?.musicbot?.findOne({
								guildID: interaction.guild.id,
							});
							lang = lang?.language || client.language;
							lang = require(`../languages/${lang}.js`);
							const queue = client?.player?.getQueue(interaction?.guildId);

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

							await interaction.deferReply({ ephemeral: false });

							if (queue.repeatMode === 0) {
								const success = queue.setRepeatMode(2);
								const embed = new EmbedBuilder()
									.setColor('00FF7D')
									.setTimestamp()
									.setDescription(
										`${lang.msg40} <a:Ceklis:1116989553744552007>`
									)
									.setFooter({ text: `Empire ❤️` });

								return interaction
									?.editReply({
										embeds: [embed],
									})
									.then(() => {
										setTimeout(async () => {
											await interaction
												.deleteReply()
												.catch((err) => console.error(err));
										}, 60000);
									})
									.catch((e) => {});
							} else {
								const success2 = queue.setRepeatMode(0);
								const embed = new EmbedBuilder()
									.setColor('00FF7D')
									.setTimestamp()
									.setDescription(
										`${lang.msg44} <a:Ceklis:1116989553744552007>`
									)
									.setFooter({ text: `Empire ❤️` });

								return interaction
									?.editReply({
										embeds: [embed],
									})
									.then(() => {
										setTimeout(async () => {
											await interaction
												.deleteReply()
												.catch((err) => console.error(err));
										}, 60000);
									})
									.catch((e) => {});
							}
						}
						break;
				}
			}

			if (interaction?.type === InteractionType.ModalSubmit) {
				switch (interaction?.customId) {
					case 'MusicModal':
						{
							const axios = require('axios');
							const queue = client?.player?.getQueue(interaction?.guildId);

							const name = interaction?.fields?.getTextInputValue('MusicName');

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
								await client.player.play(
									interaction.member.voice.channel,
									name,
									{
										member: interaction.member,
										textChannel: interaction.channel,
										interaction,
									}
								);
							} catch (e) {
								console.log(e);
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

							await interaction
								.deleteReply()
								.catch((err) => console.error(err));

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
									{
										name: 'Server',
										value: `${guildName} (${interaction.guild.id})`,
									},
									{
										name: 'User',
										value: `${userName} (${interaction.user.id})`,
									},
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
						break;

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
