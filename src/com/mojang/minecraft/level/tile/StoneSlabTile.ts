import { Level } from "../Level";
import { Tile } from "./Tile";
import { Tiles } from "./Tiles";

export class StoneSlabTile extends Tile {
    private isFullBlock: boolean;

    public constructor(id: number, isFullBlock: boolean) {
        super(id, 6)
        this.isFullBlock = isFullBlock
        if (!isFullBlock) {
            this.setShape(0, 0, 0, 1, 0.5, 1)
        }
    }

    protected override getTexture(face: number): number {
        if (face <= 1) {
            return 6
        }
        return 5
    }

    public override isSolid(): boolean {
        return this.isFullBlock
    }

    public override neighborChanged(level: Level, x: number, y: number, z: number, type: number): void {
        if (this != Tiles.stoneSlabHalf) {
            return
        }
    }

    public override onPlace(level: Level, x: number, y: number, z: number): void {
        if (this != Tiles.stoneSlabHalf) {
            super.onPlace(level, x, y, z)
        }
        let id = level.getTile(x, y - 1, z)
        if (id == Tiles.stoneSlabHalf.id) {
            level.setTile(x, y, z, 0)
            level.setTile(x, y - 1, z, Tiles.stoneSlab.id)
        }
    }

    public override getResource(): number {
        return Tiles.stoneSlabHalf.id
    }

    public override isCubeShaped(): boolean {
        return this.isFullBlock
    }

    public override shouldRenderFace(level: Level, x: number, y: number, z: number, layer: number): boolean {
        if (this != Tiles.stoneSlabHalf) {
            return super.shouldRenderFace(level, x, y, z, layer)
        }
        if (layer == 1) {
            return true
        }
        if (!super.shouldRenderFace(level, x, y, z, layer)) {
            return false
        }
        if (layer == 0) {
            return true
        }
        return level.getTile(x, y, z) != this.id
    }
}