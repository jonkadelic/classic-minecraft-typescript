import { MouseButton } from "syncinput";
import { gl, matrix } from "../Minecraft";
import { Screen } from "./Screen";
import { Button } from "./Button";
import { Tesselator } from "../renderer/Tesselator";
import { RenderBuffer } from "../../../util/RenderBuffer";
import { User } from "../User";
import { Tiles } from "../level/tile/Tiles";
import { Tile } from "../level/tile/Tile";

export class SelectBlockScreen extends Screen {

    public constructor() {
        super()
        this.passEvents = true
    }

    private getTileAt(mx: number, my: number): number {
        for (let i = 0; i < User.tiles.length; i++) {
            let x = Math.trunc(this.width / 2) + i % 9 * 24 + -108 - 3
            let y = Math.trunc(this.height / 2) + Math.trunc(i / 9) * 24 + -60 + 3
            if (mx >= x && mx <= x + 24 && my >= y - 12 && my <= y + 12) {
                return i
            }
        }
        return -1
    }

    public override render(buffer: RenderBuffer, mx: number, my: number) {
        let hoveredTileIndex = this.getTileAt(mx, my)
        SelectBlockScreen.fillGradient(buffer, Math.trunc(this.width / 2) - 120, 30, Math.trunc(this.width / 2) + 120, 180, 0x90050500, 0xC0303060)
        if (hoveredTileIndex >= 0) {
            let x = Math.trunc(this.width / 2) + hoveredTileIndex % 9 * 24 + -108
            let y = Math.trunc(this.height / 2) + Math.trunc(hoveredTileIndex / 9) * 24 + -60
            SelectBlockScreen.fillGradient(buffer, x - 3, y - 8, x + 23, y + 24 - 6, 0x90FFFFFF, 0xC0FFFFFF)
        }
        SelectBlockScreen.drawCenteredString(this.minecraft.font, "Select block", Math.trunc(this.width / 2), 40, 0xFFFFFF)
        let textures = this.minecraft.textures
        let t = Tesselator.instance
        let tex = textures.loadTexture("./terrain.png")
        gl.bindTexture(gl.TEXTURE_2D, tex)
        for (let i = 0; i < User.tiles.length; i++) {
            let cTile = User.tiles[i]
            if (cTile == null) continue
            matrix.push()
            matrix.translate(Math.trunc(this.width / 2) + i % 9 * 24 - 108, Math.trunc(this.height / 2) + Math.trunc(i / 9) * 24 + -60, 0)
            matrix.scale(10, 10, 10)
            matrix.translate(1, 0.5, 8)
            matrix.rotate(-30, 1, 0, 0)
            matrix.rotate(45, 0, 1, 0)
            if (hoveredTileIndex == i) {
                matrix.scale(1.6, 1.6, 1.6)
            }
            matrix.translate(-1.5, 0.5, 0.5)
            matrix.scale(-1, -1, -1)
            t.init()
            cTile.renderInInventory(t)
            t.flush(buffer)
            buffer.draw()
            matrix.pop()
        }
    }

    protected override mouseClicked(mx: number, my: number, eventButton: number): void {
        if (eventButton == MouseButton.LEFT) {
            // TODO: inventory
            let tile = User.tiles[this.getTileAt(mx, my)]
            if (tile != null) {
                this.minecraft.paintTexture = tile.id
            }
            this.minecraft.setScreen(null)
        }
    }
}