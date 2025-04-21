import { Level } from "../level/Level";
import { JumpAttackAI } from "./ai/JumpAttackAI";
import { QuadrupedMob } from "./QuadrupedMob"

export class Spider extends QuadrupedMob {
    public constructor(level: Level, x: number, y: number, z: number) {
        super(level, x, y, z)
        this.heightOffset = 0.72
        this.modelName = "spider"
        this.textureName = "./mob/spider.png"
        this.setSize(1.4, 0.9)
        this.setPos(x, y, z)
        this.deathScore = 105
        this.bobStrength = 0.0
        this.ai = new JumpAttackAI()
    }
}