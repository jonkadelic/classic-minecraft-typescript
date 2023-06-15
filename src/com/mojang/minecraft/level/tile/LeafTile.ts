import { Tiles } from "./Tiles";
import { TransparentTile } from "./TransparentTile";

export class LeafTile extends TransparentTile {
    public constructor(id: number, tex: number) {
        super(id, tex, true)
    }

    public override getResourceCount(): number {
        if (TransparentTile.random.nextInt(10) == 0) {
            return 1
        }
        return 0
    }

    public override getResource(): number {
        return Tiles.sapling.id
    }
}