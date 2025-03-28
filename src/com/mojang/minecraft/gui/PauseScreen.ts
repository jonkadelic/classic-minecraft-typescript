import { Screen } from "./Screen";
import { Button } from "./Button";
import { RenderBuffer } from "../../../util/RenderBuffer";
import { GenerateLevelScreen } from "./GenerateLevelScreen";
import { OptionsScreen } from "./OptionsScreen";
import { gl } from "../Minecraft";

export class PauseScreen extends Screen {

    public constructor() {
        super()
    }

    public override init2(): void {
        this.buttons.length = 0
        this.buttons.push(new Button(0, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4), "Options..."))
        this.buttons.push(new Button(1, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4) + 24, "Generate new level..."))
        this.buttons.push(new Button(2, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4) + 48, "Save level.."))
        this.buttons.push(new Button(3, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4) + 72, "Load level.."))
        this.buttons.push(new Button(4, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4) + 120, "Back to game"))
    }

    public override buttonClicked(button: Button): void {
        if (button.id == 0) {
            this.minecraft.setScreen(new OptionsScreen(this, this.minecraft.options))
        }
        if (button.id == 1) {
            this.minecraft.setScreen(new GenerateLevelScreen(this))
        }
        // if (this.minecraft.user != null) {
        // }
        if (button.id == 4) {
            this.minecraft.setScreen(null)
            this.minecraft.grabMouse()
        }
    }

    public override render(buffer: RenderBuffer, mx: number, my: number) {
        gl.colorMask(true, true, true, false)
        PauseScreen.fillGradient(buffer, 0, 0, this.width, this.height, 0x60050500, 0xA0303060)
        gl.colorMask(true, true, true, true)
        PauseScreen.drawCenteredString(this.minecraft.font, "Game menu", Math.trunc(this.width / 2), 40, 0xFFFFFF)
        super.render(buffer, mx, my)
    }
}