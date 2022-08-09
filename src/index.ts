import DiscordJs from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new DiscordJs.Client({
    intents: [DiscordJs.GatewayIntentBits.Guilds]
});

client.on("ready", () => {
    console.log(`The bot ${client.user?.tag} is ready`);

    const guildId : string = "433837162530865154";
    const guild = client.guilds.cache.get(guildId);
    
    let commands;
    if (guild) {
        commands = guild.commands;
    } else {
        commands = client.application?.commands;
    }

    commands?.create({
        name: "ping",
        description: "replies with pong"
    });

    commands?.create({
        name: "add",
        description: "Adds two numbers",
        options: [
            {
                name: "num1",
                description: "The first number",
                required: true,
                type: DiscordJs.Constants.NonSystemMessageTypes.MessageType.Reply,
            }
        ]
    })

});


client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    const { commandName, options } = interaction;
    if (commandName === "ping") {
        interaction.reply({
            content: "pong",
        });
    }
} )

client.on("messageCreate", (message) => {
    if (message.content === "ping") {
        message.reply({
            content: "pong"
        });
    }
});

client.login(process.env.CLIENT_TOKEN);