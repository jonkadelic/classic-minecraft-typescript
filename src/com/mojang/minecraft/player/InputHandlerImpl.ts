import { Keys } from "syncinput";
import { InputHandler } from "./InputHandler";
// import { Options } from "./Options";

export class InputHandlerImpl extends InputHandler {
    private keyStates: boolean[] = new Array(10)
    // private options: Options

    public constructor() { // options: Options
        super()
       // this.options = options
    }

    public override setKeyState(key: number, state: boolean): void {
        let i: number = -1
        if (key == Keys.W) { // this.settings.keyUp.key
            i = 0
        }

        if (key == Keys.S) { // this.settings.keyDown.key
            i = 1
        }

        if (key == Keys.A) { // this.settings.keyLeft.key
            i = 2
        }

        if (key == Keys.D) { // this.settings.keyRight.key
            i = 3
        }

        if (key == Keys.SPACEBAR) { // this.settings.keyJump.key
            i = 4
        }

        if (i >= 0) {
            this.keyStates[i] = state;
        }
    }

    public override resetKeys(): void {
        for(let i: number = 0; i < 10; ++i) {
            this.keyStates[i] = false
        }
    }

    public override updateMovement(): void {
        this.xxa = 0.0
        this.yya = 0.0
        if(this.keyStates[0]) {
            --this.yya
        }
  
        if(this.keyStates[1]) {
            ++this.yya
        }
  
        if(this.keyStates[2]) {
            --this.xxa
        }
  
        if(this.keyStates[3]) {
            ++this.xxa
        }
  
        this.jumping = this.keyStates[4]
    }
}