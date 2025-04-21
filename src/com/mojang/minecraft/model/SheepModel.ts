import { Cube } from "./Cube";
import { QuadrupedModel } from "./QuadrupedModel";

export class SheepModel extends QuadrupedModel {
    public constructor() {
        super(12.0, 0.0)

        this.head = new Cube(0, 0)
        this.head.addBox(-3.0, -4.0, -6.0, 6, 6, 8, 0.0)
        this.head.setPos(0.0, 6.0, -8.0)

        this.body = new Cube(28, 8)
        this.body.addBox(-4.0, -10.0, -7.0, 8, 16, 6, 0.0)
        this.body.setPos(0.0, 5.0, 2.0)
    }
}