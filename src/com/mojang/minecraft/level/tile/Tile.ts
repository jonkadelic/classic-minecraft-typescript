import { AABB } from "../../phys/AABB";
import { Tesselator } from "../../renderer/Tesselator";
import { Level } from "../Level";
import { Random } from "../../../../util/Random";
import { ParticleEngine } from "../../particle/ParticleEngine";
import { Particle } from "../../particle/Particle";
import { Vec3 } from "../../character/Vec3";
import { HitResult } from "../../HitResult";
import { Material } from "../material/Material";

export class Tile {
    protected static random: Random = new Random()
    public static tiles: Tile[] = new Array(256)
    public static shouldTick: boolean[] = new Array(256)
    public static isSolid: boolean[] = Array(256)
    public static isCubeShaped: boolean[] = Array(256)
    public static tickSpeed: number[] = Array(256)
    public tex: number
    public id: number
    private destroyProgress: number = 0
    private explodable: boolean = true
    public xx0: number = 0
    public yy0: number = 0
    public zz0: number = 0
    public xx1: number = 0
    public yy1: number = 0
    public zz1: number = 0
    public particleGravity: number = 0

    public constructor(id: number, tex: number = 0) {
        Tile.tiles[id] = this
        this.id = id
        this.setShape(0.0, 0.0, 0.0, 1.0, 1.0, 1.0)
        Tile.isSolid[id] = this.isSolidRender();
        Tile.isCubeShaped[id] = this.isCubeShaped();
        this.tex = tex
    }

    public isCubeShaped(): boolean {
        return true
    }

    public setTicking(shouldTick: boolean): void {
        Tile.shouldTick[this.id] = shouldTick;
    }

    public setData(particleGravity: number): Tile {
        this.particleGravity = particleGravity
        return this
    }

    protected setShape(xx0: number, yy0: number, zz0: number, xx1: number, yy1: number, zz1: number): void {
        this.xx0 = xx0
        this.yy0 = yy0
        this.zz0 = zz0
        this.xx1 = xx1
        this.yy1 = yy1
        this.zz1 = zz1
    }

    public setTickSpeed(tickSpeed: number): void {
        Tile.tickSpeed[this.id] = tickSpeed;
    }

    public renderInInventory(t: Tesselator): void {
        let c1 = 0.5
        let c2 = 0.8
        let c3 = 0.6
        t.color_f(c1, c1, c1)
        this.renderFace(t, -2, 0, 0, 0)
        t.color_f(1, 1, 1)
        this.renderFace(t, -2, 0, 0, 1)
        t.color_f(c2, c2, c2)
        this.renderFace(t, -2, 0, 0, 2)
        t.color_f(c2, c2, c2)
        this.renderFace(t, -2, 0, 0, 3)
        t.color_f(c3, c3, c3)
        this.renderFace(t, -2, 0, 0, 4)
        t.color_f(c3, c3, c3)
        this.renderFace(t, -2, 0, 0, 5)
    }

    protected getBrightness(level: Level, x: number, y: number, z: number): number {
        return level.getBrightness(x, y, z)
    }

    public isFaceVisible(level: Level, x: number, y: number, z: number, face: number): boolean {
        return !level.isSolidTile(x, y, z);
    }

    protected getTexture(face: number): number {
        return this.tex
    }

    public renderFace(t: Tesselator, x: number, y: number, z: number, face: number): void {
        let tex = this.getTexture(face)
        let u0 = (tex % 16) / 16.0
        let u1 = u0 + (1 / 16.0)
        let v0 = Math.trunc(tex / 16) / 16.0
        let v1 = v0 + (1 / 16.0)
        if (face >= 2 && tex < 240) {
            if (this.yy0 >= 0.0 && this.yy1 <= 1.0) {
                v0 = (Math.trunc(tex / 16) + this.yy0) / 16.0;
                v1 = (Math.trunc(tex / 16) + this.yy1) / 16.0;
            }
        }
        let x0 = x + this.xx0
        let x1 = x + this.xx1
        let y0 = y + this.yy0
        let y1 = y + this.yy1
        let z0 = z + this.zz0
        let z1 = z + this.zz1
        if (face == 0) {
            t.vertexUV(x0, y0, z1, u0, v1);
            t.vertexUV(x0, y0, z0, u0, v0);
            t.vertexUV(x1, y0, z0, u1, v0);
            
            t.vertexUV(x1, y0, z0, u1, v0);
            t.vertexUV(x1, y0, z1, u1, v1);
            t.vertexUV(x0, y0, z1, u0, v1);
        }
        if (face == 1) {
            t.vertexUV(x1, y1, z1, u1, v1);
            t.vertexUV(x1, y1, z0, u1, v0);
            t.vertexUV(x0, y1, z0, u0, v0);
            
            t.vertexUV(x0, y1, z0, u0, v0);
            t.vertexUV(x0, y1, z1, u0, v1);
            t.vertexUV(x1, y1, z1, u1, v1);
        }
        if (face == 2) {
            t.vertexUV(x0, y1, z0, u1, v0);
            t.vertexUV(x1, y1, z0, u0, v0);
            t.vertexUV(x1, y0, z0, u0, v1);
            
            t.vertexUV(x1, y0, z0, u0, v1);
            t.vertexUV(x0, y0, z0, u1, v1);
            t.vertexUV(x0, y1, z0, u1, v0);
        }
        if (face == 3) {
            t.vertexUV(x0, y1, z1, u0, v0);
            t.vertexUV(x0, y0, z1, u0, v1);
            t.vertexUV(x1, y0, z1, u1, v1);
            
            t.vertexUV(x1, y0, z1, u1, v1);
            t.vertexUV(x1, y1, z1, u1, v0);
            t.vertexUV(x0, y1, z1, u0, v0);
        }
        if (face == 4) {
            t.vertexUV(x0, y1, z1, u1, v0);
            t.vertexUV(x0, y1, z0, u0, v0);
            t.vertexUV(x0, y0, z0, u0, v1);
            
            t.vertexUV(x0, y0, z0, u0, v1);
            t.vertexUV(x0, y0, z1, u1, v1);
            t.vertexUV(x0, y1, z1, u1, v0);
        }
        if (face == 5) {
            t.vertexUV(x1, y0, z1, u0, v1);
            t.vertexUV(x1, y0, z0, u1, v1);
            t.vertexUV(x1, y1, z0, u1, v0);
            
            t.vertexUV(x1, y1, z0, u1, v0);
            t.vertexUV(x1, y1, z1, u0, v0);
            t.vertexUV(x1, y0, z1, u0, v1);
        }
    }

    public renderFaceNoTexture(t: Tesselator, x: number, y: number, z: number, face: number): void {
        let x0 = x + this.xx0
        let x1 = x + this.xx1
        let y0 = y + this.yy0
        let y1 = y + this.yy1
        let z0 = z + this.zz0
        let z1 = z + this.zz1
        if (face == 0) {
            t.vertex(x0, y0, z1);
            t.vertex(x0, y0, z0);
            t.vertex(x1, y0, z0);
            
            t.vertex(x1, y0, z0);
            t.vertex(x1, y0, z1);
            t.vertex(x0, y0, z1);
        }
        if (face == 1) {
            t.vertex(x1, y1, z1);
            t.vertex(x1, y1, z0);
            t.vertex(x0, y1, z0);
            
            t.vertex(x0, y1, z0);
            t.vertex(x0, y1, z1);
            t.vertex(x1, y1, z1);
        }
        if (face == 2) {
            t.vertex(x0, y1, z0);
            t.vertex(x1, y1, z0);
            t.vertex(x1, y0, z0);
            
            t.vertex(x1, y0, z0);
            t.vertex(x0, y0, z0);
            t.vertex(x0, y1, z0);
        }
        if (face == 3) {
            t.vertex(x0, y1, z1);
            t.vertex(x0, y0, z1);
            t.vertex(x1, y0, z1);
            
            t.vertex(x1, y0, z1);
            t.vertex(x1, y1, z1);
            t.vertex(x0, y1, z1);
        }
        if (face == 4) {
            t.vertex(x0, y1, z1);
            t.vertex(x0, y1, z0);
            t.vertex(x0, y0, z0);
            
            t.vertex(x0, y0, z0);
            t.vertex(x0, y0, z1);
            t.vertex(x0, y1, z1);
        }
        if (face == 5) {
            t.vertex(x1, y0, z1);
            t.vertex(x1, y0, z0);
            t.vertex(x1, y1, z0);
            
            t.vertex(x1, y1, z0);
            t.vertex(x1, y1, z1);
            t.vertex(x1, y0, z1);
        }
    }

    public getTileAABB(x: number, y: number, z: number): AABB {
        return new AABB(x + this.xx0, y + this.yy0, z + this.zz0, x + this.xx1, y + this.yy1, z + this.zz1)
    }
    
    public getAABB(x: number, y: number, z: number): AABB | null {
        return new AABB(x + this.xx0, y + this.yy0, z + this.zz0, x + this.xx1, y + this.yy1, z + this.zz1)
    }

    public blocksLight(): boolean {
        return true
    }

    public isSolidRender(): boolean {
        return true
    }

    public tick(level: Level, x: number, y: number, z: number, random: Random): void {
    }

    public destroy(level: Level, x: number, y: number, z: number, particleEngine: ParticleEngine): void {
        const SD: number = 4
        for (let xx = 0; xx < SD; xx++) {
            for (let yy = 0; yy < SD; yy++) {
                for (let zz = 0; zz < SD; zz++) {
                    const xp: number = x + (xx + 0.5) / SD
                    const yp: number = y + (yy + 0.5) / SD
                    const zp: number = z + (zz + 0.5) / SD
                    particleEngine.add(new Particle(level, xp, yp, zp, xp - x - 0.5, yp - y - 0.5, zp - z - 0.5, this))
                }
            }
        }
    }

    public getMaterial(): Material {
        return Material.none
    }

    public neighborChanged(level: Level, x: number, y: number, z: number, id: number): void {
    }

    public onPlaceByPlayer(level: Level, x: number, y: number, z: number): void {
    }

    public getTickDelay(): number {
        return 0
    }

    public onPlace(level: Level, x: number, y: number, z: number): void {
    }

    public onRemove(level: Level, x: number, y: number, z: number): void {
    }

    public getResourceCount(): number {
        return 1
    }

    public getResource(): number {
        return this.id
    }

    public getDestroyProgress(): number {
        return this.destroyProgress
    }

    public isExplodable(): boolean {
        return this.explodable
    }

    public clip(x: number, y: number, z: number, a: Vec3, b: Vec3): HitResult | null {
        a = a.add(-x, -y, -z)
        b = b.add(-x, -y, -z)
        let x0clip = a.clipX(b, this.xx0)
        let x1clip = a.clipX(b, this.xx1)
        let y0clip = a.clipY(b, this.yy0)
        let y1clip = a.clipY(b, this.yy1)
        let z0clip = a.clipZ(b, this.zz0)
        let z1clip = a.clipZ(b, this.zz1)
        if (!this.containsX(x0clip)) {
            x0clip = null
        }
        if (!this.containsX(x1clip)) {
            x1clip = null
        }
        if (!this.containsY(y0clip)) {
            y0clip = null
        }
        if (!this.containsY(y1clip)) {
            y1clip = null
        }
        if (!this.containsZ(z0clip)) {
            z0clip = null
        }
        if (!this.containsZ(z1clip)) {
            z1clip = null
        }
        let vec = null
        if (x0clip != null) {
            vec = x0clip
        }
        if (x1clip != null && (vec == null || a.distanceTo(x1clip) < a.distanceTo(vec))) {
            vec = x1clip
        }
        if (y0clip != null && (vec == null || a.distanceTo(y0clip) < a.distanceTo(vec))) {
            vec = y0clip
        }
        if (y1clip != null && (vec == null || a.distanceTo(y1clip) < a.distanceTo(vec))) {
            vec = y1clip
        }
        if (z0clip != null && (vec == null || a.distanceTo(z0clip) < a.distanceTo(vec))) {
            vec = z0clip
        }
        if (z1clip != null && (vec == null || a.distanceTo(z1clip) < a.distanceTo(vec))) {
            vec = z1clip
        }
        if (vec == null) {
            return null
        }
        let face = 0
        if (vec == x0clip) {
            face = 4
        }
        if (vec == x1clip) {
            face = 5
        }
        if (vec == y0clip) {
            face = 0
        }
        if (vec == y1clip) {
            face = 1
        }
        if (vec == z0clip) {
            face = 2
        }
        if (vec == z1clip) {
            face = 3
        }
        return new HitResult(0, x, y, z, face)
    }

    private containsX(v: Vec3 | null): boolean {
        return v != null && v.y >= this.yy0 && v.y <= this.yy1 && v.z >= this.zz0 && v.z <= this.zz1
    }

    private containsY(v: Vec3 | null): boolean {
        return v != null && v.x >= this.xx0 && v.x <= this.xx1 && v.z >= this.zz0 && v.z <= this.zz1
    }

    private containsZ(v: Vec3 | null): boolean {
        return v != null && v.x >= this.xx0 && v.x <= this.xx1 && v.y >= this.yy0 && v.y <= this.yy1
    }

    public wasExploded(level: Level, x: number, y: number, z: number): void {
    }

    public render(level: Level, x: number, y: number, z: number, t: Tesselator): boolean {
        let rendered = false
        let c1 = 0.5
        let c2 = 0.8
        let c3 = 0.6
        let brightness: number
        if (this.isFaceVisible(level, x, y - 1, z, 0)) {
            brightness = this.getBrightness(level, x, y - 1, z)
            t.color_f(c1 * brightness, c1 * brightness, c1 * brightness)
            this.renderFace(t, x, y, z, 0)
            rendered = true
        }
        if (this.isFaceVisible(level, x, y + 1, z, 1)) {
            brightness = this.getBrightness(level, x, y + 1, z)
            t.color_f(brightness, brightness, brightness)
            this.renderFace(t, x, y, z, 1)
            rendered = true
        }
        if (this.isFaceVisible(level, x, y, z - 1, 2)) {
            brightness = this.getBrightness(level, x, y, z - 1)
            t.color_f(c2 * brightness, c2 * brightness, c2 * brightness)
            this.renderFace(t, x, y, z, 2)
            rendered = true
        }
        if (this.isFaceVisible(level, x, y, z + 1, 3)) {
            brightness = this.getBrightness(level, x, y, z + 1)
            t.color_f(c2 * brightness, c2 * brightness, c2 * brightness)
            this.renderFace(t, x, y, z, 3)
            rendered = true
        }
        if (this.isFaceVisible(level, x - 1, y, z, 4)) {
            brightness = this.getBrightness(level, x - 1, y, z)
            t.color_f(c3 * brightness, c3 * brightness, c3 * brightness)
            this.renderFace(t, x, y, z, 4)
            rendered = true
        }
        if (this.isFaceVisible(level, x + 1, y, z, 5)) {
            brightness = this.getBrightness(level, x + 1, y, z)
            t.color_f(c3 * brightness, c3 * brightness, c3 * brightness)
            this.renderFace(t, x, y, z, 5)
            rendered = true
        }
        return rendered
    }

        
    public getRenderLayer(): number {
        return 0
    }
}