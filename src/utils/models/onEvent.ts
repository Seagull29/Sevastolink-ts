import { IEvent } from "@utils/interfaces/eventInterface";

export abstract class OnEvent implements IEvent {
    readonly #name! : string;
    readonly #once! : boolean;

    constructor(...args : any[]) {
        const [name, once] = args;
        this.#name = name;
        this.#once = once;
    }

    get name() : string {
        return this.#name;
    }

    get once() : boolean {
        return this.#once;
    }

    execute = (...args : any[]) : void => {
        if (args) {
            
        }
    }
}