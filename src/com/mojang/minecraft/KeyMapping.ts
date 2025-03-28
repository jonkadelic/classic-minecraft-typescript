export class KeyMapping {
    public name: string
    public key: string

    constructor(name: string, defaultKey: string) {
        this.name = name
        this.key = defaultKey
    }
}