import { shader } from "../Minecraft";
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

    public render(t: Tesselator): void {
        for (let i = this.vertexCount - 1; i >= 0; i--) {
            const vertex = this.vertices[i]
            t.vertexUV(vertex.pos.x, vertex.pos.y, vertex.pos.z, vertex.u / 63.999, vertex.v / 31.999)
        }
    }
}