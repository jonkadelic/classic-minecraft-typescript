export class AABB {
    private epsilon: number = 0.0
    public x0: number
    public y0: number
    public z0: number
    public x1: number
    public y1: number
    public z1: number

    constructor(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
        this.x0 = x0
        this.y0 = y0
        this.z0 = z0
        this.x1 = x1
        this.y1 = y1
        this.z1 = z1
    }

    public expand(xa: number, ya: number, za: number): AABB {
        let _x0 = this.x0
        let _y0 = this.y0
        let _z0 = this.z0
        let _x1 = this.x1
        let _y1 = this.y1
        let _z1 = this.z1
        if (xa < 0) {
            _x0 += xa
        }
        if (xa > 0) {
            _x1 += xa
        }
        if (ya < 0) {
            _y0 += ya
        }
        if (ya > 0) {
            _y1 += ya
        }
        if (za < 0) {
            _z0 += za
        }
        if (za > 0) {
            _z1 += za
        }
        return new AABB(_x0, _y0, _z0, _x1, _y1, _z1)
    }

    public grow(xa: number, ya: number, za: number): AABB {
        let _x0: number = this.x0 - xa
        let _y0: number = this.y0 - ya
        let _z0: number = this.z0 - za
        let _x1: number = this.x1 + xa
        let _y1: number = this.y1 + ya
        let _z1: number = this.z1 + za
        return new AABB(_x0, _y0, _z0, _x1, _y1, _z1)
    }

    public clipXCollide(c: AABB, xa: number): number {
        let max: number
        if (c.y1 <= this.y0 || c.y0 >= this.y1) {
            return xa
        }
        if (c.z1 <= this.z0 || c.z0 >= this.z1) {
            return xa
        }
        if (xa > 0 && c.x1 <= this.x0 && (max = this.x0 - c.x1 - this.epsilon) < xa) {
            xa = max
        }
        if (xa < 0 && c.x0 >= this.x1 && (max = this.x1 - c.x0 + this.epsilon) > xa) {
            xa = max
        }
        return xa
    }

    public clipYCollide(c: AABB, ya: number): number {
        let max: number
        if (c.x1 <= this.x0 || c.x0 >= this.x1) {
            return ya
        }
        if (c.z1 <= this.z0 || c.z0 >= this.z1) {
            return ya
        }
        if (ya > 0 && c.y1 <= this.y0 && (max = this.y0 - c.y1 - this.epsilon) < ya) {
            ya = max
        }
        if (ya < 0 && c.y0 >= this.y1 && (max = this.y1 - c.y0 + this.epsilon) > ya) {
            ya = max
        }
        return ya
    }

    public clipZCollide(c: AABB, za: number): number {
        let max: number
        if (c.x1 <= this.x0 || c.x0 >= this.x1) {
            return za
        }
        if (c.y1 <= this.y0 || c.y0 >= this.y1) {
            return za
        }
        if (za > 0 && c.z1 <= this.z0 && (max = this.z0 - c.z1 - this.epsilon) < za) {
            za = max
        }
        if (za < 0 && c.z0 >= this.z1 && (max = this.z1 - c.z0 + this.epsilon) > za) {
            za = max
        }
        return za
    }

    public intersects(c: AABB): boolean {
        if (c.x1 <= this.x0 || c.x0 >= this.x1) {
            return false
        }
        if (c.y1 <= this.y0 || c.y0 >= this.y1) {
            return false
        }
        return !(c.z1 <= this.z0 || c.z0 >= this.z1)
    }

    public intersectsInner(c: AABB): boolean {
        if (c.x1 < this.x0 || c.x0 > this.x1) {
            return false
        }
        if (c.y1 < this.y0 || c.y0 > this.y1) {
            return false
        }
        return !(c.z1 < this.z0 || c.z0 > this.z1)
    }

    public move(xa: number, ya: number, za: number): void {
        this.x0 += xa
        this.y0 += ya
        this.z0 += za
        this.x1 += xa
        this.y1 += ya
        this.z1 += za
    }
}