import { MouseButton } from "syncinput";
import { gl } from "../Minecraft";
import { Screen } from "./Screen";
import { Button } from "./Button";
import { Tesselator } from "../renderer/Tesselator";
import { RenderBuffer } from "../../../util/RenderBuffer";

export class SelectBlockScreen extends Screen {

    public constructor() {
        super()
        this.passEvents = true
    }

    private getBlockOnScreen(mx: number, my: number): number {
        // TODO
        return -1
    }

    public override render(buffer: RenderBuffer, mx: number, my: number) {
        let block = this.getBlockOnScreen(mx, my)
        SelectBlockScreen.fillGradient(buffer, Math.trunc(this.width / 2) - 120, 30, Math.trunc(this.width / 2) + 120, 180, 0x90050500, 0xC0303060)
        if (block >= 0) {
            let x = Math.trunc(this.width / 2) + block % 9 * 24 + -108
            let y = Math.trunc(this.height / 2) + Math.trunc(block / 9) * 24 + -60
            SelectBlockScreen.fillGradient(buffer, x - 3, y - 8, x + 23, y + 24 - 6, 0x90FFFFFF, 0xC0FFFFFF)
        }
        SelectBlockScreen.drawCenteredString(this.minecraft.font, "Select block", Math.trunc(this.width / 2), 40, 0xFFFFFF)
        let textures = this.minecraft.textures
        let t = Tesselator.instance
        let tex = textures.loadTexture("./terrain.png", gl.NEAREST)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        // TODO: render the blocks
        super.render(buffer, mx, my)
    }

    protected override mouseClicked(mx: number, my: number, eventButton: number): void {
        if (eventButton == MouseButton.LEFT) {
            // TODO: pick block
            this.minecraft.setScreen(null)
        }
    }
}