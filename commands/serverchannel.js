const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'sc',
	description: 'Developer command.',
	options: [
		{
			name: 'server_id',
			description: 'The ID of the server.',
			type: 3,
			required: true,
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

		const serverID = interaction.options.getString('server_id');
		const guild = client.guilds.cache.get(serverID);
		if (!guild)
			return interaction
				.reply({ content: 'Invalid server ID.', ephemeral: true })
				.catch((e) => {});

		const channels = guild.channels.cache;
		const channelInfo = [];

		channels.forEach((channel) => {
			channelInfo.push(`${channel.name} - ${channel.id}`);
		});

		console.log(channelInfo.join('\n'));

		const embed = new EmbedBuilder()
			.setTitle('Server Channels')
			.setDescription(channelInfo.join('\n'));

		return interaction.reply({ embeds: [embed] }).catch((e) => {});
	},
};
