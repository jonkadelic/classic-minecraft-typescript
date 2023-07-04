import { Tile } from "./Tile";
import { Tiles } from "./Tiles";

export class OreTile extends Tile {
    public constructor(id: number, tex: number) {
        super(id, tex)
    }

    public override getResource(): number {
        if (this == Tiles.coalOre) {
            return Tiles.stoneSlabHalf.id
        }
        if (this == Tiles.goldOre) {
            return Tiles.goldBlock.id
        }
        if (this == Tiles.ironOre) {
            return Tiles.ironBlock.id
        }
        return this.id
    }

    public override getResourceCount(): number {
        return Tile.random.nextInt(3) + 1
    }
}