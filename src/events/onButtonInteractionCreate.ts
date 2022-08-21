import { OnInteractionCreate } from "@utils/models/onInteractionCreate";
import { ButtonInteraction } from "discord.js";

export default class OnButtonInteractionCreate extends OnInteractionCreate {

    constructor() {
        super("interactionCreate", false);
    }

    override execute = async (interaction : ButtonInteraction) : Promise<void> => {
        if (!interaction.isButton()) {
            return;
        }
    }
}