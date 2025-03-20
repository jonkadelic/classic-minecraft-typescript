import { gl, matrix, shader } from "../mojang/minecraft/Minecraft";

export class RenderBuffer {
    private buffer: WebGLBuffer
    private vertices: number = 0
    private usage: number
    private hasTexture: boolean = false
    private hasColor: boolean = false

    public constructor(usage: number = gl.STATIC_DRAW) {
        let b = gl.createBuffer()
        if (!b) throw new Error("Failed to create render buffer")
        this.buffer = b
        this.usage = usage
    }

    public delete(): void {
        gl.deleteBuffer(this.buffer)
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
        if (!shader.isLoaded()) return
        if (this.vertices == 0) return

        const bytesPerFloat = 4

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)

        let aTextureCoord = shader.getAttributeLocation("aTextureCoord")
        let aColor = shader.getAttributeLocation("aColor")
        let aVertexPosition = shader.getAttributeLocation("aVertexPosition")
        let uHasTexture = shader.getUniformLocation("uHasTexture")
        let uHasColor = shader.getUniformLocation("uHasColor")
        if (aTextureCoord === null || aColor === null || aVertexPosition === null || uHasTexture === null || uHasColor === null) {
            // console.error("Failed to get shader attributes")
            return
        }

        if (this.hasTexture && this.hasColor) {
            let stride = 9
            let offset = 0

            // Texture UV
            gl.uniform1f(uHasTexture, 1)
            gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, stride * bytesPerFloat, offset)
            gl.enableVertexAttribArray(aTextureCoord)
            offset += 2

            // Color RGBA
            gl.uniform1f(uHasColor, 1)
            gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, stride * bytesPerFloat, offset * bytesPerFloat)
            gl.enableVertexAttribArray(aColor)
            offset += 4

            // Vertex XYZ
            gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, stride * bytesPerFloat, offset * bytesPerFloat)
            gl.enableVertexAttribArray(aVertexPosition)
            offset += 3
        } else if (this.hasTexture) {
            let stride = 5
            let offset = 0

            // Texture UV
            gl.uniform1f(uHasTexture, 1)
            gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, stride * bytesPerFloat, offset * bytesPerFloat)
            gl.enableVertexAttribArray(aTextureCoord)
            offset += 2

            // Color RGBA
            gl.uniform1f(uHasColor, 0)
            gl.disableVertexAttribArray(aColor)

            // Vertex XYZ
            gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, stride * bytesPerFloat, offset * bytesPerFloat)
            gl.enableVertexAttribArray(aVertexPosition)
            offset += 3
        } else if (this.hasColor) {
            let stride = 7
            let offset = 0

            // Texture UV
            gl.uniform1f(uHasTexture, 0)
            gl.disableVertexAttribArray(aTextureCoord)

            // Color RGBA
            gl.uniform1f(uHasColor, 1)
            gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, stride * bytesPerFloat, offset * bytesPerFloat)
            gl.enableVertexAttribArray(aColor)
            offset += 4

            // Vertex XYZ
            gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, stride * bytesPerFloat, offset * bytesPerFloat)
            gl.enableVertexAttribArray(aVertexPosition)
            offset += 3
        } else {
            let stride = 3
            let offset = 0

            // Texture UV
            gl.uniform1f(uHasTexture, 0)
            gl.disableVertexAttribArray(aTextureCoord)
            // Color RGBA
            gl.uniform1f(uHasColor, 0)
            gl.disableVertexAttribArray(aColor)
            // Vertex XYZ
            gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, stride * bytesPerFloat, offset * bytesPerFloat)
            gl.enableVertexAttribArray(aVertexPosition)
            offset += 3
        }

        matrix.applyUniforms()

        gl.drawArrays(gl.TRIANGLES, 0, this.vertices)
    }
}