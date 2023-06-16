export class MouseEvent {
    public x: number
    public y: number
    public state: boolean
    public button: number
    public wheel: number

    public constructor(x: number, y: number, state: boolean, button: number, wheel: number) {
        this.x = x
        this.y = y
        this.state = state
        this.button = button
        this.wheel = wheel
    }
}