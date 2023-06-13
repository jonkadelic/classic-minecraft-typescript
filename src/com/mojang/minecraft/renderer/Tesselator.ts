import { gl } from "../Minecraft"

export class Tesselator {
    private array: number[] = []
    private vertices: number = 0
    private u: number = 0
    private v: number = 0
    private r: number = 0
    private g: number = 0
    private b: number = 0
    private len: number = 3
    private p: number = 0
    private buffer: WebGLBuffer = null
    public static instance: Tesselator = new Tesselator()

    private constructor() {
    }

    public static drawBuffer(buffer: WebGLBuffer, vertices: number): void {
        const bytesPerFloat = 4

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        // Texture UV
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, bytesPerFloat * 8, 0)
        gl.enableVertexAttribArray(0)
        // Color RGB
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, bytesPerFloat * 8, bytesPerFloat * 2)
        gl.enableVertexAttribArray(1)
        // Vertex XYZ
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, bytesPerFloat * 8, bytesPerFloat * 5)
        gl.enableVertexAttribArray(2)

        gl.drawArrays(gl.TRIANGLES, 0, vertices)
    }

    public flush(): number {
        if (this.vertices > 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.array), gl.STATIC_DRAW)
        }
        let tmpVertices = this.vertices
        this.clear()
        return tmpVertices;
    }

    private clear(): void {
        this.vertices = 0
        this.p = 0
        this.array = []
    }

    public init(buffer: WebGLBuffer): void {
        this.clear()
        this.buffer = buffer
    }

    public tex(u: number, v: number): void {
        this.u = u
        this.v = v
    }

    public color_f(r: number, g: number, b: number): void {

        this.r = r
        this.g = g
        this.b = b
    }

    public vertexUV(x: number, y: number, z: number, u: number, v: number): void {
        this.tex(u, v)
        this.vertex(x, y, z)
    }

    public vertex(x: number, y: number, z: number): void {
        this.array.push(this.u)
        this.array.push(this.v)
        this.array.push(this.r)
        this.array.push(this.g)
        this.array.push(this.b)
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