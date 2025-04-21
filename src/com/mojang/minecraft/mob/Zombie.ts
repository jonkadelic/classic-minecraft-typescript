import { Level } from "../level/Level";
import { BasicAttackAI } from "./ai/BasicAttackAI";
import { HumanoidMob } from "./HumanoidMob";

export class Zombie extends HumanoidMob {
    public constructor(level: Level, x: number, y: number, z: number) {
        super(level, x, y, z)
        this.modelName = "zombie"
        this.textureName = "./mob/zombie.png"
        this.heightOffset = 1.62
        let ai = new BasicAttackAI()
        this.deathScore = 80
        ai.defaultLookAngle = 30
        ai.runSpeed = 1.0
        this.ai = ai
    }
}