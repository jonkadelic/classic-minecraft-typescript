import { MouseButton, Keys } from "syncinput";
import { GuiComponent } from "./GuiComponent";
import { Button } from "./Button";
import { Font } from "./Font";
import { mouse, keyboard, Minecraft } from "../Minecraft";
import { RenderBuffer } from "../../../util/RenderBuffer";
import { MouseEvents } from "../input/MouseEvents";
import { KeyboardEvents } from "../input/KeyboardEvents";

export class Screen extends GuiComponent {
    // @ts-ignore
    protected minecraft: Minecraft
    protected width: number = 0
    protected height: number = 0
    protected buttons: Button[] = []
    public passEvents: boolean = false
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

    protected mouseClicked(mx: number, my: number, eventButton: number): void {
        if (eventButton == MouseButton.LEFT) {
            for (let i: number = 0; i < this.buttons.length; ++i) {
                let button: Button = this.buttons[i]
                if (button.hover(mx, my)) {
                    this.buttonClicked(button)
                }
            }
        }
    }

    protected buttonClicked(button: Button): void {}

    public init(minecraft: Minecraft, width: number, height: number): void {
        this.minecraft = minecraft
        this.font = minecraft.font
        this.width = width
        this.height = height
        this.init2()
    }

    public init2(): void {}

    public updateEvents(): void {
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
            this.mouseClicked(mx, my, MouseEvents.getEventButton())
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

    public removed(): void {}
}