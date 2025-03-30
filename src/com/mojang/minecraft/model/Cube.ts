import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl, matrix } from "../Minecraft";
import { Tesselator } from "../renderer/Tesselator";
import { Polygon } from "./Polygon";
import { Vertex } from "./Vertex";

export class Cube {
    private vertices: Vertex[] = []
    private polygons: Polygon[] = []
    private xTexOffs: number
    private yTexOffs: number
    public x: number = 0
    public y: number = 0
    public z: number = 0
    public xRot: number = 0
    public yRot: number = 0
    public zRot: number = 0
    public compiled: boolean = false
    public renderBuffer: RenderBuffer = new RenderBuffer(gl.STATIC_DRAW)
    public mirror: boolean = false
    public visible: boolean = true
    private neverRender: boolean = false

    public constructor(xTexOffs: number, yTexOffs: number) {
        this.xTexOffs = xTexOffs
        this.yTexOffs = yTexOffs
    }

    public setTexOffs(xTexOffs: number, yTexOffs: number): void {
        this.xTexOffs = xTexOffs
        this.yTexOffs = yTexOffs
    }

    public addBox(x0: number, y0: number, z0: number, w: number, h: number, d: number, g: number): void {
        this.vertices = new Array(8)
        this.polygons = new Array(6)

        let x1 = x0 + w
        let y1 = y0 + h
        let z1 = z0 + d

        x0 -= g
        y0 -= g
        z0 -= g
        x1 += g
        y1 += g
        z1 += g

        if (this.mirror) {
            let temp = x1
            x1 = x0
            x0 = temp
        }

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

        if (this.mirror) {
            for (let i = 0; i < this.polygons.length; i++) {
                this.polygons[i].mirror()
            }
        }
    }

    public setPos(x: number, y: number, z: number): void {
        this.x = x
        this.y = y
        this.z = z
    }

    public render(scale: number): void {
        if (this.visible) {
            if (!this.compiled) {
                this.compile(scale)
            }

            if (this.xRot != 0.0 || this.yRot != 0.0 || this.zRot != 0.0) {
                matrix.push()

                matrix.translate(this.x * scale, this.y * scale, this.z * scale)

                if (this.zRot != 0.0) {
                    matrix.rotate(this.zRot * (180.0 / Math.PI), 0.0, 0.0, 1.0)
                }
                if (this.yRot != 0.0) {
                    matrix.rotate(this.yRot * (180.0 / Math.PI), 0.0, 1.0, 0.0)
                }
                if (this.xRot != 0.0) {
                    matrix.rotate(this.xRot * (180.0 / Math.PI), 1.0, 0.0, 0.0)
                }

                this.renderBuffer.draw()
                matrix.pop()
            } else if (this.x == 0.0 && this.y == 0.0 && this.z == 0.0) {
                this.renderBuffer.draw()
            } else {
                matrix.translate(this.x * scale, this.y * scale, this.z * scale)
                this.renderBuffer.draw()
                matrix.translate(-this.x * scale, -this.y * scale, -this.z * scale)
            }
        }
    }

    private compile(scale: number): void {
        this.renderBuffer = new RenderBuffer(gl.STATIC_DRAW)
        let t = Tesselator.instance

        t.begin()
        for (let i = 0; i < this.polygons.length; i++) {
            this.polygons[i].render(t, scale)
        }
        t.end(this.renderBuffer)

        this.compiled = true
    }
}