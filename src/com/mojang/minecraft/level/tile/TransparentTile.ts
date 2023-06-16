import { Level } from "../Level";
import { Tile } from "./Tile";

export class TransparentTile extends Tile {
    private renderInside: boolean = true

    public constructor(id: number, texture: number, renderInside: boolean) {
        super(id, texture)
        this.renderInside = renderInside
    }

    public override isSolid(): boolean {
        return false
    }

    public override shouldRenderFace(level: Level, x: number, y: number, z: number, layer: number): boolean {
        let id = level.getTile(x, y, z)
        if (!this.renderInside && id == this.id) {
            return false
        }
        return super.shouldRenderFace(level, x, y, z, layer)
    }

    public override blocksLight(): boolean {
        return false
    }
}