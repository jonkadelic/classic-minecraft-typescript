import { Tile } from "./Tile";

export class MetalTile extends Tile {
    public constructor(id: number, tex: number) {
        super(id, tex)
    }

    public override getTexture(face: number): number {
        if (face == 1) {
            return this.tex - 16
        }
        if (face == 0) {
            return this.tex + 16
        }
        return this.tex
    }
}