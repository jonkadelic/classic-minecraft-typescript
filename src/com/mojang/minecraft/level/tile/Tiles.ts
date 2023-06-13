import { Bush } from "./Bush";
import { DirtTile } from "./DirtTile";
import { GrassTile } from "./GrassTile";
import { Tile } from "./Tile";

export class Tiles {
    public static empty: Tile = null
    public static rock: Tile = new Tile(1, 1)
    public static grass: Tile = new GrassTile(2)
    public static dirt: Tile = new DirtTile(3, 2)
    public static stoneBrick: Tile = new Tile(4, 16)
    public static wood: Tile = new Tile(5, 4)
    public static bush: Tile = new Bush(6)
}