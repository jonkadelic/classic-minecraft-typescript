import { BasicAttackAI } from "./BasicAttackAI";

export class JumpAttackAI extends BasicAttackAI {
    public constructor() {
        super()
        this.runSpeed *= 0.8
    }

    protected override jumpFromGround(): void {
        if (this.attackTarget == null) {
            this.jumpFromGround()
        } else if (this.mob != null) {
            this.mob.xd = 0.0
            this.mob.zd = 0.0
            this.mob.moveRelative(0.0, 1.0, 0.6)
            this.mob.yd = 0.5
        }
    }
}