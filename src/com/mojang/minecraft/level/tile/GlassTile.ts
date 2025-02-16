import { Level } from "../Level";
import { Tile } from "./Tile";

export class GlassTile extends Tile {
    private renderInside: boolean = false

    public constructor(id: number, texture: number, renderInside: boolean) {
        super(id, texture)
        this.renderInside = renderInside
    }

    public override isSolidRender(): boolean {
        return false
    }

    public override isFaceVisible(level: Level, x: number, y: number, z: number, layer: number): boolean {
        let id = level.getTile(x, y, z)
        if (!this.renderInside && id == this.id) {
            return false
        }
        return super.isFaceVisible(level, x, y, z, layer)
    }

    public override blocksLight(): boolean {
        return false
    }
}