import { Tile } from "./level/tile/Tile";
import { Tiles } from "./level/tile/Tiles";

export class User {
    public static tiles: Tile[] = []
    public name: string
    public sessionId: string
    public mpPass: string = ""
    public isPremium: boolean = true

    public constructor(name: string, sessionId: string) {
        this.name = name
        this.sessionId = sessionId
    }

    static {
        User.tiles.push(Tiles.rock)
        User.tiles.push(Tiles.stoneBrick)
        User.tiles.push(Tiles.redBrick)
        User.tiles.push(Tiles.dirt)
        User.tiles.push(Tiles.wood)
        User.tiles.push(Tiles.treeTrunk)
        User.tiles.push(Tiles.leaves)
        User.tiles.push(Tiles.glass)
        User.tiles.push(Tiles.stoneSlabHalf)
        User.tiles.push(Tiles.mossStone)
        User.tiles.push(Tiles.sapling)
        User.tiles.push(Tiles.flower)
        User.tiles.push(Tiles.rose)
        User.tiles.push(Tiles.mushroom1)
        User.tiles.push(Tiles.mushroom2)
        User.tiles.push(Tiles.sand)
        User.tiles.push(Tiles.gravel)
        User.tiles.push(Tiles.sponge)
        User.tiles.push(Tiles.cloth_00)
        User.tiles.push(Tiles.cloth_01)
        User.tiles.push(Tiles.cloth_02)
        User.tiles.push(Tiles.cloth_03)
        User.tiles.push(Tiles.cloth_04)
        User.tiles.push(Tiles.cloth_05)
        User.tiles.push(Tiles.cloth_06)
        User.tiles.push(Tiles.cloth_07)
        User.tiles.push(Tiles.cloth_08)
        User.tiles.push(Tiles.cloth_09)
        User.tiles.push(Tiles.cloth_10)
        User.tiles.push(Tiles.cloth_11)
        User.tiles.push(Tiles.cloth_12)
        User.tiles.push(Tiles.cloth_13)
        User.tiles.push(Tiles.cloth_14)
        User.tiles.push(Tiles.cloth_15)
        User.tiles.push(Tiles.coalOre)
        User.tiles.push(Tiles.ironOre)
        User.tiles.push(Tiles.goldOre)
        User.tiles.push(Tiles.ironBlock)
        User.tiles.push(Tiles.goldBlock)
        User.tiles.push(Tiles.bookshelf)
        User.tiles.push(Tiles.tnt)
        User.tiles.push(Tiles.obsidian)
    }

}