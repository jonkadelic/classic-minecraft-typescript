import { Mth } from "../../../util/Mth"
import { Cube } from "./Cube"
import { Model } from "./Model"

export class SpiderModel extends Model {
    private head: Cube
    private body0: Cube
    private body1: Cube
    private leg0: Cube
    private leg1: Cube
    private leg2: Cube
    private leg3: Cube
    private leg4: Cube
    private leg5: Cube
    private leg6: Cube
    private leg7: Cube

    public constructor() {
        super()
        this.head = new Cube(32, 4)
		this.head.addBox(-4.0, -4.0, -8.0, 8, 8, 8, 0.0)
		this.head.setPos(0.0, 0.0, -3.0)

		this.body0 = new Cube(0, 0)
		this.body0.addBox(-3.0, -3.0, -3.0, 6, 6, 6, 0.0)

		this.body1 = new Cube(0, 12)
		this.body1.addBox(-5.0, -4.0, -6.0, 10, 8, 12, 0.0)
		this.body1.setPos(0.0, 0.0, 9.0)

		this.leg0 = new Cube(18, 0)
		this.leg0.addBox(-15.0, -1.0, -1.0, 16, 2, 2, 0.0)
		this.leg0.setPos(-4.0, 0.0, 2.0)

		this.leg1 = new Cube(18, 0)
		this.leg1.addBox(-1.0, -1.0, -1.0, 16, 2, 2, 0.0)
		this.leg1.setPos(4.0, 0.0, 2.0)

		this.leg2 = new Cube(18, 0)
		this.leg2.addBox(-15.0, -1.0, -1.0, 16, 2, 2, 0.0)
		this.leg2.setPos(-4.0, 0.0, 1.0)

		this.leg3 = new Cube(18, 0)
		this.leg3.addBox(-1.0, -1.0, -1.0, 16, 2, 2, 0.0)
		this.leg3.setPos(4.0, 0.0, 1.0)

		this.leg4 = new Cube(18, 0)
		this.leg4.addBox(-15.0, -1.0, -1.0, 16, 2, 2, 0.0)
		this.leg4.setPos(-4.0, 0.0, 0.0)

		this.leg5 = new Cube(18, 0)
		this.leg5.addBox(-1.0, -1.0, -1.0, 16, 2, 2, 0.0)
		this.leg5.setPos(4.0, 0.0, 0.0)

		this.leg6 = new Cube(18, 0)
		this.leg6.addBox(-15.0, -1.0, -1.0, 16, 2, 2, 0.0)
		this.leg6.setPos(-4.0, 0.0, -1.0)

		this.leg7 = new Cube(18, 0)
		this.leg7.addBox(-1.0, -1.0, -1.0, 16, 2, 2, 0.0)
		this.leg7.setPos(4.0, 0.0, -1.0)
    }

    public override render(time: number, r: number, bob: number, yRot: number, xRot: number, scale: number): void {
        this.head.yRot = yRot / (180.0 / Math.PI)
		this.head.xRot = xRot / (180.0 / Math.PI)
		let sr = Math.PI / 4
		this.leg0.zRot = -sr
		this.leg1.zRot = sr
		this.leg2.zRot = -sr * 0.74
		this.leg3.zRot = sr * 0.74
		this.leg4.zRot = -sr * 0.74
		this.leg5.zRot = sr * 0.74
		this.leg6.zRot = -sr
		this.leg7.zRot = sr
        let ro = -0.0
		let ur = Math.PI / 8
		this.leg0.yRot = ur * 2.0 + ro
		this.leg1.yRot = -ur * 2.0 - ro
		this.leg2.yRot = ur * 1.0 + ro
		this.leg3.yRot = -ur * 1.0 - ro
		this.leg4.yRot = -ur * 1.0 + ro
		this.leg5.yRot = ur * 1.0 - ro
		this.leg6.yRot = -ur * 2.0 + ro
		this.leg7.yRot = ur * 2.0 - ro
		let c0 = -(Mth.cos(time * 0.6662 * 2.0) * 0.4) * r
		let c1 = -(Mth.cos(time * 0.6662 * 2.0 + Math.PI) * 0.4) * r
		let c2 = -(Mth.cos(time * 0.6662 * 2.0 + Math.PI / 2) * 0.4) * r
		let c3 = -(Mth.cos(time * 0.6662 * 2.0 + Math.PI * 3.0 / 2.0) * 0.4) * r
		let s0 = Math.abs(Mth.sin(time * 0.6662) * 0.4) * r
		let s1 = Math.abs(Mth.sin(time * 0.6662 + Math.PI) * 0.4) * r
		let s2 = Math.abs(Mth.sin(time * 0.6662 + Math.PI / 2) * 0.4) * r
		let s3 = Math.abs(Mth.sin(time * 0.6662 + Math.PI * 3.0 / 2.0) * 0.4) * r
		this.leg0.yRot += c0
		this.leg1.yRot += -c0
		this.leg2.yRot += c1
		this.leg3.yRot += -c1
		this.leg4.yRot += c2
		this.leg5.yRot += -c2
		this.leg6.yRot += c3
		this.leg7.yRot += -c3
		this.leg0.zRot += s0
		this.leg1.zRot += -s0
		this.leg2.zRot += s1
		this.leg3.zRot += -s1
		this.leg4.zRot += s2
		this.leg5.zRot += -s2
		this.leg6.zRot += s3
		this.leg7.zRot += -s3

		this.head.render(scale)
		this.body0.render(scale)
		this.body1.render(scale)
		this.leg0.render(scale)
		this.leg1.render(scale)
		this.leg2.render(scale)
		this.leg3.render(scale)
		this.leg4.render(scale)
		this.leg5.render(scale)
		this.leg6.render(scale)
		this.leg7.render(scale)
    }
}