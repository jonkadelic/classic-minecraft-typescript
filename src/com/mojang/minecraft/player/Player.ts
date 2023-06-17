import { Keys } from "syncinput";
import { Mob } from "../mob/Mob";
import { keyboard } from "../Minecraft";
import { Level } from "../level/Level";
import { Input } from "./Input";
import { Inventory } from "./Inventory";

export class Player extends Mob {
    public input: Input | null = null
    public inventory: Inventory = new Inventory()

    public constructor(level: Level) {
        super(level)
        this.heightOffset = 1.62
        this.footSize = 0.5
    }

    public override tick(): void {
        this.xo = this.x
        this.yo = this.y
        this.zo = this.z
        this.inventory.tick()
        if (this.input != null) {
            this.input.tick()
            let xa = this.input.xxa
            let ya = this.input.yya
            let jump = this.input.jumping

            if (keyboard.keyPressed(Keys.R)) {
                this.resetPos()
            }
            if (jump && this.onGround) {
                this.yd = 0.42
            }
            this.moveRelative(xa, ya, this.onGround ? 0.1 : 0.02)
        }
        this.move(this.xd, this.yd, this.zd)
        this.xd *= 0.91
        this.yd *= 0.98
        this.zd *= 0.91
        this.yd -= 0.08
        if (this.onGround) {
            this.xd *= 0.6
            this.zd *= 0.6
        }
    }

    public releaseAllKeys(): void {
        if (this.input == null) return
        this.input.releaseAllKeys()
    }

    public setKey(key: number, state: boolean): void {
        if (this.input == null) return
        this.input.setKeyState(key, state)
    }

    public addResource(id: number): boolean {
        return this.inventory.addResource(id)
    }
}