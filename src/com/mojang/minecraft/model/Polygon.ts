import { shader } from "../Minecraft";
import { Vec3 } from "../phys/Vec3";
import { Tesselator } from "../renderer/Tesselator";
import { Vertex } from "./Vertex";

export class Polygon {
    public vertices: Vertex[]
    public vertexCount: number

    public constructor(vertices: Vertex[], u0: number, v0: number, u1: number, v1: number) {
        this.vertices = []
        this.vertices.push(vertices[0])
        this.vertices.push(vertices[1])
        this.vertices.push(vertices[2])
        this.vertices.push(vertices[2])
        this.vertices.push(vertices[3])
        this.vertices.push(vertices[0])

        this.vertexCount = this.vertices.length
        if (u0 != undefined && v0 != undefined && u1 != undefined && v1 != undefined) {
            this.vertices[0] = this.vertices[0].remap(u1, v0)
            this.vertices[1] = this.vertices[1].remap(u0, v0)
            this.vertices[2] = this.vertices[2].remap(u0, v1)
            this.vertices[3] = this.vertices[3].remap(u0, v1)
            this.vertices[4] = this.vertices[4].remap(u1, v1)
            this.vertices[5] = this.vertices[5].remap(u1, v0)
        }
    }

    public mirror(): void {
        let newVertices: Vertex[] = new Array(this.vertices.length)

        for (let i = 0; i < this.vertices.length; i++) {
            newVertices[i] = this.vertices[this.vertices.length - i - 1]
        }

        this.vertices = newVertices
    }

    public render(t: Tesselator, scale: number): void {
        let v0 = this.vertices[1].pos.vectorTo(this.vertices[0].pos)
        let v1 = this.vertices[1].pos.vectorTo(this.vertices[2].pos)
        let n = new Vec3(v0.y * v1.z - v0.z * v1.y, v0.z * v1.x - v0.x * v1.z, v0.x * v1.y - v0.y * v1.x).normalize()

        t.normal(n.x, n.y, n.z)

        for (let i = 0; i < this.vertices.length; i++) {
            let v = this.vertices[i]
            t.vertexUV(v.pos.x * scale, v.pos.y * scale, v.pos.z * scale, v.u, v.v)
        }
    }
}