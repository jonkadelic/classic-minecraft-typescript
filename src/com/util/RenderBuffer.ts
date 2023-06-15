import { gl, matrix, shader } from "../mojang/minecraft/Minecraft";

export class RenderBuffer {
    private buffer: WebGLBuffer = null
    private vertices: number = 0
    private usage: number
    private hasTexture: boolean = false
    private hasColor: boolean = false

    public constructor(usage: number = gl.STATIC_DRAW) {
        this.buffer = gl.createBuffer()
        this.usage = usage
    }

    public bufferData(data: Float32Array, vertices: number): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, data, this.usage)
        this.vertices = vertices
    }

    public configure(hasTexture: boolean, hasColor: boolean): void {
        this.hasTexture = hasTexture
        this.hasColor = hasColor
    }

    public draw(): void {
        if (shader == null) return
        if (this.vertices == 0) return

        const bytesPerFloat = 4

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)

        if (this.hasTexture && this.hasColor) {
            // Texture UV
            gl.uniform1f(shader.getUniformLocation("uHasTexture"), 1)
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, bytesPerFloat * 9, 0)
            gl.enableVertexAttribArray(0)
            // Color RGBA
            gl.uniform1f(shader.getUniformLocation("uHasColor"), 1)
            gl.vertexAttribPointer(1, 4, gl.FLOAT, false, bytesPerFloat * 9, bytesPerFloat * 2)
            gl.enableVertexAttribArray(1)
            // Vertex XYZ
            gl.vertexAttribPointer(2, 3, gl.FLOAT, false, bytesPerFloat * 9, bytesPerFloat * 6)
            gl.enableVertexAttribArray(2)
        } else if (this.hasTexture) {
            // Texture UV
            gl.uniform1f(shader.getUniformLocation("uHasTexture"), 1)
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, bytesPerFloat * 5, 0)
            gl.enableVertexAttribArray(0)
            // Color RGBA
            gl.uniform1f(shader.getUniformLocation("uHasColor"), 0)
            gl.disableVertexAttribArray(1)
            // Vertex XYZ
            gl.vertexAttribPointer(2, 3, gl.FLOAT, false, bytesPerFloat * 5, bytesPerFloat * 2)
            gl.enableVertexAttribArray(2)
        } else if (this.hasColor) {
            // Texture UV
            gl.uniform1f(shader.getUniformLocation("uHasTexture"), 0)
            gl.disableVertexAttribArray(0)
            // Color RGBA
            gl.uniform1f(shader.getUniformLocation("uHasColor"), 1)
            gl.vertexAttribPointer(1, 4, gl.FLOAT, false, bytesPerFloat * 7, 0)
            gl.enableVertexAttribArray(1)
            // Vertex XYZ
            gl.vertexAttribPointer(2, 3, gl.FLOAT, false, bytesPerFloat * 7, bytesPerFloat * 4)
            gl.enableVertexAttribArray(2)
        } else {
            // Texture UV
            gl.uniform1f(shader.getUniformLocation("uHasTexture"), 0)
            gl.disableVertexAttribArray(0)
            // Color RGBA
            gl.uniform1f(shader.getUniformLocation("uHasColor"), 0)
            gl.disableVertexAttribArray(1)
            // Vertex XYZ
            gl.vertexAttribPointer(2, 3, gl.FLOAT, false, bytesPerFloat * 3, 0)
            gl.enableVertexAttribArray(2)
        }

        matrix.applyUniforms()

        gl.drawArrays(gl.TRIANGLES, 0, this.vertices)
    }
}