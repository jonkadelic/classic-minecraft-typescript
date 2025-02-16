import { ParticleEngine } from "../../particle/ParticleEngine";
import { Level } from "../Level";
import { Tile } from "./Tile";

export class TntTile extends Tile {
    public constructor(id: number, tex: number) {
        super(id, tex)
    }

    public override getTexture(face: number): number {
        if (face == 0) {
            return this.tex + 2
        }
        if (face == 1) {
            return this.tex + 1
        }
        return this.tex
    }

    public override getResourceCount(): number {
        return 0
    }

    public override wasExploded(level: Level, x: number, y: number, z: number): void {
        // TODO
    }

    public override destroy(level: Level, x: number, y: number, z: number, particleEngine: ParticleEngine): void {
        // TODO
    }
}