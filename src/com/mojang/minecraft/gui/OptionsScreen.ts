import { RenderBuffer } from "../../../util/RenderBuffer";
import { Options } from "../Options";
import { Button } from "./Button";
import { GuiComponent } from "./GuiComponent";
import { Screen } from "./Screen";
import { SmallButton } from "./SmallButton";

export class OptionsScreen extends Screen {
    private parent: Screen
    private title: string = "Options"
    private options: Options

    public constructor(parent: Screen, options: Options) {
        super()
        this.parent = parent
        this.options = options
    }

    public override init2(): void {
        for (let i = 0; i < this.options.numOptions; i++) {
            this.buttons.push(new SmallButton(i, Math.trunc(this.width / 2) - 155 + i % 2 * 160, Math.trunc(this.height / 6) + + 24 * (i >> 1), this.options.getOption(i)))
        }
        this.buttons.push(new Button(100, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 6) + 120 + 12, "Controls..."))
        this.buttons.push(new Button(200, Math.trunc(this.width / 2) - 100, Math.trunc(this.height / 6) + 168, "Done"))
    }

    public override buttonClicked(button: Button): void {
        if (!button.active) {
            return
        }
        if (button.id < 100) {
            this.options.set(button.id, 1)
            button.message = this.options.getOption(button.id)
        }
        if (button.id == 100) {
            // this.minecraft.setScreen(new ControlsScreen(this, this.options))
        }
        if (button.id == 200) {
            this.minecraft.setScreen(this.parent)
        }
    }

    public override render(buffer: RenderBuffer, mx: number, my: number): void {
        GuiComponent.fillGradient(buffer, 0, 0, this.width, this.height, 0x60050500, 0xA0303060)
        GuiComponent.drawCenteredString(this.font, this.title, Math.trunc(this.width / 2), 20, 0xFFFFFF)
        super.render(buffer, mx, my)
    }
}