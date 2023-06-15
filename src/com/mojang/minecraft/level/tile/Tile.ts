import { AABB } from "../../phys/AABB";
import { Tesselator } from "../../renderer/Tesselator";
import { Level } from "../Level";
import { Random } from "../../../../util/Random";
import { ParticleEngine } from "../../particle/ParticleEngine";
import { Particle } from "../../particle/Particle";
import { GrassTile } from "./GrassTile";
import { DirtTile } from "./DirtTile";
import { Bush } from "./Bush";
import { Tiles } from "./Tiles";
import { Vec3 } from "../../character/Vec3";
import { HitResult } from "../../HitResult";

export class Tile {
    protected static random: Random = new Random()
    public static tiles: Tile[] = new Array(256)
    public tex: number
    public id: number
    public x0: number = 0
    public y0: number = 0
    public z0: number = 0
    public x1: number = 1
    public y1: number = 1
    public z1: number = 1

    public constructor(id: number, tex: number = 0) {
        this.id = id;
        Tile.tiles[id] = this
        this.tex = tex
    }
    
    public render(t: Tesselator, level: Level, layer: number, x: number, y: number, z: number): void {
        let c1 = 1.0
        let c2 = 0.8
        let c3 = 0.6
        if (this.shouldRenderFace(level, x, y - 1, z, layer)) {
            let darkness = 0.0
            if (!level.isLit(x, y - 1, z)) darkness = 0.4
            t.color_f(c1 - darkness, c1 - darkness, c1 - darkness)
            this.renderFace(t, x, y, z, 0)
        }
        if (this.shouldRenderFace(level, x, y + 1, z, layer)) {
            let darkness = 0.0
            if (!level.isLit(x, y + 1, z)) darkness = 0.4
            t.color_f(c1 - darkness, c1 - darkness, c1 - darkness)
            this.renderFace(t, x, y, z, 1)
        }
        if (this.shouldRenderFace(level, x, y, z - 1, layer)) {
            let darkness = 0.0
            if (!level.isLit(x, y, z - 1)) darkness = 0.3
            t.color_f(c2 - darkness, c2 - darkness, c2 - darkness)
            this.renderFace(t, x, y, z, 2)
        }
        if (this.shouldRenderFace(level, x, y, z + 1, layer)) {
            let darkness = 0.0
            if (!level.isLit(x, y, z + 1)) darkness = 0.3
            t.color_f(c2 - darkness, c2 - darkness, c2 - darkness)
            this.renderFace(t, x, y, z, 3)
        }
        if (this.shouldRenderFace(level, x - 1, y, z, layer)) {
            let darkness = 0.0
            if (!level.isLit(x - 1, y, z)) darkness = 0.2
            t.color_f(c3 - darkness, c3 - darkness, c3 - darkness)
            this.renderFace(t, x, y, z, 4)
        }
        if (this.shouldRenderFace(level, x + 1, y, z, layer)) {
            let darkness = 0.0
            if (!level.isLit(x + 1, y, z)) darkness = 0.2
            t.color_f(c3 - darkness, c3 - darkness, c3 - darkness)
            this.renderFace(t, x, y, z, 5)
        }
    }

    private shouldRenderFace(level: Level, x: number, y: number, z: number, layer: number): boolean {
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
        let x0 = x + this.x0
        let x1 = x + this.x1
        let y0 = y + this.y0
        let y1 = y + this.y1
        let z0 = z + this.z0
        let z1 = z + this.z1
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
        let x0 = x + this.x0
        let x1 = x + this.x1
        let y0 = y + this.y0
        let y1 = y + this.y1
        let z0 = z + this.z0
        let z1 = z + this.z1
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
        return new AABB(x, y, z, x + 1, y + 1, z + 1)
    }
    
    public getAABB(x: number, y: number, z: number): AABB | null {
        return new AABB(x, y, z, x + 1, y + 1, z + 1)
    }

    public blocksLight(): boolean {
        return true
    }

    public isSolid(): boolean {
        return true
    }

    public tick(level: Level, x: number, y: number, z: number, random: Random): void {
    }

    public destroy(level: Level, x: number, y: number, z: number, particleEngine: ParticleEngine): void {
        const SD: number = 4
        let xx: number = 0
        while (xx < SD) {
            let yy: number = 0
            while (yy < SD) {
                let zz: number = 0
                while (zz < SD) {
                    const xp: number = x + (xx + 0.5) / SD
                    const yp: number = y + (yy + 0.5) / SD
                    const zp: number = z + (zz + 0.5) / SD
                    particleEngine.add(new Particle(level, xp, yp, zp, xp - x - 0.5, yp - y - 0.5, zp - z - 0.5, this.tex))
                    zz++
                }
                yy++
            }
            xx++
        }
    }

    public getResourceCount(): number {
        return 1
    }

    public getResource(): number {
        return this.id
    }

    public clip(x: number, y: number, z: number, a: Vec3, b: Vec3): HitResult | null {
        a = a.add(-x, -y, -z)
        b = b.add(-x, -y, -z)
        let x0clip = a.clipX(b, this.x0)
        let x1clip = a.clipX(b, this.x1)
        let y0clip = a.clipY(b, this.y0)
        let y1clip = a.clipY(b, this.y1)
        let z0clip = a.clipZ(b, this.z0)
        let z1clip = a.clipZ(b, this.z1)
        if (!this.inYZ(x0clip)) {
            x0clip = null
        }
        if (!this.inYZ(x1clip)) {
            x1clip = null
        }
        if (!this.inXZ(y0clip)) {
            y0clip = null
        }
        if (!this.inXZ(y1clip)) {
            y1clip = null
        }
        if (!this.inXY(z0clip)) {
            z0clip = null
        }
        if (!this.inXY(z1clip)) {
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

    private inYZ(v: Vec3 | null): boolean {
        return v != null && v.y >= this.y0 && v.y <= this.y1 && v.z >= this.z0 && v.z <= this.z1
    }

    private inXZ(v: Vec3 | null): boolean {
        return v != null && v.x >= this.x0 && v.x <= this.x1 && v.z >= this.z0 && v.z <= this.z1
    }

    private inXY(v: Vec3 | null): boolean {
        return v != null && v.x >= this.x0 && v.x <= this.x1 && v.y >= this.y0 && v.y <= this.y1
    }
}