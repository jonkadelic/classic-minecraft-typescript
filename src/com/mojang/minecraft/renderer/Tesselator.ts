import { Mth } from "../../../util/Mth";
import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl } from "../Minecraft"

export class Tesselator {
    private array: number[] = []
    private vertices: number = 0
    private u: number = 0
    private v: number = 0
    private r: number = 0
    private g: number = 0
    private b: number = 0
    private a: number = 0
    private hasColor: boolean = false
    private hasTexture: boolean = false
    public static instance: Tesselator = new Tesselator()

    private constructor() {
    }

    public end(buffer: RenderBuffer): void {
        buffer.configure(this.hasTexture, this.hasColor)
        buffer.bufferData(new Float32Array(this.array), this.vertices)
        this.clear()
    }

    private clear(): void {
        this.vertices = 0
        this.array = []
    }

    public begin(): void {
        this.clear()
        this.hasTexture = false
        this.hasColor = false
    }

    public tex(u: number, v: number): void {
        this.u = u
        this.v = v
        this.hasTexture = true
    }

    public color_f(r: number, g: number, b: number, a: number = 1): void {
        this.r = Mth.clamp(r, 0.0, 1.0)
        this.g = Mth.clamp(g, 0.0, 1.0)
        this.b = Mth.clamp(b, 0.0, 1.0)
        this.a = Mth.clamp(a, 0.0, 1.0)
        this.hasColor = true
    }

    public vertexUV(x: number, y: number, z: number, u: number, v: number): void {
        this.tex(u, v)
        this.vertex(x, y, z)
    }

    public vertex(x: number, y: number, z: number): void {
        if (this.hasTexture) {
            this.array.push(this.u)
            this.array.push(this.v)
        }
        if (this.hasColor) {
            this.array.push(this.r)
            this.array.push(this.g)
            this.array.push(this.b)
            this.array.push(this.a)
        }
        this.array.push(x)
        this.array.push(y)
        this.array.push(z)
        this.vertices++
    }

    public color_i(c: number, a: number = 255): void {
        a = a & 0xff
        const r: number = (c >> 16) & 0xff
        const g: number = (c >> 8) & 0xff
        const b: number = c & 0xff
        this.color_f(r / 255, g / 255, b / 255, a / 255)
    }
}