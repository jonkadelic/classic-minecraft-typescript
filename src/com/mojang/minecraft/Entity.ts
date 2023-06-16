import { Level } from "./level/Level";
import { AABB } from "./phys/AABB";

export class Entity {
    protected level: Level
    public xo: number = 0
    public yo: number = 0
    public zo: number = 0
    public x: number = 0
    public y: number = 0
    public z: number = 0
    public xd: number = 0
    public yd: number = 0
    public zd: number = 0
    public yRot: number = 0
    public xRot: number = 0
    public bb: AABB
    public onGround: boolean = false
    public removed: boolean = false
    protected heightOffset: number = 0
    protected bbWidth = 0.6
    protected bbHeight = 1.8
    public ySlideOffset: number = 0.0
    public footSize: number = 0.0

    public constructor(level: Level) {
        this.level = level
        let w = this.bbWidth / 2
        let h = this.bbHeight / 2
        this.bb = new AABB(-w, -h, -w, w, h, w)
        this.resetPos()
    }

    public resetPos(): void {
        let x = Math.random() * this.level.width
        let y = this.level.depth + 10
        let z = Math.random() * this.level.height
        this.setPos(x, y, z)
    }

    public remove(): void {
        this.removed = true
    }

    protected setSize(w: number, h: number): void {
        this.bbWidth = w
        this.bbHeight = h
    }

    protected setPos(x: number, y: number, z: number): void {
        this.x = x
        this.y = y
        this.z = z
        let w = this.bbWidth / 2
        let h = this.bbHeight / 2
        this.bb = new AABB(x - w, y - h, z - w, x + w, y + h, z + w)
    }

    public turn(xo: number, yo: number): void {
        this.yRot = this.yRot + xo * 0.15
        this.xRot = this.xRot - yo * 0.15
        if (this.xRot < -90) {
            this.xRot = -90
        }
        if (this.xRot > 90) {
            this.xRot = 90
        }
    }

    public tick(): void {
        this.xo = this.x
        this.yo = this.y
        this.zo = this.z
    }

    public move(xa: number, ya: number, za: number): void {
        let xaOrg = xa
        let yaOrg = ya
        let zaOrg = za
        let aABBs = this.level.getCubes(this.bb.expand(xa, ya, za))
        for (let i = 0; i < aABBs.length; i++) {
            ya = aABBs[i].clipYCollide(this.bb, ya)
        }
        this.bb.move(0, ya, 0)
        for (let i = 0; i < aABBs.length; i++) {
            xa = aABBs[i].clipXCollide(this.bb, xa)
        }
        let step = this.onGround || yaOrg != ya && yaOrg < 0.0
        this.bb.move(xa, 0, 0)
        for (let i = 0; i < aABBs.length; i++) {
            za = aABBs[i].clipZCollide(this.bb, za)
        }
        this.bb.move(0, 0, za)

        if (this.footSize > 0.0 && step && this.ySlideOffset < 0.05 && (xaOrg != xa || zaOrg != za)) {
            let var18 = xa;
            let var17 = ya;
            let var13 = za;
            xa = xaOrg;
            ya = this.footSize;
            za = zaOrg;
            let var14 = this.bb.copy();
            this.bb = var9.copy();
            aABBs = this.level.getCubes(this.bb.expand(xaOrg, ya, zaOrg));

            let var15 = 0;
            for(; var15 < aABBs.length; ++var15) {
                ya = aABBs.get(var15).clipYCollide(this.bb, ya);
            }

            this.bb.move(0.0, ya, 0.0);

            for(var15 = 0; var15 < aABBs.length; ++var15) {
                xa = aABBs.get(var15).clipXCollide(this.bb, xa);
            }

            this.bb.move(xa, 0.0, 0.0);

            for(var15 = 0; var15 < aABBs.length; ++var15) {
               za = aABBs.get(var15).clipZCollide(this.bb, za);
            }

            this.bb.move(0.0, 0.0, za);

            if(var18 * var18 + var13 * var13 >= xa * xa + za * za) {
               xa = var18;
               ya = var17;
               za = var13;
               this.bb = var14.copy();
            } else {
               this.ySlideOffset += 0.5;
            }
        }

        let bl = this.onGround = yaOrg != ya && yaOrg < 0
        if (xaOrg != xa) {
            this.xd = 0
        }
        if (yaOrg != ya) {
            this.yd = 0
        }
        if (zaOrg != za) {
            this.zd = 0
        }
        this.x = (this.bb.x0 + this.bb.x1) / 2
        this.y = this.bb.y0 + this.heightOffset - this.ySlideOffset
        this.z = (this.bb.z0 + this.bb.z1) / 2
        this.ySlideOffset *= 0.4;
    }

    public moveRelative(xa: number, za: number, speed: number) {
        let dist = xa * xa + za * za
        if (dist < 0.01) return
        dist = speed / Math.sqrt(dist)
        xa *= dist
        za *= dist
        let sin = Math.sin(this.yRot * Math.PI / 180)
        let cos = Math.cos(this.yRot * Math.PI / 180)
        this.xd += xa * cos - za * sin
        this.zd += za * cos + xa * sin
    }

    public getBrightness(a: number): number {
        let xi = Math.trunc(this.x);
        let yi = Math.trunc(this.y + this.heightOffset / 2.0 - 0.5);
        let zi = Math.trunc(this.z);
        return this.level.getBrightness(xi, yi, zi);
    }

    public isLit(): boolean {
        let xTile = Math.trunc(this.x)
        let yTile = Math.trunc(this.y)
        let zTile = Math.trunc(this.z)
        return this.level.isLit(xTile, yTile, zTile)
    }

    public render(a: number) {
    }
}