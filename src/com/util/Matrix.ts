import { mat4 } from "gl-matrix";

export class Matrix {
    public static readonly MODELVIEW = 0
    public static readonly PROJECTION = 1

    private modelviewStack: mat4[] = []
    private projectionStack: mat4[] = []
    private activeStack: mat4[] = this.modelviewStack

    public constructor() {
        this.modelviewStack.push(mat4.create())
        this.projectionStack.push(mat4.create())
        this.activeStack = this.modelviewStack
    }

    public setActive(stack: number): void {
        this.activeStack = stack == Matrix.MODELVIEW ? this.modelviewStack : this.projectionStack
    }

    public peek(): mat4 {
        return this.activeStack[this.activeStack.length - 1]
    }

    public loadIdentity(): void {
        mat4.identity(this.peek())
    }

    public push(): void {
        this.activeStack.push(mat4.clone(this.peek()))
    }

    public pop(): void {
        if (this.activeStack.length == 1) throw new Error("Invalid matrix stack pop.")
        this.activeStack.pop()
    }

    public load(matrix: mat4): void {
        mat4.copy(this.peek(), matrix)
    }

    public translate(x: number, y: number, z: number): void {
        mat4.translate(this.peek(), this.peek(), [x, y, z])
    }

    public rotate(angle: number, x: number, y: number, z: number): void {
        mat4.rotate(this.peek(), this.peek(), angle * Math.PI / 180, [x, y, z])
    }

    public perspective(fov: number, aspect: number, near: number, far: number): void {
        mat4.perspective(this.peek(), fov * Math.PI / 180, aspect, near, far)
    }

    public getFloat(stack: number): number[] {
        let matrixStack = stack == Matrix.MODELVIEW ? this.modelviewStack : this.projectionStack
        let matrix = matrixStack[matrixStack.length - 1]
        let floatArray = new Array(16)
        for (let i = 0; i < 16; i++) {
            floatArray[i] = matrix[i]
        }
        return floatArray
    }
}