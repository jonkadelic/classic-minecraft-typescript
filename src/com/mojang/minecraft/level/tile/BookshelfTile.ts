import { Tile } from "./Tile";

export class BookshelfTile extends Tile {
    public constructor(id: number, tex: number) {
        super(id, tex)
    }

    public override getTexture(face: number): number {
        if (face <= 1) {
            return 4
        }
        return this.tex
    }

    public override getResourceCount(): number {
        return 0
    }
}