import { Entity } from "../Entity";
import { Item } from "../item/Item";
import { Level } from "../level/Level";
import { Tiles } from "../level/tile/Tiles";
import { QuadrupedMob } from "./QuadrupedMob";

export class Pig extends QuadrupedMob {
    public constructor(level: Level, x: number, y: number, z: number) {
        super(level, x, y, z)
        this.heightOffset = 1.72
        this.modelName = "pig"
        this.textureName = "./mob/pig.png"
    }

    public override die(killer: Entity | null): void {
        if (killer != null) {
            killer.awardKillScore(this, 10)
        }

        let drops = Math.trunc(Math.random() + Math.random() + 1.0)

        for (let i = 0; i < drops; i++) {
            this.level.addEntity(new Item(this.level, this.x, this.y, this.z, Tiles.mushroom1.id))
        }

        super.die(killer)
    }
}