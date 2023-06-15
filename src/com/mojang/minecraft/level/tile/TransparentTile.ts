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

    protected override shouldRenderFace(level: Level, x: number, y: number, z: number, layer: number): boolean {
        // TODO
        return true
    }
}