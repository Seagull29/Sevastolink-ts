import { Command } from "@utils/models/command";
import { SlashCommandBuilder, CommandInteraction } from "discord.js";


export default class ServerCommand extends Command {

    constructor() {
        super(new SlashCommandBuilder().setName("server").setDescription("Replies with the server info"));
    }

    override execute = async (interaction : CommandInteraction) : Promise<void> => {
        const fetchedMembers = await interaction.guild?.members.fetch({ withPresences: true });
        const totalOnline = fetchedMembers?.filter(member => member.presence?.status === "online");
        fetchedMembers?.forEach(member => console.log(member.presence?.activities[0]));
        console.log(totalOnline?.size);
        await interaction.reply("ok");
        await interaction.deleteReply();
        
    }

}


/* export default {
    data: new SlashCommandBuilder().setName("server").setDescription("Replies with the server info"),
    async execute(interaction : CommandInteraction) {
        await interaction.reply(`Server info: ${interaction.guild?.name}\n${interaction.guild?.createdAt}`)
    }
}  */
