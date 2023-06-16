import { MouseButton, Keys } from "syncinput";
import { Gui } from "./Gui";
import { Button } from "./Button";
import { Font } from "./Font";
import { mouse, keyboard, Minecraft } from "../Minecraft";
import { RenderBuffer } from "../../../util/RenderBuffer";
import { MouseEvents } from "../input/MouseEvents";
import { KeyboardEvents } from "../input/KeyboardEvents";

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
        while (KeyboardEvents.next()) {
            this.keyboardEvent()
        }
    }

    public mouseEvent(): void {
        if (MouseEvents.getEventButtonState()) {
            let mx = Math.trunc(MouseEvents.getEventX() * this.width / this.minecraft.width)
            let my = Math.trunc(MouseEvents.getEventY() * this.height / this.minecraft.height)
            this.onMouseClick(mx, my, MouseEvents.getEventButton())
        }
    }

    public keyboardEvent(): void {
        if (KeyboardEvents.getEventKeyState()) {
            this.onKeyPress(KeyboardEvents.getEventKey())
        } else {
            this.onKeyUp(KeyboardEvents.getEventKey())
        }
    }

    public tick(): void {}

    public onClose(): void {}
}