import { RenderBuffer } from "../../../util/RenderBuffer";
import { Button } from "./Button";
import { GuiComponent } from "./GuiComponent";
import { Screen } from "./Screen"

export class GenerateLevelScreen extends Screen {
    private parent: Screen

    public constructor(parent: Screen) {
        super()
        this.parent = parent
    }

    public override init2(): void {
        this.buttons.length = 0
        this.buttons.push(new Button(0, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4) + 0, "Small"))
        this.buttons.push(new Button(1, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4) + 24, "Normal"))
        this.buttons.push(new Button(2, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4) + 48, "Huge"))
        this.buttons.push(new Button(3, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 4) + 120, "Cancel"))
    }

    protected override buttonClicked(button: Button): void {
        if (button.id == 3) {
            this.minecraft.setScreen(this.parent)
            return
        }

        // TODO
        this.minecraft.level.regenerate()
        this.minecraft.player.resetPos()

        this.minecraft.setScreen(null)
        this.minecraft.grabMouse()
    }

    public override render(buffer: RenderBuffer, mx: number, my: number): void {
        GuiComponent.fillGradient(buffer, 0, 0, this.width, this.height, 0x60050500, 0xA0303060)
        GuiComponent.drawCenteredString(this.font, "Generate new level", Math.trunc(this.width / 2), 40, 0xFFFFFF)
        super.render(buffer, mx, my)
    }
}