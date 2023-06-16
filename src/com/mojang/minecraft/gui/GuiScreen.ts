import { MouseButton, Keys } from "syncinput";
import { Gui } from "./Gui";
import { Button } from "./Button";
import { Font } from "./Font";
import { mouse, keyboard, Minecraft } from "../Minecraft";
import { RenderBuffer } from "../../../util/RenderBuffer";
import { MouseEvents } from "../input/MouseEvents";

export class GuiScreen extends Gui {
    // @ts-ignore
    protected minecraft: Minecraft
    protected width: number = 0
    protected height: number = 0
    protected buttons: Button[] = []
    public grabsMouse: boolean = false
    // @ts-ignore
    protected font: Font

    public constructor() {
        super()
    }

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
                    this.onButtonClick(button)
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
        while (MouseEvents.next()) {
            this.mouseEvent()
        }
        for (let i: number = 0; i < keyboard.keys.length; ++i) {
            if (keyboard.keyJustPressed(i)) {
                this.keyboardEvent(true, i)
            }
            // keyJustReleased is not used in 0.30
        }
    }

    public mouseEvent(): void {
        if (MouseEvents.getEventButtonState()) {
            let mx = MouseEvents.getEventX() * this.width / this.minecraft.width;
            let my = this.height - MouseEvents.getEventY() * this.height / this.minecraft.height - 1;
            this.onMouseClick(mx, my, MouseEvents.getEventButton());
        }
    }

    public keyboardEvent(state: boolean, key: number): void {
        if (state) {
            
        }
    }

    public tick(): void {}

    public onClose(): void {}
}