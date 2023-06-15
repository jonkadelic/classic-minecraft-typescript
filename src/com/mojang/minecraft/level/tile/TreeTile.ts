import { Tile } from "./Tile";
import { Tiles } from "./Tiles";

export class TreeTile extends Tile {
    public constructor(id: number) {
        super(id, 20)
    }

    public override getResourceCount(): number {
        return Tile.random.nextInt(3) + 3
    }

    public override getResource(): number {
        return Tiles.wood.id
    }

    protected override getTexture(face: number): number {
        if (face == 1) {
            return 21
        }
        if (face == 0) {
            return 21
        }
        return 20
    }
}