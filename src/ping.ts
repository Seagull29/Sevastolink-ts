import { ActionRowBuilder, ButtonStyle, ButtonBuilder, ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, MessageComponentInteraction, SelectMenuBuilder } from "discord.js";
import { setTimeout as wait } from "timers/promises";
export default {
    data: new SlashCommandBuilder().setName("ping").setDescription("reply with pong"),
    async execute(interaction : ChatInputCommandInteraction) {
        /* await interaction.deleteReply(); */
        /* const message = await interaction.fetchReply(); */
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId("primary").setLabel("Primary").setStyle(ButtonStyle.Success)
            
        );

        const rowMenu = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
            new SelectMenuBuilder().setCustomId("select").setPlaceholder("Nothing selected").setMinValues(2).setMaxValues(3).addOptions(
                {
                    label: "Select me",
                    description: "This is a description",
                    value: "first"
                },
                {
                    label: "Select me too",
                    description: "This is a description",
                    value: "second"
                },
                {
                    label: "Select me too",
                    description: "This is a description",
                    value: "third"
                }
            )
        );


        const embed = new EmbedBuilder().setColor(0x0099FF).setTitle("Some title").setURL("https://discord.js.org").setDescription("Some description");
        await interaction.reply({
            content: "pong",
            embeds: [embed],
            components: [row, rowMenu]
        });

        
        const filter = (i : MessageComponentInteraction) => i.customId === "primary";
        const collector = interaction.channel?.createMessageComponentCollector({
            filter, 
            time: 4000
        });

        collector?.on("collect", async (i : MessageComponentInteraction) => {
            await i.deferUpdate();
            await wait(4000);
            await i.editReply({ content: "A button was clicked", components: []});
            /* await i.update({ content: "A button was clicked", components: []}); */
        });


        collector?.on("end", collected => console.log(`Collected ${collected.size} items`));

    }
}