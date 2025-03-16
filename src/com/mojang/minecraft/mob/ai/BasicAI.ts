import { Random } from "../../../../util/Random";
import { Entity } from "../../Entity";
import { Level } from "../../level/Level";
import { Mob } from "../Mob";
import { AI } from "./AI";

export class BasicAI extends AI {
    public random: Random = new Random()
    public xxa: number = 0
    public yya: number = 0
    protected yRotA: number = 0
    public level: Level | null = null
    public mob: Mob | null = null
    public jumping: boolean = false
    protected attackDelay: number = 0
    public runSpeed: number = 0.7
    public noActionTime: number = 0
    public attackTarget: Entity | null = null

    public override tick(level: Level, mob: Mob): void {
        let player: Entity | null = level.getPlayer()

        this.noActionTime++
        if (this.noActionTime > 600 && this.random.nextInt(800) == 0 && player != null) {
            let dx = player.x - mob.x
            let dy = player.y - mob.y
            let dz = player.z - mob.z
            let distSqr = dx * dx + dy * dy + dz * dz
            if (distSqr < 1024.0) {
                this.noActionTime = 0
            } else {
                mob.remove()
            }
        }

        this.level = level
        this.mob = mob
        if (this.attackDelay > 0) {
            this.attackDelay--
        }
        if (mob.health <= 0) {
            this.jumping = false
            this.xxa = 0
            this.yya = 0
            this.yRotA = 0
        } else {
            this.update()
        }

        let isInWater: boolean = mob.isInWater()
        let isInLava: boolean = mob.isInLava()
        if (this.jumping) {
            if (isInWater) {
                mob.yd += 0.04
            } else if (isInLava) {
                mob.yd += 0.04
            } else if (mob.onGround) {
                this.jumpFromGround()
            }
        }

        this.xxa *= 0.98
        this.yya *= 0.98
        this.yRotA *= 0.9
        mob.travel(this.xxa, this.yya)
        let touchingEntities: Entity[] | null = level.findEntities(mob, mob.bb.grow(0.2, 0.0, 0.2))
        if (touchingEntities != null && touchingEntities.length > 0) {
            for (let i: number = 0; i < touchingEntities.length; i++) {
                let entity: Entity = touchingEntities[i]

                if (entity.isPushable()) {
                    entity.push_(mob)
                }
            }
        }
    }

    protected jumpFromGround(): void {
        if (this.mob != null) {
            this.mob.yd = 0.42
        }
    }

    public update(): void {
        if (this.random.nextFloat() < 0.07) {
            this.xxa = (this.random.nextFloat() - 0.5) * this.runSpeed
            this.yya = this.random.nextFloat() * this.runSpeed
        }

        this.jumping = this.random.nextFloat() < 0.01
        if (this.random.nextFloat() < 0.04) {
            this.yRotA = (this.random.nextFloat() - 0.5) * 60.0
        }

        if (this.mob != null) {
            this.mob.yRot = this.mob.yRot + this.yRotA
            this.mob.xRot = this.defaultLookAngle
        }

        if (this.attackTarget != null) {
            this.yya = this.runSpeed
            this.jumping = this.random.nextFloat() < 0.04
        }

        if (this.mob != null) {
            let isInWater: boolean = this.mob.isInWater()
            let isInLava: boolean = this.mob.isInLava()

            if (isInWater || isInLava) {
                this.jumping = this.random.nextFloat() < 0.8
            }
        }
    }

    public override beforeRemove(): void {

    }

    public override hurt(entity: Entity | null, damage: number): void {
        super.hurt(entity, damage)
        this.noActionTime = 0
    }
}