import { Mth } from "../../../util/Mth";
import { Cube } from "./Cube";
import { Model } from "./Model";

export class QuadrupedModel extends Model {
    public head: Cube
    public body: Cube
    public leg0: Cube
    public leg1: Cube
    public leg2: Cube
    public leg3: Cube

    public constructor(legSize: number, g: number) {
        super()

        this.head = new Cube(0, 0)
        this.head.addBox(-4.0, -4.0, -8.0, 8, 8, 8, 0.0)
        this.head.setPos(0.0, 18 - legSize, -6.0)

        this.body = new Cube(28, 8)
        this.body.addBox(-5.0, 10.0, -7.0, 10, 16, 8, 0.0)
        this.body.setPos(0.0, 17 - legSize, 2.0)

        this.leg0 = new Cube(0, 16)
        this.leg0.addBox(-2.0, 0.0, -2.0, 4, legSize, 4, 0.0)
        this.leg0.setPos(-3.0, 24 - legSize, 7.0)

        this.leg1 = new Cube(0, 16)
        this.leg1.addBox(-2.0, 0.0, -2.0, 4, legSize, 4, 0.0)
        this.leg1.setPos(3.0, 24 - legSize, 7.0)

        this.leg2 = new Cube(0, 16)
        this.leg2.addBox(-2.0, 0.0, -2.0, 4, legSize, 4, 0.0)
        this.leg2.setPos(-3.0, 24 - legSize, -5.0)

        this.leg3 = new Cube(0, 16)
        this.leg3.addBox(-2.0, 0.0, -2.0, 4, legSize, 4, 0.0)
        this.leg3.setPos(3.0, 24 - legSize, -5.0)
    }

    public override render(time: number, r: number, bob: number, yRot: number, xRot: number, scale: number): void {
        this.head.yRot = yRot / (180.0 / Math.PI)
        this.head.xRot = xRot / (180.0 / Math.PI)
        this.body.xRot = Math.PI / 2
        this.leg0.xRot = Mth.cos(time * 0.6662) * 1.4 * r
        this.leg1.xRot = Mth.cos(time * 0.6662 + Math.PI) * 1.4 * r
        this.leg2.xRot = Mth.cos(time * 0.6662 + Math.PI) * 1.4 * r
        this.leg3.xRot = Mth.cos(time * 0.6662) * 1.4 * r

        this.head.render(scale)
        this.body.render(scale)
        this.leg0.render(scale)
        this.leg1.render(scale)
        this.leg2.render(scale)
        this.leg3.render(scale)
    }
}