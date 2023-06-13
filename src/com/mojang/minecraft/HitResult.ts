export class HitResult {
    public type: number
    public x: number
    public y: number
    public z: number
    public f: number

    public constructor(type: number, x: number, y: number, z: number, f: number) {
        this.type = type
        this.x = x
        this.y = y
        this.z = z
        this.f = f
    }
}