import { Tile } from "./Tile";
import { Tiles } from "./Tiles";

export class StoneTile extends Tile {
    public constructor(id: number, tex: number) {
        super(id, tex)
    }

    public override getResource(): number {
        return Tiles.stoneBrick.id
    }
}