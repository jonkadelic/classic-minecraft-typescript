import { MouseButton } from "syncinput";
import { gl } from "../Minecraft";
import { GuiScreen } from "./GuiScreen";
import { Button } from "./Button";
import { RenderBuffer } from "../../../util/RenderBuffer";

export class BlockSelectScreen extends GuiScreen {

    public constructor() {
        super()
        this.grabsMouse = true
    }

    private getBlockOnScreen(mx: number, my: number): number {
        // TODO
        return -1
    }

    public override render(buffer: RenderBuffer, mx: number, my: number) {
        let block = this.getBlockOnScreen(mx, my)
        BlockSelectScreen.fillGradient(buffer, Math.trunc(this.width / 2) - 120, 30, Math.trunc(this.width / 2) + 120, 180, 0x90050500, 0xC0303060)
        if (block >= 0) {
            let x = Math.trunc(this.width / 2) + var1 % 9 * 24 + -108;
            let y = Math.trunc(this.height / 2) + Math.trunc(var1 / 9) * 24 + -60;
            drawFadingBox(x - 3, y - 8, z + 23, y + 24 - 6, 0x90FFFFFF, 0xC0FFFFFF);
        }
        BlockSelectScreen.textCentered(this.minecraft.font, "Select block", Math.trunc(this.width / 2), 40, 0xFFFFFF)
        let textures = this.minecraft.textures
        let t = Tesselator.instance
        let tex = textures.loadTexture("./terrain.png", gl.NEAREST)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        // TODO: render the blocks
        super.render(buffer, mx, my)
    }

    protected override onMouseClick(mx: number, my: number, button: number): void {
        if (button == MouseButton.LEFT) {
            // TODO: pick block
            this.minecraft.setScreen(null)
        }
    }
}