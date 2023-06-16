import { Gui } from "./Gui";
import { Button } from "./Button";
import { Font } from "./Font";
import { Minecraft } from "../Minecraft";
import { RenderBuffer } from "../../../util/RenderBuffer";

export class GuiScreen extends Gui {
    protected minecraft: Minecraft
    protected width: number
    protected height: number
    protected buttons: Button[] = []
    public grabsMouse: boolean = false
    protected font: Font

    public render(buffer: RenderBuffer, mx: number, my: number): void {
        for (let i: number = 0; i < this.buttons.length; ++i) {
            let button: Button = this.buttons[i]
            button.render(buffer, this.minecraft, mx, my)
        }
    }

    protected onKeyPress(char: string, key: number): void {
        if (key == 1) {
            this.minecraft.setScreen(null)
            this.minecraft.grabMouse()
        }
    }

    protected onMouseClick(mx: number, my: number, button: number): void {
        if (button == 0) {
            for (let i: number = 0; i < this.buttons.length; ++i) {
                let button: Button = this.buttons[i]
                if (button.hover(mx, my)) {
                    this.clickButton(button)
                }
            }
        }
    }

    protected onButtonClick(button: Button): void {}

    public open(minecraft: Minecraft, w: number, h: number): void {
        this.minecraft = minecraft
        this.font = minecraft.font
        this.width = w
        this.height = h
        this.init()
    }

    public init(): void {}

    public doInput(): void {
        // TODO
    }

    public mouseEvent(): void {
        // TODO
    }

    public keyboardEvent(): void {
        // TODO
    }

    public tick(): void {}

    public onClose(): void {}
}