import { Matrix } from "../../../util/Matrix";
import { Mth } from "../../../util/Mth";
import { RenderBuffer } from "../../../util/RenderBuffer";
import { Tile } from "../level/tile/Tile";
import { Tiles } from "../level/tile/Tiles";
import { gl, matrix, Minecraft, shader } from "../Minecraft";
import { Player } from "../player/Player";
import { Tesselator } from "./Tesselator";

export class ItemInHandRenderer {
    public mc: Minecraft
    public selectedTile: Tile | null = null
    public height: number = 0.0
    public oHeight: number = 0.0
    public swing: number = 0
    public isSwinging: boolean = false

    private buffer: RenderBuffer = new RenderBuffer(gl.DYNAMIC_DRAW)

    public constructor(mc: Minecraft) {
        this.mc = mc
    }

    public swing_(): void {
        this.swing = -1
        this.isSwinging = true
    }

    public place(): void {
        this.height = 0
    }

    public render(a: number): void {
        let h: number = this.oHeight + (this.height - this.oHeight) * a
        let player: Player = this.mc.player!
        
        matrix.push()
        matrix.rotate(player.xRotO + (player.xRot - player.xRotO) * a, 1.0, 0.0, 0.0)
        matrix.rotate(player.yRotO + (player.yRot - player.yRotO) * a, 0.0, 1.0, 0.0)
        this.mc.gameRenderer.setLighting(true)
        matrix.pop()

        matrix.push()
        let d: number = 0.8

        if (this.isSwinging) {
            let swing: number = (this.swing + a) / 7.0
            let swing1: number = Mth.sin(swing * Math.PI)
            let swing2: number = Mth.sin(Mth.sqrt(swing) * Math.PI)
            matrix.translate(-swing2 * 0.4, Mth.sin(Mth.sqrt(swing) * Math.PI * 2.0) * 0.2, -swing1 * 0.2)
        }

        matrix.translate(0.7 * d, -0.65 * d - (1.0 - h) * 0.6, -0.9 * d)
        matrix.rotate(45.0, 0.0, 1.0, 0.0)

        if (this.isSwinging) {
            let swing: number = (this.swing + a) / 7.0
            let swing1: number = Mth.sin(swing * swing * Math.PI)
            let swing2: number = Mth.sin(Mth.sqrt(swing) * Math.PI)
            matrix.rotate(swing2 * 80.0, 0.0, 1.0, 0.0)
            matrix.rotate(-swing1 * 20.0, 1.0, 0.0, 0.0)
        }

        let br: number = this.mc.level!.getBrightness(Math.trunc(player.x), Math.trunc(player.y), Math.trunc(player.z))
        shader.setColor(br, br, br)
        let t: Tesselator = Tesselator.instance

        if (this.selectedTile != null) {
            let scale = 0.4
            matrix.scale(scale, scale, scale)
            matrix.translate(-0.5, -0.5, -0.5)
            gl.bindTexture(gl.TEXTURE_2D, this.mc.textures.loadTexture("./terrain.png"))
            this.selectedTile.renderInHand(t, this.buffer)
        } else {
            // todo
        }

        matrix.pop()
        this.mc.gameRenderer.setLighting(false)
    }

    public tick(): void {
        this.oHeight = this.height
        if (this.isSwinging) {
            this.swing++
            if (this.swing == 7) {
                this.swing = 0
                this.isSwinging = false
            }
        }

        let player: Player = this.mc.player!
        let selected: number = player.inventory.getSelected()
        let tile: Tile | null = null
        if (selected > 0) {
            tile = Tile.tiles[selected]
        }

        let matches: boolean = tile == this.selectedTile

        let max: number = 0.4
        let tHeight: number = matches ? 1 : 0
        let dd: number = tHeight - this.height
        if (dd < -max) {
            dd = -max
        }
        if (dd > max) {
            dd = max
        }

        this.height += dd
        if (this.height < 0.1) {
            this.selectedTile = tile
        }
    }
}