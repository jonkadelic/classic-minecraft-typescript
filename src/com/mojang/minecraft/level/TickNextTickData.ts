export class TickNextTickData {
    public x: number
    public y: number
    public z: number
    public tileId: number
    public delay: number

    public constructor(x: number, y: number, z: number, tileId: number) {
        this.x = x
        this.y = y
        this.z = z
        this.tileId = tileId
        this.delay = 0
    }
}