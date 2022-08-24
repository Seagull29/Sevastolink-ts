

export class GiphyUser {

    readonly #data! : any;

    constructor(data : any) {
        this.#data = data;
    }

    get avatarUrl() : string {
        const { avatar_url } = this.#data;
        return avatar_url;
    }

    get bannerImage() : string {
        const { banner_image } = this.#data;
        return banner_image;
    }

    get bannerUrl() : string {
        const { banner_url } = this.#data;
        return banner_url;
    }
    
    get profileUrl() : string {
        const { profile_url } = this.#data;
        return profile_url;
    }

    get username() : string {
        const { username } = this.#data;
        return username;
    }

    get displayName() : string {
        const { display_name } = this.#data;
        return display_name;
    }

    get description() : string {
        const { description } = this.#data;
        return description;
    }

    get instagramUrl() : string {
        const { instagram_url } = this.#data;
        return instagram_url;
    }

    get websiteUrl() : string {
        const { website_url } = this.#data;
        return website_url;
    }

    get isVerified() : boolean {
        const { is_verified } = this.#data;
        return is_verified;
    }
}