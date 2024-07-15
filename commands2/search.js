const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require("../mongoDB");
module.exports = {
  name: "search",
  description: "Used for your music search",
  permissions: "0x0000000000000800",
  options: [{
    name: 'name',
    description: 'Type the name of the music you want to play.',
    type: ApplicationCommandOptionType.String,
    required: true
  }],
  voiceChannel: true,
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);

    try {
       await interaction.deferReply({ content: `Loading`, ephemeral: true });

      const name = interaction.options.getString('name')
      if (!name) return interaction.editReply({ content: `${lang.msg73} <a:Cross:1116983956227772476>`, ephemeral: true }).catch(e => { })
      let res
      try {
        res = await client.player.search(name, {
          member: interaction.member,
          textChannel: interaction.channel,
          interaction
        })
      } catch (e) {
        return interaction.editReply({ content: `${lang.msg60} <a:alert:1116984255755599884>`, ephemeral: true }).catch(e => { })
      }

      if (!res || !res.length || !res.length > 1) return interaction.editReply({ content: `${lang.msg74} <a:Cross:1116983956227772476>`, ephemeral: true }).catch(e => { })



      const embed = new EmbedBuilder();
      embed.setColor(client.config.embedColor);
      embed.setTitle(`${lang.msg75}: ${name}`);

      const maxTracks = res.slice(0, 10);

      let track_button_creator = maxTracks.map((song, index) => {
        return new ButtonBuilder()
          .setLabel(`${index + 1}`)
          .setStyle(ButtonStyle.Secondary)
          .setCustomId(`${index + 1}`)
      })

      let buttons1
      let buttons2
      if (track_button_creator.length > 10) {
        buttons1 = new ActionRowBuilder().addComponents(track_button_creator.slice(0, 5))
        buttons2 = new ActionRowBuilder().addComponents(track_button_creator.slice(5, 10))
      } else {
        if (track_button_creator.length > 5) {
          buttons1 = new ActionRowBuilder().addComponents(track_button_creator.slice(0, 5))
          buttons2 = new ActionRowBuilder().addComponents(track_button_creator.slice(5, Number(track_button_creator.length)))
        } else {
          buttons1 = new ActionRowBuilder().addComponents(track_button_creator)
        }
      }

      let cancel = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(lang.msg81)
          .setStyle(ButtonStyle.Danger)
          .setCustomId('cancel'))

      embed.setDescription(`${maxTracks.map((song, i) => `**${i + 1}**. [${song.name}](${song.url}) | \`${song.uploader.name}\``).join('\n')}\n\n${lang.msg76.replace("{maxTracks.length}", maxTracks.length)}`);
      embed.setTimestamp();
      embed.setFooter({ text: `Empire | brusnaclee ❤️` })

      let code
      if (buttons1 && buttons2) {
        code = { embeds: [embed], components: [buttons1, buttons2, cancel] }
      } else {
        code = { embeds: [embed], components: [buttons1, cancel] }
      }
      interaction.editReply(code).then(async Message => {
        const filter = i => i.user.id === interaction.user.id
        let collector = await Message.createMessageComponentCollector({ filter, time: 120000 })

        collector.on('collect', async (button) => {
          switch (button.customId) {
            case 'cancel': {
              embed.setColor("#FF0000")
              embed.setDescription(`${lang.msg77} <a:Cross:1116983956227772476>`)
              await interaction.editReply({ embeds: [embed], components: [], ephemeral: true }).catch(e => { })
              return collector.stop();
            }
              break;
            default: {


              embed.setColor("00FF7D")

              embed.setThumbnail(maxTracks[Number(button.customId) - 1].thumbnail)
              embed.setDescription(`**${res[Number(button.customId) - 1].name}** ${lang.msg79} <a:Ceklis:1116989553744552007>`)
              await interaction.editReply({ embeds: [embed], components: [], ephemeral: true }).catch(e => { })
              try {
                await client.player.play(interaction.member.voice.channel, res[Number(button.customId) - 1].url, {
                  member: interaction.member,
                  textChannel: interaction.channel,
                  interaction
                })
              } catch (e) {
                await interaction.editReply({ content: `${lang.msg60} <a:alert:1116984255755599884>`, ephemeral: true }).catch(e => { })
              }
              return collector.stop();
            }
          }
        });

        collector.on('end', (msg, reason) => {

          if (reason === 'time') {
            embed.setColor("#FF0000")
            embed.setDescription(`${lang.msg80} <a:alert:1116984255755599884>`)
            return interaction.editReply({ embeds: [embed], components: [], ephemeral: true }).catch(e => { })
          }
        })
      

      }).catch(e => { })
  
    } catch (e) {
  const errorNotifer = require("../functions.js")
  errorNotifer(client, interaction, e, lang)
}
  },
};
