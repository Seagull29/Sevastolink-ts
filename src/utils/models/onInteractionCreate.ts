import { OnEvent } from "@utils/models/onEvent";

export abstract class OnInteractionCreate extends OnEvent {

    constructor(...args : any[]) {
        super(...args);
    }

    override execute = async (...args : any[]) : Promise<void> => {}

}