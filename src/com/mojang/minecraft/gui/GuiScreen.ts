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

    protected onKeyPress(key: number): void { // No more character
    }

    protected onKeyUp(key: number): void { // No more character
        if (key == Keys.ESC) {
            this.minecraft.setScreen(null)
            this.minecraft.grabMouse()
        }
    }

    protected onMouseClick(mx: number, my: number, button: number): void {
        if (button == MouseButton.LEFT) {
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
            if (keyboard.keyJustReleased(i)) {
                this.keyboardEvent(false, i)
            }
            // keyJustReleased is not used in 0.30
        }
    }

    public mouseEvent(): void {
        console.log("Yes mouse")
        if (MouseEvents.getEventButtonState()) {
            let mx = MouseEvents.getEventX() * this.width / this.minecraft.width
            let my = this.height - MouseEvents.getEventY() * this.height / this.minecraft.height - 1
            console.log(mx, my)
            this.onMouseClick(mx, my, MouseEvents.getEventButton())
        }
    }

    public keyboardEvent(state: boolean, key: number): void {
        if (state) {
            this.onKeyPress(key)
        } else if (key >= 0) {
            this.onKeyUp(key)
        }
    }

    public tick(): void {}

    public onClose(): void {}
}