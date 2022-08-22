import { SpotifyApi } from "@services/spotify/api/spotifyApi";
import { SpotifyTypes } from "@services/spotify/api/spotifyTypes";
import { Spotify } from "@services/spotify/models/spotify";
import { Command } from "@utils/models/command";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, italic, Message, MessageComponentInteraction, resolveColor, SlashCommandBuilder, SlashCommandSubcommandBuilder, User } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

export default class SpotifyCommand extends Command {

    readonly #spotifyApi : SpotifyApi = new SpotifyApi(
        process.env.SPOTIFY_CLIENT_ID || "",
        process.env.SPOTIFY_CLIENT_SECRET || ""        
    );

    constructor() {
        super(SpotifyCommand.#makeCommand());
    }

    static #makeCommand = () : SlashCommandBuilder => {
        const spotifyCommand : SlashCommandBuilder = new SlashCommandBuilder();
        spotifyCommand.setName("spotify").setDescription("Find whatever you want on Spotify catalog");
        spotifyCommand.addSubcommandGroup(subcommandGroup => {
            subcommandGroup.setName("search").setDescription("Search artists, tracks, albums, and more on Spotify");
            subcommandGroup.addSubcommand(this.#makeSubcommand({ 
                name: "artists", description: "Search artists on Spotify", optionName: "query", optionDescription: "Artist to search"
            }));
            subcommandGroup.addSubcommand(this.#makeSubcommand({ 
                name: "tracks", description: "Search tracks on Spotify", optionName: "query", optionDescription: "Track to search"
            }));
            subcommandGroup.addSubcommand(this.#makeSubcommand({ 
                name: "albums", description: "Search albums on Spotify", optionName: "query", optionDescription: "Album to search"
            }));
            subcommandGroup.addSubcommand(this.#makeSubcommand({ 
                name: "playlists", description: "Search playlists on Spotify", optionName: "query", optionDescription: "Playlist to search"
            }));
            
            return subcommandGroup;
        });
        return spotifyCommand;
    }

    static #makeSubcommand = ({ name, description, optionName, optionDescription } : { name : string, description : string, optionName : string, optionDescription : string}) : SlashCommandSubcommandBuilder => {
        const subcommand : SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder();
        subcommand.setName(name).setDescription(description);
        subcommand.addStringOption(option => {
            option.setName(optionName).setDescription(optionDescription).setMaxLength(25).setRequired(true);
            return option;
        });
        return subcommand;
    }

    #makeButtons = () : ActionRowBuilder<ButtonBuilder> => {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId("previousElement").setStyle(ButtonStyle.Success).setEmoji("⏮️").setLabel("Previous"),
            new ButtonBuilder().setCustomId("nextElement").setStyle(ButtonStyle.Success).setLabel("Next").setEmoji("⏭️")
        );
        return row;
    }

    #makeArtistEmbed = (artists : Spotify[], user : User, index : number) : EmbedBuilder => {

        const now : Date = new Date();
        const embed : EmbedBuilder = new EmbedBuilder();
        const artist = artists[index];

        embed.setTitle(artist.name).setURL(artist.externalUrl).setColor(user.accentColor!);
        embed.setAuthor({
            name: "Spotify",
            iconURL: "https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png",
            url: "https://open.spotify.com/"
        });
        embed.setThumbnail(artist.standardImage);
        embed.setFooter({
            text: `${italic(`Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${artists.length}`)}`,
            iconURL: user.avatarURL() || ""
        });
    
        embed.addFields(
            { name: "Genres", value: artist.genres.join(", ") },
            { name: "Type", value: artist.type, inline: true  },
            { name: "Followers", value: artist.followers.toString(), inline: true },
            { name: "Popularity", value: artist.popularity.toString(), inline: true }
        );
        return embed;
    }

    #processArtists = async (interaction : ChatInputCommandInteraction, query : string) : Promise<void> => {
        await interaction.deferReply();

        const data = await this.#spotifyApi.search(query, SpotifyTypes.ARTIST);
        const { artists : { items } } = data;
        const artists : Spotify[] = [];
        for (const artist of items) {
            artists.push(new Spotify(artist));
        }

        let index : number = 0;
        const selected : Spotify = artists[index];
        const user : User = await interaction.user.fetch();

        await interaction.editReply({
            embeds: [this.#makeArtistEmbed(artists, user, index)],
            components: [this.#makeButtons()]
        });

        let embedUrlMessage : Message = await (await interaction.followUp(selected.externalUrl)).fetch();

        const nextFilter = (messageInteraction : MessageComponentInteraction) => messageInteraction.customId === "nextElement";

        const nextCollector = interaction.channel?.createMessageComponentCollector({
            filter: nextFilter,
            time: 1000 * 20,
            max: 5
        });


        nextCollector?.on("collect", async (messageInteraction : MessageComponentInteraction) => {
            ++index;
            if (index === artists.length) {
                index = 0;
            }
            const currentArtist : Spotify = artists[index];
            embedUrlMessage.delete();
            
            await messageInteraction.update({
                embeds: [this.#makeArtistEmbed(artists, user, index)]
            });
            embedUrlMessage = await messageInteraction.followUp(currentArtist.externalUrl);
        });

        nextCollector?.on("end", collected => {
            console.log(`Collected ${collected.size} items`);
        });


        
    }
    #processTracks = async (interaction : ChatInputCommandInteraction, query : string) => {
        const data = await this.#spotifyApi.search(query, SpotifyTypes.TRACK);
        const { tracks : { items } } = data;
        
    }
    #processAlbums = async (interaction : ChatInputCommandInteraction, query : string) => {
        const data = await this.#spotifyApi.search(query, SpotifyTypes.ALBUM);
        const { albums : { items } } = data;
        
    }
    #processPlaylists = async (interaction : ChatInputCommandInteraction, query : string) => {
        const data = await this.#spotifyApi.search(query, SpotifyTypes.PLAYLIST);
        const { playlists : { items } } = data;

    }

    override execute = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        const query : string = interaction.options.getString("query")!;
        const { _group : group } : any = interaction.options;
        const { _subcommand : subcommand } : any = interaction.options;

        if (group === "search") {
            switch (subcommand) {
                case "artists":
                    this.#processArtists(interaction, query);
                    break;
                case "albums":
                    this.#processAlbums(interaction, query);
                    break;
                case "tracks":
                    this.#processTracks(interaction, query);
                    break;
                case "playlists":
                    this.#processPlaylists(interaction, query);
                    break;

            }
        }
    }


}