import { Mth } from "../../../util/Mth";
import { Cube } from "./Cube";
import { Model } from "./Model";

export class CreeperModel extends Model {
    private head: Cube
    private hair: Cube
    private body: Cube
    private leg0: Cube
    private leg1: Cube
    private leg2: Cube
    private leg3: Cube

    public constructor() {
        super()

        this.head = new Cube(0, 0)
        this.head.addBox(-4.0, -8.0, -4.0, 8, 8, 8, 0.0)
        this.hair = new Cube(32, 0)
        this.hair.addBox(-4.0, -8.0, -4.0, 8, 8, 8, 0.0 + 0.5)
        this.body = new Cube(16, 16)
        this.body.addBox(-4.0, 0.0, -2.0, 8, 12, 4, 0.0)
        this.leg0 = new Cube(0, 16)
        this.leg0.addBox(-2.0, 0.0, -2.0, 4, 6, 4, 0.0)
        this.leg0.setPos(-2.0, 12.0, 4.0)
        this.leg1 = new Cube(0, 16)
        this.leg1.addBox(-2.0, 0.0, -2.0, 4, 6, 4, 0.0)
        this.leg1.setPos(2.0, 12.0, 4.0)
        this.leg2 = new Cube(0, 16)
        this.leg2.addBox(-2.0, 0.0, -2.0, 4, 6, 4, 0.0)
        this.leg2.setPos(-2.0, 12.0, -4.0)
        this.leg3 = new Cube(0, 16)
        this.leg3.addBox(-2.0, 0.0, -2.0, 4, 6, 4, 0.0)
        this.leg3.setPos(2.0, 12.0, -4.0)
    }

    public override render(time: number, r: number, bob: number, yRot: number, xRot: number, scale: number): void {
        this.head.yRot = yRot / (180.0 / Math.PI)
        this.head.xRot = xRot / (180.0 / Math.PI)
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