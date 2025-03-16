import { Input } from "./Input";
import { Options } from "../Options";

export class KeyboardInput extends Input {
    public static readonly KEY_UP: number = 0
    public static readonly KEY_DOWN: number = 1
    public static readonly KEY_LEFT: number = 2
    public static readonly KEY_RIGHT: number = 3
    public static readonly KEY_JUMP: number = 4

    private keys: boolean[] = new Array(10)
    private options: Options

    public constructor(options: Options) {
        super()
        this.options = options
    }

    public override setKeyState(key: string, state: boolean): void {
        let i: number = -1
        if (key == this.options.keyUp.defaultKey) {
            i = KeyboardInput.KEY_UP
        }

        if (key == this.options.keyDown.defaultKey) {
            i = KeyboardInput.KEY_DOWN
        }

        if (key == this.options.keyLeft.defaultKey) {
            i = KeyboardInput.KEY_LEFT
        }

        if (key == this.options.keyRight.defaultKey) {
            i = KeyboardInput.KEY_RIGHT
        }

        if (key == this.options.keyJump.defaultKey) {
            i = KeyboardInput.KEY_JUMP
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
        if(this.keys[KeyboardInput.KEY_UP]) {
            --this.yya
        }
  
        if(this.keys[KeyboardInput.KEY_DOWN]) {
            ++this.yya
        }
  
        if(this.keys[KeyboardInput.KEY_LEFT]) {
            --this.xxa
        }
  
        if(this.keys[KeyboardInput.KEY_RIGHT]) {
            ++this.xxa
        }
  
        this.jumping = this.keys[KeyboardInput.KEY_JUMP]
    }
}