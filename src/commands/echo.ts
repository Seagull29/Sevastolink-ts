import { SpotifyApi } from "@services/spotify/api/spotifyApi";
import { SpotifyTypes } from "@services/spotify/api/spotifyTypes";
import { Command } from "@utils/models/command";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { setTimeout as wait } from "timers/promises";

import dotenv from "dotenv";
dotenv.config();

export default class EchoCommand extends Command {

    constructor() {
        const slashCommandBuilder : SlashCommandBuilder = new SlashCommandBuilder();
        super(
            slashCommandBuilder.setName("echo").
                                      setDescription("Replies with your input").
                                      addStringOption(option => option.setName("input").setDescription("The input to echo back").setRequired(true)) as SlashCommandBuilder)
        
    }

    override execute = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        const message : string = interaction.options.getString("input")!;
        
        const api = new SpotifyApi(process.env.SPOTIFY_CLIENT_ID!, process.env.SPOTIFY_CLIENT_SECRET!);
        const data = await api.search("fleetwood mac", SpotifyTypes.ARTIST);
        console.log(data.artists.items[0]);
        console.log(data.artists.items[1]);


        await interaction.deferReply();
        await wait(2000);
        await interaction.editReply(message);
    }

}