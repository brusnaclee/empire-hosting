const { exec } = require('child_process');
const os = require('os');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.js');

module.exports = {
    name: 'statistic',
    description: 'View the bot statistics.',
    options: [],
    permissions: '0x0000000000000800',
    run: async (client, interaction) => {
        let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id }).catch((e) => {});
        lang = lang?.language || client.language;
        lang = require(`../languages/${lang}.js`);

        try {
            // Fetching system stats (CPU, Memory, etc)
            exec('lscpu | grep -v "Flags"', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                const cpuInfo = stdout; // Collecting the filtered CPU info

                // Fetching memory info
                exec('free -m', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        return;
                    }
                    const memoryInfo = stdout; // Collecting the memory info

                    // Embed message
                    const embed = new EmbedBuilder()
                        .setTitle(`<a:Statisticreverse:1117043433022947438> ${client.user.username} ${lang.msg19} <a:Statistic:1117010987040645220>`)
                        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                        .setColor(client.config.embedColor)
                        .setTimestamp()
                        .setDescription(`**General Information:\n\n
• Owner: \`brusnaclee#0\`
• Developer: \`brusnaclee#0\`
• User Count: \`${totalMembers || 0}\`
• Server Count: \`${totalGuilds || 0}\`
• Channel Count: \`${totalChannels || 0}\`
• Shard Count: \`${shardSize || 0}\`
• Connected Voice: \`${voiceConnections}\`
• Command Count: \`${client.commands.map((c) => c.name).length}\`
• Operation Time: <t:${Math.floor(Number(Date.now() - client.uptime) / 1000)}:R>
• Ping: \`${client.ws.ping} MS\`
• Invite Bot: [Click](${config.botInvite})
• Website bot: [Click](${config.supportServer})
${
    config.sponsor.status == true
    ? `• Sponsor: [Click](${config.sponsor.url})`
    : ``
}
${
    config.voteManager.status == true
    ? `• Vote: [Click](${config.voteManager.vote_url})`
    : ``
}
**`); // Add general stats

                    // Buttons for interaction
                    const generalButton = new ButtonBuilder()
                        .setCustomId('general_info')
                        .setLabel('General Information')
                        .setStyle(ButtonStyle.Success);

                    const hardwareButton = new ButtonBuilder()
                        .setCustomId('hardware_info')
                        .setLabel('Hardware Information')
                        .setStyle(ButtonStyle.Success);

                    const buttonRow = new ActionRowBuilder().addComponents(generalButton, hardwareButton);

                    interaction.deferReply({ content: 'loading' });

                    interaction.editReply({
                        embeds: [embed],
                        components: [buttonRow],
                    }).then(() => {
                        const filter = (interaction) => interaction.user.id === interaction.user.id;
                        const collector = interaction.channel.createMessageComponentCollector({
                            filter,
                            time: 120000, // 2 minutes
                        });

                        collector.on('collect', async (interaction) => {
                            if (interaction.customId === 'general_info') {
                                embed.setDescription(`**General Information:\n\n
• Owner: \`brusnaclee#0\`
• Developer: \`brusnaclee#0\`
• User Count: \`${totalMembers || 0}\`
• Server Count: \`${totalGuilds || 0}\`
• Channel Count: \`${totalChannels || 0}\`
• Shard Count: \`${shardSize || 0}\`
• Connected Voice: \`${voiceConnections}\`
• Command Count: \`${client.commands.map((c) => c.name).length}\`
• Operation Time: <t:${Math.floor(Number(Date.now() - client.uptime) / 1000)}:R>
• Ping: \`${client.ws.ping} MS\`
• Invite Bot: [Click](${config.botInvite})
• Website bot: [Click](${config.supportServer})
${
    config.sponsor.status == true
    ? `• Sponsor: [Click](${config.sponsor.url})`
    : ``
}
${
    config.voteManager.status == true
    ? `• Vote: [Click](${config.voteManager.vote_url})`
    : ``
}
**`);
                                await interaction.update({ embeds: [embed] });
                            } else if (interaction.customId === 'hardware_info') {
                                // Updating the hardware info section
                                embed.setDescription(`**Hardware Information:\n\n
• CPU Info: \`\`\`${cpuInfo}\`\`\`
• Host Memory Usage: \`${memoryInfo}\`
• Architecture: \`${os.arch()}\`
• OS Version: \`${os.version()}\`
**`);
                                await interaction.update({ embeds: [embed] });
                            }
                        });

                        collector.on('end', async () => {
                            await interaction.editReply({
                                components: [],
                            }).then(() => {
                                setTimeout(async () => {
                                    await interaction.deleteReply().catch((err) => console.error(err));
                                }, 5000);
                            }).catch((err) => console.error(err));
                        });
                    });
                });
            });

        } catch (e) {
            const errorNotifer = require('../functions.js');
            errorNotifer(client, interaction, e, lang);
        }
    },
};
