import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl, matrix } from "../Minecraft";
import { Tesselator } from "../renderer/Tesselator";
import { Polygon } from "./Polygon";
import { Vertex } from "./Vertex";

export class Cube {
    private vertices: Vertex[]
    private polygons: Polygon[]
    private xTexOffs: number
    private yTexOffs: number
    public x: number = 0
    public y: number = 0
    public z: number = 0
    public xRot: number = 0
    public yRot: number = 0
    public zRot: number = 0
    private compiled: boolean = false
    private renderBuffer: RenderBuffer

    public constructor(xTexOffs: number, yTexOffs: number) {
        this.xTexOffs = xTexOffs
        this.yTexOffs = yTexOffs
    }

    public setTexOffs(xTexOffs: number, yTexOffs: number): void {
        this.xTexOffs = xTexOffs
        this.yTexOffs = yTexOffs
    }

    public addBox(x0: number, y0: number, z0: number, w: number, h: number, d: number): void {
        this.vertices = new Array(8)
        this.polygons = new Array(6)
        let x1 = x0 + w
        let y1 = y0 + h
        let z1 = z0 + d
        let u0 = new Vertex(x0, y0, z0, 0.0, 0.0)
        let u1 = new Vertex(x1, y0, z0, 0.0, 8.0)
        let u2 = new Vertex(x1, y1, z0, 8.0, 8.0)
        let u3 = new Vertex(x0, y1, z0, 8.0, 0.0)
        let l0 = new Vertex(x0, y0, z1, 0.0, 0.0)
        let l1 = new Vertex(x1, y0, z1, 0.0, 8.0)
        let l2 = new Vertex(x1, y1, z1, 8.0, 8.0)
        let l3 = new Vertex(x0, y1, z1, 8.0, 0.0)
        this.vertices[0] = u0
        this.vertices[1] = u1
        this.vertices[2] = u2
        this.vertices[3] = u3
        this.vertices[4] = l0
        this.vertices[5] = l1
        this.vertices[6] = l2
        this.vertices[7] = l3
        this.polygons[0] = new Polygon([l1, u1, u2, l2], this.xTexOffs + d + w, this.yTexOffs + d, this.xTexOffs + d + w + d, this.yTexOffs + d + h);
        this.polygons[1] = new Polygon([u0, l0, l3, u3], this.xTexOffs + 0, this.yTexOffs + d, this.xTexOffs + d, this.yTexOffs + d + h);
        this.polygons[2] = new Polygon([l1, l0, u0, u1], this.xTexOffs + d, this.yTexOffs + 0, this.xTexOffs + d + w, this.yTexOffs + d);
        this.polygons[3] = new Polygon([u2, u3, l3, l2], this.xTexOffs + d + w, this.yTexOffs + 0, this.xTexOffs + d + w + w, this.yTexOffs + d);
        this.polygons[4] = new Polygon([u1, u0, u3, u2], this.xTexOffs + d, this.yTexOffs + d, this.xTexOffs + d + w, this.yTexOffs + d + h);
        this.polygons[5] = new Polygon([l0, l1, l2, l3], this.xTexOffs + d + w + d, this.yTexOffs + d, this.xTexOffs + d + w + d + w, this.yTexOffs + d + h);        
    }

    public setPos(x: number, y: number, z: number): void {
        this.x = x
        this.y = y
        this.z = z
    }

    public render(): void {
        if (!this.compiled) {
            this.compile()
        }
        let c = 57.29568
        matrix.push()
        matrix.translate(this.x, this.y, this.z)
        matrix.rotate(this.zRot * c, 0, 0, 1)
        matrix.rotate(this.yRot * c, 0, 1, 0)
        matrix.rotate(this.xRot * c, 1, 0, 0)
        this.renderBuffer.draw()
        matrix.pop()
    }

    private compile(): void {
        this.renderBuffer = new RenderBuffer(gl.STATIC_DRAW)
        let t = Tesselator.instance
        t.init()
        for (let i = 0; i < this.polygons.length; i++) {
            this.polygons[i].render(t)
        }
        t.flush(this.renderBuffer)
        this.compiled = true
    }
}