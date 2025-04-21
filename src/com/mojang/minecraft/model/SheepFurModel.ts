import { Cube } from "./Cube";
import { QuadrupedModel } from "./QuadrupedModel";

export class SheepFurModel extends QuadrupedModel {
    public constructor() {
        super(12, 0.0)

        this.head = new Cube(0, 0)
        this.head.addBox(-3.0, -4.0, -4.0, 6, 6, 6, 0.6)
        this.head.setPos(0.0, 6.0, -8.0)

        this.body = new Cube(28, 8)
        this.body.addBox(-4.0, -10.0, -7.0, 8, 16, 6, 1.75)
        this.body.setPos(0.0, 5.0, 2.0)

        let g = 0.5
        this.leg0 = new Cube(0, 16)
        this.leg0.addBox(-2.0, 0.0, -2.0, 4, 6, 4, g)
        this.leg0.setPos(-3.0, 12.0, 7.0)

        this.leg1 = new Cube(0, 16)
        this.leg1.addBox(-2.0, 0.0, -2.0, 4, 6, 4, g)
        this.leg1.setPos(3.0, 12.0, 7.0)

        this.leg2 = new Cube(0, 16)
        this.leg2.addBox(-2.0, 0.0, -2.0, 4, 6, 4, g)
        this.leg2.setPos(-3.0, 12.0, -5.0)

        this.leg3 = new Cube(0, 16)
        this.leg3.addBox(-2.0, 0.0, -2.0, 4, 6, 4, g)
        this.leg3.setPos(3.0, 12.0, -5.0)
    }
}