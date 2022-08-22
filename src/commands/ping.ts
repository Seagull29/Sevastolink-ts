import { Command } from "@utils/models/command";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, SelectMenuBuilder, SlashCommandBuilder } from "discord.js";
import { setTimeout as wait } from "timers/promises";

export default class PingCommand extends Command {

    constructor() {
        super(
            new SlashCommandBuilder().
                setName("ping").
                setDescription("reply with pong") 
        )
    }

    override execute = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId("primary").setLabel("Primeray").setStyle(ButtonStyle.Success)
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
                },
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
            time: 10000,
            max: 10 
        });


        collector?.on("collect", async (i : MessageComponentInteraction) => {
            /* await i.deferUpdate();
            await wait(4000);
            await i.editReply({
                content: "A button was clicked"
            }); */
            console.log(i);
            await i.update("otr");
            console.log("otra vez");
        });

        collector?.on("end", collected => console.log(`Collected ${collected.size} items`));
    }
}