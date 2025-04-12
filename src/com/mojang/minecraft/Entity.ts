import { Mth } from "../../util/Mth";
import { BlockMap } from "./level/BlockMap";
import { Level } from "./level/Level";
import { Material } from "./level/material/Material";
import { Tile } from "./level/tile/Tile";
import { AABB } from "./phys/AABB";
import { Textures } from "./renderer/Textures";

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
    public yRotO: number = 0
    public xRotO: number = 0
    public bb: AABB
    public onGround: boolean = false
    public horizontalCollision: boolean = false
    public collision: boolean = false
    public slide: boolean = true
    public removed: boolean = false
    protected heightOffset: number = 0
    protected bbWidth = 0.6
    protected bbHeight = 1.8
    public walkDistO: number = 0.0
    public walkDist: number = 0.0
    public makeStepSound: boolean = true
    public fallDistance: number = 0.0
    private nextStep: number = 1
    public blockMap: BlockMap | null = null
    public xOld: number = 0.0
    public yOld: number = 0.0
    public zOld: number = 0.0
    public ySlideOffset: number = 0.0
    public footSize: number = 0.0
    public noPhysics: boolean = false
    public pushthrough: number = 0.0

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
        this.walkDistO = this.walkDist
        this.xo = this.x
        this.yo = this.y
        this.zo = this.z
        this.xRotO = this.xRot
        this.yRotO = this.yRot
    }

    public isFree(x: number, y: number, z: number, grow: number = 0): boolean {
        let aabb = this.bb.grow(grow, grow, grow).cloneMove(x, y, z)
        return this.level.getCubes(aabb).length > 0 ? false : !this.level.containsAnyLiquid(aabb)
    }

    public move(xa: number, ya: number, za: number): void {
        if (this.noPhysics) {
            this.bb.move(xa, ya, za)
            this.x = (this.bb.x0 + this.bb.x1) / 2
            this.y = this.bb.y0 + this.heightOffset - this.ySlideOffset
            this.z = (this.bb.z0 + this.bb.z1) / 2
        } else {
            let ox: number = this.x
            let oz: number = this.z
            let oxa: number = xa
            let oya: number = ya
            let oza: number = za
            let obb: AABB = this.bb.copy()
            let cubes: AABB[] = this.level.getCubes(this.bb.expand(xa, ya, za))

            for (let i: number = 0; i < cubes.length; i++) {
                ya = cubes[i].clipYCollide(this.bb, ya)
            }

            this.bb.move(0.0, ya, 0.0)
            if (!this.slide && oya != ya) {
                za = 0.0
                ya = 0.0
                xa = 0.0
            }

            let isCollidingBelow: boolean = this.onGround || oya != ya && oya < 0.0

            for (let i = 0; i < cubes.length; i++) {
                xa = cubes[i].clipXCollide(this.bb, xa)
            }

            this.bb.move(xa, 0.0, 0.0)
            if (!this.slide && oxa != xa) {
                za = 0.0
                ya = 0.0
                xa = 0.0
            }

            for (let i = 0; i < cubes.length; i++) {
                za = cubes[i].clipZCollide(this.bb, za)
            }

            this.bb.move(0.0, 0.0, za)
            if (!this.slide && oza != za) {
                za = 0.0
                ya = 0.0
                xa = 0.0
            }

            if (this.footSize > 0.0 && isCollidingBelow && this.ySlideOffset < 0.05 && (oxa != xa || oza != za)) {
                let noxa: number = xa
                let noya: number = ya
                let noza: number = za
                xa = oxa
                ya = this.footSize
                za = oza
                let nobb: AABB = this.bb.copy()
                this.bb = obb.copy()
                cubes = this.level.getCubes(this.bb.expand(oxa, ya, oza))

                for (let i: number = 0; i < cubes.length; i++) {
                    ya = cubes[i].clipYCollide(this.bb, ya)
                }

                this.bb.move(0.0, ya, 0.0)
                if (!this.slide && oya != ya) {
                    za = 0.0
                    ya = 0.0
                    xa = 0.0
                }

                for (let i: number = 0; i < cubes.length; i++) {
                    xa = cubes[i].clipXCollide(this.bb, xa)
                }

                this.bb.move(xa, 0.0, 0.0)
                if (!this.slide && oxa != xa) {
                    za = 0.0
                    ya = 0.0
                    xa = 0.0
                }

                for (let i: number = 0; i < cubes.length; i++) {
                    za = cubes[i].clipZCollide(this.bb, za)
                }

                this.bb.move(0.0, 0.0, za)
                if (!this.slide && oza != za) {
                    za = 0.0
                    ya = 0.0
                    xa = 0.0
                }

                if (noxa * noxa + noza * noza >= xa * xa + za * za) {
                    xa = noxa
                    ya = noya
                    za = noza
                    this.bb = nobb.copy()
                } else {
                    this.ySlideOffset = this.ySlideOffset + 0.5
                }
            }

            this.horizontalCollision = oxa != xa || oza != za
            this.onGround = oya != ya && oya < 0.0
            this.collision = this.horizontalCollision || oya != ya
            if (this.onGround) {
                if (this.fallDistance > 0.0) {
                    this.causeFallDamage(this.fallDistance)
                    this.fallDistance = 0.0
                }
            } else if (ya < 0.0) {
                this.fallDistance -= ya
            }

            if (oxa != xa) {
                this.xd = 0.0
            }

            if (oya != ya) {
                this.yd = 0.0
            }

            if (oza != za) {
                this.zd = 0.0
            }

            this.x = (this.bb.x0 + this.bb.x1) / 2
            this.y = this.bb.y0 + this.heightOffset - this.ySlideOffset
            this.z = (this.bb.z0 + this.bb.z1) / 2
            let dx: number = this.x - ox;
            let dz: number = this.z - oz;
            this.walkDist = this.walkDist + Mth.sqrt(dx * dx + dz * dz) * 0.6
            if (this.makeStepSound) {
                let tile: number = this.level.getTile(Math.trunc(this.x), Math.trunc(this.y - 0.2 - this.heightOffset), Math.trunc(this.z))
                if (this.walkDist > this.nextStep && tile > 0) {
                    // Sound stuff
                }
            }

            this.ySlideOffset *= 0.4
        }
    }

    protected causeFallDamage(damage: number): void {
    }

    public isInWater(): boolean {
        return this.level.containsLiquid(this.bb.grow(0.0, -0.4, 0.0), Material.water)
    }

    public isUnderWater(): boolean {
        let tile = this.level.getTile(Math.trunc(this.x), Math.trunc(this.y + 0.12), Math.trunc(this.z))
        if (tile != 0) {
            return Tile.tiles[tile]!.getMaterial() == Material.water
        }

        return false
    }

    public isInLava(): boolean {
        return this.level.containsLiquid(this.bb.grow(0.0, -0.4, 0.0), Material.lava)
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

    public setLevel(level: Level): void {
        this.level = level
    }

    public playerTouch(player: Entity): void { }

    public push_(other: Entity): void {
        let dx: number = other.x - this.x
        let dz: number = other.z - this.z
        let distanceSqr: number = dx * dx + dz * dz
        if (distanceSqr >= 0.01) {
            let distance: number = Mth.sqrt(distanceSqr)
            dx /= distance
            dz /= distance
            dx /= distance
            dz /= distance
            dx *= 0.05
            dz *= 0.05
            dx *= 1.0 - this.pushthrough
            dz *= 1.0 - this.pushthrough
            this.push(-dx, 0.0, -dz)
            other.push(dx, 0.0, dz)
        }
    }

    public push(dx: number, dy: number, dz: number): void {
        this.xd += dx
        this.yd += dy
        this.zd += dz
    }

    public hurt(attacker: Entity, damage: number): void { }

    public intersects(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): boolean {
        return this.bb.intersects_(x0, y0, z0, x1, y1, z1)
    }

    public isPickable(): boolean {
        return false
    }

    public isPushable(): boolean {
        return false
    }

    public awardKillScore(killer: Entity, deathScore: number): void { }

    public isCreativeModeAllowed(): boolean {
        return false
    }

    public renderHover(textures: Textures, a: number) {
        
    }
}