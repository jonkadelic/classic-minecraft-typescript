import { gl } from "./com/mojang/minecraft/Minecraft";

export class Shader {
    public static readonly FOG_MODE_LINEAR: number = 0
    public static readonly FOG_MODE_EXP: number = 1
    public static readonly FOG_MODE_EXP2: number = 2

    private program: WebGLProgram | null = null
    private attributeMap: Map<string, number> = new Map()
    private uniformMap: Map<string, WebGLUniformLocation> = new Map()

    public constructor() {
    }

    public init(vertex: string, fragment: string): void {
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

    public isLoaded(): boolean {
        return this.program != null
    }

    public use(): void {
        if (!this.program) return
        gl.useProgram(this.program)
    }

    public getAttributeLocation(name: string): number | null {
        if (!this.program) return null
        this.use()
        if (!this.attributeMap.has(name)) {
            let location = gl.getAttribLocation(this.program, name)
            if (location == -1) return null
            this.attributeMap.set(name, location)
        }
        return this.attributeMap.get(name)!
    }

    public getUniformLocation(name: string): WebGLUniformLocation | null {
        if (!this.program) return null
        this.use();
        if (!this.uniformMap.has(name)) {
            let location = gl.getUniformLocation(this.program, name)
            if (!location) return null
            this.uniformMap.set(name, location)
        }
        return this.uniformMap.get(name)!
    }

    public setColor(r: number, g: number, b: number, a: number = 1): void {
        if (!this.program) return
        gl.uniform4f(this.getUniformLocation("uColor"), r, g, b, a)
    }

    public setAlphaTest(enabled: boolean): void {
        if (!this.program) return
        gl.uniform1f(this.getUniformLocation("uAlphaTest"), enabled ? 1 : 0)
    }

    public setAlphaFunc(func: GLenum, ref: GLclampf): void {
        if (!this.program) return
        gl.uniform1f(this.getUniformLocation("uAlphaFunc"), func)
        gl.uniform1f(this.getUniformLocation("uAlphaRef"), ref)
    }

    public setFog(enabled: boolean): void {
        if (!this.program) return
        gl.uniform1f(this.getUniformLocation("uHasFog"), enabled ? 1 : 0)
    }

    public setFogMode(mode: number): void {
        if (!this.program) return
        gl.uniform1i(this.getUniformLocation("uFogMode"), mode)
    }

    public setFogColor(r: number, g: number, b: number, a: number): void {
        if (!this.program) return
        gl.uniform4f(this.getUniformLocation("uFogColor"), r, g, b, a)
    }

    public setFogDistance(start: number, end: number): void {
        if (!this.program) return
        gl.uniform2f(this.getUniformLocation("uFogPosition"), start, end)
    }

    public setFogDensity(density: number): void {
        if (!this.program) return
        gl.uniform1f(this.getUniformLocation("uFogDensity"), density)
    }

    public setLight(enabled: boolean): void {
        if (!this.program) return
        gl.uniform1f(this.getUniformLocation("uHasLight"), enabled ? 1 : 0)
    }

    public setLightPosition(x: number, y: number, z: number): void {
        if (!this.program) return
        gl.uniform3f(this.getUniformLocation("uLightPosition"), x, y, z)
    }

    public setLightAmbient(r: number, g: number, b: number, a: number): void {
        if (!this.program) return
        gl.uniform4f(this.getUniformLocation("uLightAmbient"), r, g, b, a)
    }

    public setLightDiffuse(r: number, g: number, b: number, a: number): void {
        if (!this.program) return
        gl.uniform4f(this.getUniformLocation("uLightDiffuse"), r, g, b, a)
    }

    public setSceneAmbient(r: number, g: number, b: number, a: number): void {
        if (!this.program) return
        gl.uniform4f(this.getUniformLocation("uSceneAmbient"), r, g, b, a)
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