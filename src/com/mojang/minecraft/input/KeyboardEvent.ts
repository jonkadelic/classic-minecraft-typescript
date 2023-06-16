export class KeyboardEvent {
    public state: boolean
    public key: number

    public constructor(state: boolean, key: number) {
        this.state = state
        this.key = key
    }
}