import { GuiScreen } from "./GuiScreen";
import { Button } from "./Button";
import { RenderBuffer } from "../../../util/RenderBuffer";

export class PauseScreen extends GuiScreen {

    public constructor() {
        super()
    }

    public override init(): void {
        this.buttons.length = 0
        this.buttons.push(new Button(0, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4), "Options..."))
        this.buttons.push(new Button(1, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4) + 24, "Generate new level..."))
        this.buttons.push(new Button(2, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4) + 48, "Save level.."))
        this.buttons.push(new Button(3, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4) + 72, "Load level.."))
        this.buttons.push(new Button(4, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4) + 120, "Back to game"))
    }

    public override render(buffer: RenderBuffer, mx: number, my: number) {
        PauseScreen.fillGradient(buffer, 0, 0, this.width, this.height, 0x60050500, 0xA0303060)
        PauseScreen.textCentered(this.minecraft.font, "Game menu", Math.trunc(this.width / 2), 40, 0xFFFFFF)
        super.render(buffer, mx, my)
    }
}