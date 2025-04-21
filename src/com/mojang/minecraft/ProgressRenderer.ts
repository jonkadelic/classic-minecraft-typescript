import { Matrix } from "../../util/Matrix";
import { ProgressListener } from "../../util/ProgressListener";
import { RenderBuffer } from "../../util/RenderBuffer";
import { gl, matrix, Minecraft } from "./Minecraft";
import { Tesselator } from "./renderer/Tesselator";
import { StopGameError } from "./StopGameError";

export class ProgressRenderer implements ProgressListener {
    private status: string = ""
    private minecraft: Minecraft
    private title: string = ""
    private i: number = -1

    public shouldDisplay: boolean = false

    private buffer: RenderBuffer = new RenderBuffer()

    public constructor(minecraft: Minecraft) {
        this.minecraft = minecraft
    }

    public render(): void {
        let screenWidth = Math.trunc(this.minecraft.width * 240 / this.minecraft.height)
        let screenHeight = Math.trunc(this.minecraft.height * 240 / this.minecraft.height)

        gl.clear(gl.DEPTH_BUFFER_BIT)
        matrix.setActive(Matrix.PROJECTION)
        matrix.loadIdentity()
        matrix.ortho(0.0, screenWidth, screenHeight, 0.0, 100.0, 300.0)
        matrix.setActive(Matrix.MODELVIEW)
        matrix.loadIdentity()
        matrix.translate(0.0, 0.0, -200.0)

        console.log("draw")

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        let t = Tesselator.instance
        let id = this.minecraft.textures.loadTexture("./dirt.png")
        gl.bindTexture(gl.TEXTURE_2D, id)
        let s = 32.0

        t.begin()
        t.color_i(0x404040)
        t.vertexUV(0.0, screenHeight, 0.0, 0.0, screenHeight / s)
        t.vertexUV(screenWidth, screenHeight, 0.0, screenWidth / s, screenHeight / s)
        t.vertexUV(screenWidth, 0.0, 0.0, screenWidth / s, 0.0)
        t.vertexUV(0.0, 0.0, 0.0, 0.0, 0.0)
        t.end(this.buffer)
        this.buffer.draw()

        if (this.i >= 0) {
            let w = 100
            let h = 2
            let x = screenWidth / 2 - w / 2
            let y = screenHeight / 2 + 16

            t.begin()
            t.color_i(0x808080)
            t.vertex(x, y, 0.0)
            t.vertex(x, y + h, 0.0)
            t.vertex(x + w, y + h, 0.0)
            t.vertex(x + w, y, 0.0)
            t.color_i(0x80FF80)
            t.vertex(x, y, 0.0)
            t.vertex(x, y + h, 0.0)
            t.vertex(x + this.i, y + h, 0.0)
            t.vertex(x + this.i, y, 0.0)
            t.end(this.buffer)
            this.buffer.draw()
        }

        this.minecraft.font.drawShadow(
            this.title, 
            Math.trunc((screenWidth - this.minecraft.font.width(this.title)) / 2),
            Math.trunc(screenHeight / 2) - 4 - 16, 
            0xFFFFFF
        )
        this.minecraft.font.drawShadow(
            this.status,
            Math.trunc((screenWidth - this.minecraft.font.width(this.title)) / 2),
            Math.trunc(screenHeight / 2) - 4 + 8,
            0xFFFFFF
        )    
    }

    public progressStart(title: string): void {
        if (!this.minecraft.running) {
            throw new StopGameError()
        } else {
            this.title = title
            this.shouldDisplay = true
        }
    }

    public progressStage(status: string): void {
        if (!this.minecraft.running) {
            throw new StopGameError()
        } else {
            this.status = status
            this.progressStagePercentage(-1)
        }
    }

    public progressStagePercentage(i: number): void {
        if (!this.minecraft.running) {
            throw new StopGameError()
        } else {
            this.i = i
        }
    }
}