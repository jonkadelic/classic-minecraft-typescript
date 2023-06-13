import { Entity } from "../Entity";
import { Level } from "../level/Level";
import { Tesselator } from "../renderer/Tesselator";

export class Particle extends Entity {
    private _xd: number
    private _yd: number
    private _zd: number
    public tex: number
    public uo: number
    public vo: number
    public age: number
    public lifetime: number
    public size: number

    public constructor(level: Level, x: number, y: number, z: number, xa: number, ya: number, za: number, tex: number) {
        super(level)
        this.tex = tex
        this.setSize(0.2, 0.2)
        this.heightOffset = this.bbHeight / 2
        this.setPos(x, y, z)
        this._xd = xa + (Math.random() * 2 - 1) * 0.4
        this._yd = ya + (Math.random() * 2 - 1) * 0.4
        this._zd = za + (Math.random() * 2 - 1) * 0.4
        let speed = (Math.random() + Math.random() + 1) * 0.15
        let dd = Math.sqrt(this._xd * this._xd + this._yd * this._yd + this._zd * this._zd)
        this._xd = this._xd / dd * speed * 0.4
        this._yd = this._yd / dd * speed * 0.4 + 0.1
        this._zd = this._zd / dd * speed * 0.4
        this.uo = Math.random() * 3.0
        this.vo = Math.random() * 3.0
        this.size = Math.random() * 0.5 + 0.5
        this.lifetime = Math.floor(4 / (Math.random() * 0.9 + 0.1))
        this.age = 0
    }

    public override tick(): void {
        this.xo = this.x
        this.yo = this.y
        this.zo = this.z
        if (this.age++ >= this.lifetime) {
            this.remove()
        }
        this._yd -= 0.04
        this.move(this._xd, this._yd, this._zd)
        this._xd *= 0.98
        this._yd *= 0.98
        this._zd *= 0.98
        if (this.onGround) {
            this._xd *= 0.7
            this._zd *= 0.7
        }
    }

    public renderParticle(t: Tesselator, a: number, xa: number, ya: number, za: number, xa2: number, za2: number): void {
        let u0 = ((this.tex % 16) + this.uo / 4) / 16
        let u1 = u0 + 0.015609375
        let v0 = (Math.floor(this.tex / 16) + this.vo / 4) / 16
        let v1 = v0 + 0.015609375
        let r = 0.1 * this.size
        let x = this.xo + (this.x - this.xo) * a
        let y = this.yo + (this.y - this.yo) * a
        let z = this.zo + (this.z - this.zo) * a
        t.vertexUV(x - xa * r - xa2 * r, y - ya * r, z - za * r - za2 * r, u0, v1)
        t.vertexUV(x - xa * r + xa2 * r, y + ya * r, z - za * r + za2 * r, u0, v0)
        t.vertexUV(x + xa * r + xa2 * r, y + ya * r, z + za * r + za2 * r, u1, v0)

        t.vertexUV(x + xa * r + xa2 * r, y + ya * r, z + za * r + za2 * r, u1, v0)
        t.vertexUV(x + xa * r - xa2 * r, y - ya * r, z + za * r - za2 * r, u1, v1)
        t.vertexUV(x - xa * r - xa2 * r, y - ya * r, z - za * r - za2 * r, u0, v1)
    }

}