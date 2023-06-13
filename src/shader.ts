import { gl } from "./com/mojang/minecraft/Minecraft";

export class Shader {
    private program: WebGLProgram
    private attributeMap: Map<string, number> = new Map()
    private uniformMap: Map<string, WebGLUniformLocation> = new Map()

    public constructor(vertex: string, fragment: string) {
        let vertexShader = this.loadShader(gl.VERTEX_SHADER, vertex)
        let fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fragment)
        let program = gl.createProgram()
        if (!program) throw new Error("Failed to create shader program")
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error("Failed to link shader program: " + gl.getProgramInfoLog(program))
        }
        this.program = program
        console.log("Loaded shader program")
    }

    public use(): void {
        gl.useProgram(this.program)
    }

    public getAttributeLocation(name: string): number {
        if (!this.attributeMap.has(name)) {
            let location = gl.getAttribLocation(this.program, name)
            if (location == -1) throw new Error("Failed to get attribute location: " + name)
            this.attributeMap.set(name, location)
        }
        return this.attributeMap.get(name)!
    }

    public getUniformLocation(name: string): WebGLUniformLocation {
        if (!this.uniformMap.has(name)) {
            let location = gl.getUniformLocation(this.program, name)
            if (!location) throw new Error("Failed to get uniform location: " + name)
            this.uniformMap.set(name, location)
        }
        return this.uniformMap.get(name)!
    }

    private loadShader(type: number, source: string): WebGLShader {
        let shader = gl.createShader(type)
        if (!shader) throw new Error("Failed to create shader")
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error("Failed to compile shader: " + gl.getShaderInfoLog(shader))
        }
        return shader
    }
}