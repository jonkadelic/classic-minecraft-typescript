import { Cube } from "./Cube";

export class ZombieModel {
    public head: Cube
    public body: Cube
    public arm0: Cube
    public arm1: Cube
    public leg0: Cube
    public leg1: Cube

    public constructor() {
        this.head = new Cube(0, 0)
        this.head.addBox(-4, -8, -4, 8, 8, 8)
        this.body = new Cube(16, 16)
        this.body.addBox(-4, 0, -2, 8, 12, 4)
        this.arm0 = new Cube(40, 16)
        this.arm0.addBox(-3, -2, -2, 4, 12, 4)
        this.arm0.setPos(-5, 2, 0)
        this.arm1 = new Cube(40, 16)
        this.arm1.addBox(-1, -2, -2, 4, 12, 4)
        this.arm1.setPos(5, 2, 0)
        this.leg0 = new Cube(0, 16)
        this.leg0.addBox(-2, 0, -2, 4, 12, 4)
        this.leg0.setPos(-2, 12, 0)
        this.leg1 = new Cube(0, 16)
        this.leg1.addBox(-2, 0, -2, 4, 12, 4)
        this.leg1.setPos(2, 12, 0)
    }

    public render(time: number): void {
        this.head.yRot = 0.0
        this.head.xRot = 0.0
        this.arm0.xRot = Math.sin(time * 0.6662 + Math.PI) * 2
        this.arm0.zRot = (Math.sin(time * 0.2312) + 1) * 1
        this.arm1.xRot = Math.sin(time * 0.6662) * 2
        this.arm1.zRot = (Math.sin(time * 0.2812) - 1) * 1
        this.leg0.xRot = Math.sin(time * 0.6662) * 1.4
        this.leg1.xRot = Math.sin(time * 0.6662 + Math.PI) * 1.4
        this.head.render()
        this.body.render()
        this.arm0.render()
        this.arm1.render()
        this.leg0.render()
        this.leg1.render()
    }

}