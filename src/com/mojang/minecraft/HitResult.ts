import { Vec3 } from "./character/Vec3"
import { Entity } from "./Entity"

export class HitResult {
    public type: number
    public x: number
    public y: number
    public z: number
    public f: number
    public pos: Vec3 | null
    public entity: Entity | null

    private constructor(type: number, x: number, y: number, z: number, f: number, pos: Vec3 | null, entity: Entity | null) {
        this.type = type
        this.x = x
        this.y = y
        this.z = z
        this.f = f

        if (pos != null) {
            this.pos = new Vec3(pos.x, pos.y, pos.z)
        } else {
            this.pos = null
        }

        this.entity = entity
    }

    public static fromTile(x: number, y: number, z: number, f: number, pos: Vec3): HitResult {
        return new HitResult(0, x, y, z, f, pos, null)
    }

    public static fromEntity(entity: Entity): HitResult {
        return new HitResult(1, 0, 0, 0, 0, null, entity)
    }
}