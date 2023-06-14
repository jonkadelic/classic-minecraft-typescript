import { gl, shader } from "../mojang/minecraft/Minecraft";

export class RenderBuffer {
    private buffer: WebGLBuffer = null
    private vertices: number = 0
    private usage: number

    public constructor(usage: number = gl.STATIC_DRAW) {
        this.buffer = gl.createBuffer()
        this.usage = usage
    }

    public bufferData(data: Float32Array, vertices: number): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, data, this.usage)
        this.vertices = vertices
    }

    public draw(): void {
        if (shader == null) return

        const bytesPerFloat = 4

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)

        // Texture UV
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, bytesPerFloat * 8, 0)
        gl.enableVertexAttribArray(0)
        // Color RGB
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, bytesPerFloat * 8, bytesPerFloat * 2)
        gl.enableVertexAttribArray(1)
        // Vertex XYZ
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, bytesPerFloat * 8, bytesPerFloat * 5)
        gl.enableVertexAttribArray(2)

        gl.drawArrays(gl.TRIANGLES, 0, this.vertices)
    }
}