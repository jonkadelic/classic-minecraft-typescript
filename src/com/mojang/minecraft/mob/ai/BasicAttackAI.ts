import { Mth } from "../../../../util/Mth";
import { Vec3 } from "../../character/Vec3";
import { Entity } from "../../Entity";
import { Mob } from "../Mob";
import { BasicAI } from "./BasicAI";

export class BasicAttackAI extends BasicAI {
    public damage: number = 6

    public override update(): void {
        super.update()
        if (this.mob != null && this.mob.health > 0) {
            this.doAttack()
        }
    }

    protected doAttack(): void {
        if (this.level == null || this.mob == null) {
            return
        }

        let player: Entity | null = this.level.getPlayer()
        
        if (this.attackTarget != null && this.attackTarget.removed) {
            this.attackTarget = null
        }

        let maxRadius: number = 16.0

        if (player != null && this.attackTarget == null) {
            let dx: number = player.x - this.mob.x
            let dy: number = player.y - this.mob.y
            let dz: number = player.z - this.mob.z
            if (dx * dx + dy * dy + dz * dz < maxRadius * maxRadius) {
                this.attackTarget = player
            }
        }

        if (this.attackTarget != null) {
            let dx: number = this.attackTarget.x - this.mob.x
            let dy: number = this.attackTarget.y - this.mob.y
            let dz: number = this.attackTarget.z - this.mob.z
            let distSq: number = dx * dx + dy * dy + dz * dz

            if (distSq > maxRadius * maxRadius * 2.0 * 2.0 && this.random.nextInt(100) == 0) {
                this.attackTarget = null
            }

            if (this.attackTarget != null) {
                let dist: number = Mth.sqrt(distSq)
                this.mob.yRot = (Math.atan2(dz, dx) * 180.0 / Math.PI) - 90.0
                this.mob.xRot = -(Math.atan2(dy, dist) * 180.0 / Math.PI)
                if (dist < 2.0 && this.attackDelay == 0) {
                    this.attack(this.attackTarget)
                }
            }
        }
    }

    public attack(entity: Entity): boolean {
        if (this.level == null || this.mob == null) {
            return false
        }

        if (this.level.clip(new Vec3(this.mob.x, this.mob.y, this.mob.z), new Vec3(entity.x, entity.y, entity.z)) != null) {
            return false
        } else {
            this.mob.attackTime = Mob.ATTACK_DURATION
            this.attackDelay = this.random.nextInt(20) + 10
            let damage: number = Math.trunc((this.random.nextFloat() + this.random.nextFloat()) / 2.0 * this.damage + 1.0)
            entity.hurt(this.mob, damage)
            this.noActionTime = 0
            return true
        }
    }

    public override hurt(entity: Entity | null, damage: number): void {
        super.hurt(entity, damage)
        // TODO arrow etc
    }
}