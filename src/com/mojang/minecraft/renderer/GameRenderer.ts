import { gl, matrix, Minecraft } from "../Minecraft";

export class GameRenderer {
    private minecraft: Minecraft

    public constructor(minecraft: Minecraft) {
        this.minecraft = minecraft
    }

    public setupGuiCamera(): void {
        let screenWidth = this.minecraft.width * 240 / this.minecraft.height
        let screenHeight = this.minecraft.height * 240 / this.minecraft.height
        gl.clear(gl.DEPTH_BUFFER_BIT)
        matrix.setActive(Matrix.PROJECTION)
        matrix.loadIdentity()
        matrix.ortho(0, screenWidth, screenHeight, 0, 100, 300)
        matrix.setActive(Matrix.MODELVIEW)
        matrix.loadIdentity()
        matrix.translatef(0, 0, -200)
    }

    // TODO
}