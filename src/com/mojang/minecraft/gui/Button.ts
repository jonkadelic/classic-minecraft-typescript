import { Gui } from "./Gui";
import { Font } from "./Font";
import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl, shader, Minecraft } from "../Minecraft";

export class Button extends Gui {
    public width: number
    public height: number
    public x: number
    public y: number
    public text: string
    public id: number
    public active: boolean = true
    public visible: boolean = true

    public constructor(id: number, x: number, y: number, text: string, width: number = 200, height: number = 20) {
        super()
        this.id = id
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.text = text
    }

    public render(buffer: RenderBuffer, minecraft: Minecraft, mx: number, my: number): void {
        let font: Font = minecraft.font
        gl.bindTexture(gl.TEXTURE_2D, minecraft.textures.loadTexture("./gui/gui.png", gl.NEAREST))
        shader.setColor(1, 1, 1, 1)
        let hover: number = 1
        let mouseOver: boolean = mx >= this.x && my >= this.y && mx < this.x + this.width && my < this.y + this.height
        if (!this.active) {
            hover = 0
        } else if (mouseOver) {
            hover = 2
        }

        this.image(buffer, this.x, this.y, 0, 46 + hover * 20, Math.trunc(this.width / 2), this.height)
        this.image(buffer, this.x + Math.trunc(this.width / 2), this.y, 200 - Math.trunc(this.width / 2), 46 + hover * 20, Math.trunc(this.width / 2), this.height)
        if (!this.active) {
            Button.textCentered(font, this.text, this.x + Math.trunc(this.width / 2), this.y + Math.trunc((this.height - 8) / 2), 0xFFA0A0A0)
        } else if (mouseOver) {
            Button.textCentered(font, this.text, this.x + Math.trunc(this.width / 2), this.y + Math.trunc((this.height - 8) / 2), 0xFFFFA0)
        } else {
            Button.textCentered(font, this.text, this.x + Math.trunc(this.width / 2), this.y + Math.trunc((this.height - 8) / 2), 0xE0E0E0)
        }
    }

    public hover(mx: number, my: number): boolean {
        return this.active && mx >= this.x && my >= this.y && mx < this.x + this.width && my < this.y + this.height
    }
}