import { Level } from "../level/Level";
import { Mob } from "./Mob";

export class QuadrupedMob extends Mob {
    public constructor(level: Level, x: number, y: number, z: number) {
        super(level)
        this.setSize(1.4, 1.2)
        this.setPos(x, y, z)
        this.modelName = "pig"
    }
}