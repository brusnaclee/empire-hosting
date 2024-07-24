const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
	name: 'member',
	description: 'Developer command.',
	options: [
		{
			name: 'server',
			description: 'The ID of the server.',
			type: 3,
			required: false,
		},
	],
	permissions: '0x0000000000000800',
	run: async (client, interaction) => {
		if (!client.config.ownerID.includes(interaction?.user?.id))
			return interaction
				.reply({
					content: "You don't have permission to use this command.",
					ephemeral: true,
				})
				.catch((e) => {});

		const server = interaction.options.getString('server');
		if (server) {
			let guild;
			if (config.shardManager.shardStatus == true) {
				const getServer = async (guildID) => {
					const req = await client.shard.broadcastEval(
						(c, id) => c.guilds.cache.get(id),
						{
							context: guildID,
						}
					);
					return req.find((res) => !!res) || null;
				};
				guild = await getServer(server);
			} else {
				guild = client.guilds.cache.get(server);
			}

			if (!guild)
				return interaction
					.reply({
						content: "I'm not in that server.",
						ephemeral: true,
					})
					.catch((e) => {});

			const members = guild.members.cache.sort((a, b) =>
				a.id.localeCompare(b.id)
			);
			const embed = new EmbedBuilder()
				.setTitle(`Members in ${guild.name}`)
				.setColor(client.config.embedColor)
				.setDescription(
					members
						.map((member) => `> **${member.user.tag}** \`(${member.id})\``)
						.join('\n')
				)
				.setTimestamp();

			return interaction
				.reply({
					embeds: [embed],
					ephemeral: true,
				})
				.catch((e) => {});
		} else {
			const guild = interaction.guild;
			const members = guild.members.cache.sort((a, b) =>
				a.id.localeCompare(b.id)
			);
			const embed = new EmbedBuilder()
				.setTitle(`Members in ${guild.name}`)
				.setColor(client.config.embedColor)
				.setDescription(
					members
						.map((member) => `> **${member.user.tag}** \`(${member.id})\``)
						.join('\n')
				)
				.setTimestamp();

			return interaction
				.reply({
					embeds: [embed],
					ephemeral: true,
				})
				.catch((e) => {});
		}
	},
};
