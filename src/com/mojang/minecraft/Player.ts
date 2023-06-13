import { Keys } from "syncinput";
import { Entity } from "./Entity";
import { keyboard } from "./Minecraft";
import { Level } from "./level/Level";

export class Player extends Entity {
    public constructor(level: Level) {
        super(level)
        this.heightOffset = 1.62
    }

    public tick(): void {
        this.xo = this.x
        this.yo = this.y
        this.zo = this.z
        let xa = 0.0
        let ya = 0.0

        if (keyboard.keyPressed(Keys.R)) {
            this.resetPos()
        }
        if (keyboard.keyPressed(Keys.W) || keyboard.keyPressed(Keys.UP)) {
            ya--
        }
        if (keyboard.keyPressed(Keys.S) || keyboard.keyPressed(Keys.DOWN)) {
            ya++
        }
        if (keyboard.keyPressed(Keys.A) || keyboard.keyPressed(Keys.LEFT)) {
            xa--
        }
        if (keyboard.keyPressed(Keys.D) || keyboard.keyPressed(Keys.RIGHT)) {
            xa++
        }
        if (keyboard.keyPressed(Keys.SPACEBAR) && this.onGround) {
            this.yd = 0.5
        }
        this.moveRelative(xa, ya, this.onGround ? 0.1 : 0.02)
        this.yd = this.yd - 0.08
        this.move(this.xd, this.yd, this.zd)
        this.xd *= 0.91
        this.yd *= 0.98
        this.zd *= 0.91
        if (this.onGround) {
            this.xd *= 0.7
            this.zd *= 0.7
        }
    }
}