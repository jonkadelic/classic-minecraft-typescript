import { Keys } from "syncinput";
import { Input } from "./Input";
// import { Options } from "./Options";

export class KeyboardInput extends Input {
    private keys: boolean[] = new Array(10)
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
            this.keys[i] = state;
        }
    }

    public override releaseAllKeys(): void {
        for(let i: number = 0; i < 10; ++i) {
            this.keys[i] = false
        }
    }

    public override tick(): void {
        this.xxa = 0.0
        this.yya = 0.0
        if(this.keys[0]) {
            --this.yya
        }
  
        if(this.keys[1]) {
            ++this.yya
        }
  
        if(this.keys[2]) {
            --this.xxa
        }
  
        if(this.keys[3]) {
            ++this.xxa
        }
  
        this.jumping = this.keys[4]
    }
}