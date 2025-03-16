import { Entity } from "../../Entity";
import { Level } from "../../level/Level";
import { Mob } from "../Mob";

export abstract class AI {
    public defaultLookAngle: number = 0

    public tick(level: Level, mob: Mob): void { }

    public beforeRemove(): void { }

    public hurt(entity: Entity | null, damage: number): void { }
}