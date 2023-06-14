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
    private hasColor: boolean = false
    private hasTexture: boolean = false
    public static instance: Tesselator = new Tesselator()

    private constructor() {
    }

    public flush(buffer: RenderBuffer): void {
        if (this.vertices > 0) {
            buffer.configure(this.hasTexture, this.hasColor)
            buffer.bufferData(new Float32Array(this.array), this.vertices)
        }
        this.clear()
    }

    private clear(): void {
        this.vertices = 0
        this.array = []
    }

    public init(): void {
        this.clear()
        this.hasTexture = false
        this.hasColor = false
    }

    public tex(u: number, v: number): void {
        this.u = u
        this.v = v
        this.hasTexture = true
    }

    public color_f(r: number, g: number, b: number): void {
        this.r = r
        this.g = g
        this.b = b
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
        }
        this.array.push(x)
        this.array.push(y)
        this.array.push(z)
        this.vertices++
    }

    public color_i(c: number): void {
        const r: number = (c >> 16) & 0xff
        const g: number = (c >> 8) & 0xff
        const b: number = c & 0xff
        this.color_f(r / 255, g / 255, b / 255)
    }
}