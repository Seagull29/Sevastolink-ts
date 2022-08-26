import { Command } from "@utils/models/command";
import { ActionRowBuilder, Activity, ApplicationCommandType, ButtonBuilder, ButtonStyle, ContextMenuCommandBuilder, Guild, GuildMember, UserContextMenuCommandInteraction } from "discord.js";
import { nanoid } from "nanoid";

export default class SpotifyContextMenuCommand extends Command {
    
    constructor() {
        super(new ContextMenuCommandBuilder().setName("User Spotify activity").setType(ApplicationCommandType.User));
    }

    #buildButtons = () : ActionRowBuilder<ButtonBuilder> => {
        const getTrackButton : string = nanoid();
        const getAlbumButton : string = nanoid();
        const getArtistButton : string = nanoid();
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(getTrackButton).setStyle(ButtonStyle.Success).setLabel("Get track"),
            new ButtonBuilder().setCustomId(getAlbumButton).setStyle(ButtonStyle.Success).setLabel("Get track's album"),
            new ButtonBuilder().setCustomId(getArtistButton).setStyle(ButtonStyle.Success).setLabel("Get track's artist")
        );
        return row;
    }   

    override execute = async (interaction : UserContextMenuCommandInteraction) : Promise<void> => {
        const targetUserId : string  = interaction.targetUser.id;
        const guild : Guild = interaction.guild!;
        const targetMember : GuildMember = await guild.members.fetch({
            user: targetUserId,
            withPresences: true
        });
        const { presence } = targetMember;
        if (!presence) {
            await interaction.reply({
                content: `>>> The user ***${targetMember.user.username}*** is offline, and doesn't have any activities`,
                ephemeral: true
            });
            return;
        }
        if (!presence.activities.length) {
            await interaction.reply({
                content: `>>> The user ***${targetMember.user.username}*** doesn't have any activities`,
                ephemeral: true
            });
            return;
        }
        const spotifyActivity : Activity | undefined = presence.activities.find((activity : Activity) => activity.name === "Spotify");
        if (!spotifyActivity) {
            await interaction.reply({
                content: `>>> The user ***${targetMember.user.username}*** isn't listening to any track on Spotify`,
                ephemeral: true
            });
            return;
        }
        await interaction.reply({
            components: [this.#buildButtons()]
        });
    }
}