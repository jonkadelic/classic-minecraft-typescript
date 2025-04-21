import { Mth } from "../../../util/Mth";
import { Cube } from "./Cube";
import { Model } from "./Model";

export class HumanoidModel extends Model {
    public head: Cube
    public hair: Cube
    public body: Cube
    public arm0: Cube
    public arm1: Cube
    public leg0: Cube
    public leg1: Cube

    public constructor(g: number = 0.0) {
        super()
        this.head = new Cube(0, 0)
        this.head.addBox(-4, -8, -4, 8, 8, 8, g)
        this.hair = new Cube(32, 0)
        this.hair.addBox(-4.0, -8.0, -4.0, 8, 8, 8, g + 0.5)
        this.body = new Cube(16, 16)
        this.body.addBox(-4, 0, -2, 8, 12, 4, g)
        this.arm0 = new Cube(40, 16)
        this.arm0.addBox(-3, -2, -2, 4, 12, 4, g)
        this.arm0.setPos(-5, 2, 0)
        this.arm1 = new Cube(40, 16)
        this.arm1.addBox(-1, -2, -2, 4, 12, 4, g)
        this.arm1.setPos(5, 2, 0)
        this.leg0 = new Cube(0, 16)
        this.leg0.addBox(-2, 0, -2, 4, 12, 4, g)
        this.leg0.setPos(-2, 12, 0)
        this.leg1 = new Cube(0, 16)
        this.leg1.addBox(-2, 0, -2, 4, 12, 4, g)
        this.leg1.setPos(2, 12, 0)
    }

    public override render(time: number, r: number, bob: number, yRot: number, xRot: number, scale: number): void {
        this.setupAnim(time, r, bob, yRot, xRot, scale)
        this.head.render(scale)
        this.body.render(scale)
        this.arm0.render(scale)
        this.arm1.render(scale)
        this.leg0.render(scale)
        this.leg1.render(scale)
    }

    public setupAnim(time: number, r: number, bob: number, yRot: number, xRot: number, scale: number) {
        this.head.yRot = yRot / (180.0 / Math.PI)
        this.head.xRot = xRot / (180.0 / Math.PI)

        this.arm0.xRot = Mth.cos(time * 0.6662 + Math.PI) * 2.0 * r
        this.arm0.zRot = (Mth.cos(time * 0.2312) + 1.0) * r
        
        this.arm1.xRot = Mth.cos(time * 0.6662) * 2.0 * r
        this.arm1.zRot = (Mth.cos(time * 0.2812) - 1.0) * r

        this.leg0.xRot = Mth.cos(time * 0.6662) * 1.4 * r
        this.leg1.xRot = Mth.cos(time * 0.6662 * Math.PI) * 1.4 * r

        this.arm0.zRot = this.arm0.zRot + Mth.cos(bob * 0.09) * 0.05 + 0.05
        this.arm1.zRot = this.arm1.zRot - (Mth.cos(bob * 0.09) * 0.05 + 0.05)
        this.arm0.xRot = this.arm0.xRot + Mth.sin(bob * 0.067) * 0.05
        this.arm1.xRot = this.arm1.xRot - Mth.sin(bob * 0.067) * 0.05
    }
}