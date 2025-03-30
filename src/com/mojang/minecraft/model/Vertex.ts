import { Vec3 } from "../phys/Vec3";

export class Vertex {
    public pos: Vec3
    public u: number
    public v: number

    public constructor(x: number, y: number, z: number, u: number, v: number) {
        this.pos = new Vec3(x, y, z)
        this.u = u
        this.v = v
    }

    public remap(u: number, v: number): Vertex {
        return new Vertex(this.pos.x, this.pos.y, this.pos.z, u, v)
    }
}