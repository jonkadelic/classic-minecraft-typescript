export class Vec3 {
    public x: number
    public y: number
    public z: number

    public constructor(x: number, y: number, z: number) {
        this.x = x
        this.y = y
        this.z = z
    }

    public vectorTo(other: Vec3): Vec3 {
        return new Vec3(other.x - this.x, other.y - this.y, other.z - this.z)
    }

    public normalize(): Vec3 {
        let l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
        return new Vec3(this.x / l, this.y / l, this.z / l)
    }

    public add(x: number, y: number, z: number): Vec3 {
        return new Vec3(this.x + x, this.y + y, this.z + z)
    }

    public distanceTo(other: Vec3): number {
        let dx = other.x - this.x
        let dy = other.y - this.y
        let dz = other.z - this.z
        return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }

    public distanceToSqr(other: Vec3): number {
        let dx = other.x - this.x
        let dy = other.y - this.y
        let dz = other.z - this.z
        return dx * dx + dy * dy + dz * dz
    }

    public clipX(other: Vec3, lerp: number): Vec3 {
        let dx = other.x - this.x
        let dy = other.y - this.y
        let dz = other.z - this.z
        if (dx * dx + dy * dy + dz * dz < 1e-6) {
            return null
        }
        let d = (other.x - this.x) / lerp
        if (d < 0) {
            return null
        }
        if (d > 1) {
            return null
        }
        return new Vec3(this.x + dx * d, this.y + dy * d, this.z + dz * d)
    }

    public clipY(other: Vec3, lerp: number): Vec3 {
        let dx = other.x - this.x
        let dy = other.y - this.y
        let dz = other.z - this.z
        if (dx * dx + dy * dy + dz * dz < 1e-6) {
            return null
        }
        let d = (other.y - this.y) / lerp
        if (d < 0) {
            return null
        }
        if (d > 1) {
            return null
        }
        return new Vec3(this.x + dx * d, this.y + dy * d, this.z + dz * d)
    }

    public clipZ(other: Vec3, lerp: number): Vec3 {
        let dx = other.x - this.x
        let dy = other.y - this.y
        let dz = other.z - this.z
        if (dx * dx + dy * dy + dz * dz < 1e-6) {
            return null
        }
        let d = (other.z - this.z) / lerp
        if (d < 0) {
            return null
        }
        if (d > 1) {
            return null
        }
        return new Vec3(this.x + dx * d, this.y + dy * d, this.z + dz * d)
    }
}