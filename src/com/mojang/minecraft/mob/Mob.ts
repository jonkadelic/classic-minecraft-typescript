import { Entity } from "../Entity";
import { Level } from "../level/Level";

export class Mob extends Entity {
    public rot: number = 0
    public timeOffs: number = 0
    public rotA: number = 0
    public speed: number = 0

    public constructor(level: Level) {
        super(level)
        this.rotA = (Math.random() + 1.0) * 0.01
        this.setPos(this.x, this.y, this.z)
        this.timeOffs = Math.random() * 1239813
        this.rot = Math.random() * Math.PI * 2
        this.speed = 1.0
        this.footSize = 0.5
    }

    public override tick(): void {
        super.tick()
    }

    public override render(a: number): void {
        // TODO?: default Mob render from 0.30
    }
}