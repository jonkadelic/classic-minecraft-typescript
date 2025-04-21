import { Cube } from "./Cube";
import { ZombieModel } from "./ZombieModel";

export class SkeletonModel extends ZombieModel {
    public constructor() {
        super()

        this.arm0 = new Cube(40, 16)
        this.arm0.addBox(-1.0, -2.0, -1.0, 2, 12, 2, 0.0)
        this.arm0.setPos(-5.0, 2.0, 0.0)

        this.arm1 = new Cube(40, 16)
        this.arm1.mirror = true
        this.arm1.addBox(-1.0, -2.0, -1.0, 2, 12, 2, 0.0)
        this.arm1.setPos(5.0, 2.0, 0.0)

        this.leg0 = new Cube(0, 16)
        this.leg0.addBox(-1.0, 0.0, -1.0, 2, 12, 2, 0.0)
        this.leg0.setPos(-2.0, 12.0, 0.0)

        this.leg1 = new Cube(0, 16)
        this.leg1.mirror = true
        this.leg1.addBox(-1.0, 0.0, -1.0, 2, 12, 2, 0.0)
        this.leg1.setPos(2.0, 12.0, 0.0)
    }
}