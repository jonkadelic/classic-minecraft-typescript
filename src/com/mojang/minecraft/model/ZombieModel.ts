import { Mth } from "../../../util/Mth";
import { HumanoidModel } from "./HumanoidModel";

export class ZombieModel extends HumanoidModel {
    public override setupAnim(time: number, r: number, bob: number, yRot: number, xRot: number, scale: number): void {
        super.setupAnim(time, r, bob, yRot, xRot, scale)

        time = Mth.sin(this.attackTime)
        r = Mth.sin((1.0 - (1.0 - this.attackTime) * (1.0 - this.attackTime)) * Math.PI)

        this.arm0.zRot = 0.0
        this.arm1.zRot = 0.0

        this.arm0.yRot = -(0.1 - time * 0.6)
        this.arm1.yRot = 0.1 - time * 0.6

        this.arm0.xRot = -Math.PI / 2
        this.arm1.xRot = -Math.PI / 2

        this.arm0.xRot -= time * 1.2 - r * 0.4
        this.arm1.xRot -= time * 1.2 - r * 0.4

        this.arm0.zRot = this.arm0.zRot + Mth.cos(bob * 0.09) * 0.05 + 0.05
        this.arm1.zRot - (Mth.cos(bob * 0.09) * 0.05 + 0.05)

        this.arm0.xRot = this.arm0.xRot + Mth.sin(bob * 0.067) * 0.05
        this.arm1.xRot = this.arm1.xRot - Mth.sin(bob * 0.067) * 0.05
    }
}