import { Level } from "./GuiComponent";
import { Font } from "./Font";
import { Tesselator } from "../renderer/Tesselator";
import { gl, Minecraft } from "../Minecraft";

export class Gui extends GuiComponent {
    private minecraft: Minecraft
    private width: number
    private height: number
    public hoveredPlayer: string | null = null
    public ticks: number = 0

    public constructor(minecraft: Minecraft, w: number, h: number) {
        this.minecraft = minecraft;
        this.width = w * 240 / h;
        this.height = h * 240 / h;
    }

    public render(buffer: RenderBuffer, a: number, var2: boolean, mx: number, my: number) {
        let font = this.minecraft.font
        gl.bindTexture(gl.TEXTURE_2D, this.minecraft.textures.loadTexture("./gui/gui.png"))
        let t = Tesselator.instance
        // TODO
    }
}