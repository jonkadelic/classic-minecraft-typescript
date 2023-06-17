import { Random } from "../../../util/Random";
import { Mth } from "../../../util/Mth";
import { GuiComponent } from "./GuiComponent";
import { Font } from "./Font";
import { Tesselator } from "../renderer/Tesselator";
import { Tile } from "../level/tile/Tile";
import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl, matrix, shader, Minecraft } from "../Minecraft";

export class Gui extends GuiComponent {
    private minecraft: Minecraft
    private random: Random = new Random()
    public hoveredPlayer: string | null = null
    public ticks: number = 0

    public constructor(minecraft: Minecraft) {
        super()
        this.minecraft = minecraft
    }

    public render(buffer: RenderBuffer, a: number, var2: boolean, mx: number, my: number) {
        let width = this.minecraft.width * 240 / this.minecraft.height
        let height = this.minecraft.height * 240 / this.minecraft.height
        let font = this.minecraft.font
        this.minecraft.gameRenderer.setupGuiCamera()
        gl.bindTexture(gl.TEXTURE_2D, this.minecraft.textures.loadTexture("./gui/gui.png"))
        let t = Tesselator.instance
        shader.setColor(1, 1, 1, 1)
        gl.enable(gl.BLEND)
        let inv = this.minecraft.player.inventory
        this.blitOffset = -90
        this.blit(buffer, Math.trunc(width / 2) - 91, height - 22, 0, 0, 182, 22)
        this.blit(buffer, Math.trunc(width / 2) - 91 - 1 + inv.selected * 20, height - 22 - 1, 0, 22, 24, 22)
        gl.bindTexture(gl.TEXTURE_2D, this.minecraft.textures.loadTexture("./gui/icons.png"))
        this.blit(buffer, Math.trunc(width / 2) - 7, Math.trunc(height / 2) - 7, 0, 0, 16, 16)
        // let var9 = this.minecraft.player.invulnerableTime / 3 % 2 == 1
        // if (this.minecraft.player.invulnerableTime < 10) {
        //     var9 = false
        // }
        // let var10 = this.minecraft.player.health
        // let var11 = this.minecraft.player.lastHealth
        this.random.setSeed(this.ticks * 312871)
        // let var12
        // let var14
        // let var15
        // let var25
        // if (this.mc.gamemode.isSurvival()) {
        //     This is where the survival health bar code is
        // }

        gl.disable(gl.BLEND)
        for (let i: number = 0; i < inv.slots.length; ++i) {
            let x = Math.trunc(width / 2) - 90 + i * 20
            let y = height - 16
            let id = inv.slots[i]
            if (id > 0) {
                matrix.push()
                matrix.translate(x, y, -50)
                if (inv.popTime[i] > 0) {
                    let time = (inv.popTime[i] - a) / 5.0
                    let yt = -Mth.sin(time * time * Math.PI) * 8.0
                    let scX = Mth.sin(time * time * Math.PI) + 1.0
                    let scY = Mth.sin(time * Math.PI) + 1.0
                    matrix.translate(10, yt + 10, 0)
                    matrix.scale(scX, scY, 1)
                    matrix.translate(-10, -10, 0)
                }
                matrix.scale(10, 10, 10)
                matrix.translate(1, 0.5, 0)
                matrix.rotate(-30, 1, 0, 0)
                matrix.rotate(45, 0, 1, 0)
                matrix.translate(-1.5, 0.5, 0.5)
                matrix.scale(-1, -1, -1)
                let tex = this.minecraft.textures.loadTexture("./terrain.png")
                gl.bindTexture(gl.TEXTURE_2D, tex)
                t.init()
                Tile.tiles[id].renderInInventory(t)
                t.flush(buffer)
                buffer.draw()
                matrix.pop()
                if (inv.count[i] > 1) {
                    let count = "" + inv.count[i]
                    font.drawShadow(count, x + 19 - font.width(count), y + 6, 0xFFFFFF)
                }
            }
        }

        font.drawShadow(Minecraft.VERSION_STRING, 2, 2, 0xFFFFFF)
        // if(this.minecraft.options.showFrameRate) {
        //     font.drawShadow(this.minecraft.fpsString, 2, 12, 0xFFFFFF)
        // }

        // if(this.minecraft.gamemode instanceof SurvivalGameMode) {
        //     String var24 = "Score: &e" + this.minecraft.player.getScore()
        //     font.drawShadow(var24, width - font.width(var24) - 2, 2, 0xFFFFFF)
        //     font.drawShadow("Arrows: " + this.minecraft.player.arrows, Math.trunc(width / 2) + 8, height - 33, 0xFFFFFF)
        // }

        // let var26 = 10
        // let var27 = false
        // if () {
        //     var26 = 20
        //     var27 = true
        // }
        // 
        // for(let i: number = 0; i < this.chat.length && i < var26; ++i) {
        //     if(this.chat.get(i).time < 200 || var27) {
        //         font.drawShadow(this.chat.get(i).message, 2, height - 8 - i * 9 - 20, 0xFFFFFF)
        //     }
        // }

        // let w = Math.trunc(width / 2)
        // let h = Math.trunc(height / 2)
        // this.hoveredPlayer = null
        // tab list code
    }
}