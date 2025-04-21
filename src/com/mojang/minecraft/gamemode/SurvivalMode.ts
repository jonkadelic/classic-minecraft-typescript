import { Tile } from "../level/tile/Tile";
import { Tiles } from "../level/tile/Tiles";
import { Player } from "../player/Player";
import { GameMode } from "./GameMode";

export class SurvivalMode extends GameMode {
    private xDestroyBlock: number = -1
    private yDestroyBlock: number = -1
    private zDestroyBlock: number = -1
    private destroyProgress: number = 0
    private oDestroyProgress: number = 0
    private destroyDelay: number = 0
    // private mobSpawner: MobSpawner | null = null

    public override initPlayer(player: Player): void {
        player.inventory.slots[8] = Tiles.tnt.id
        player.inventory.count[8] = 10
    }

    public override destroyBlock(x: number, y: number, z: number): void {
        let t = this.minecraft.level!.getTile(x, y, z)
        // Tile.tiles[t].spawnResources(this.minecraft.level, x, y, z)
        super.destroyBlock(x, y, z)
    }

    public override removeResource(count: number): boolean {
        return this.minecraft.player!.inventory.removeResource(count)
    }

    public override startDestroyBlock(x: number, y: number, z: number): void {
        let t = this.minecraft.level!.getTile(x, y, z)
        if (t > 0 && Tile.tiles[t]!.getDestroyProgress() == 0) {
            this.destroyBlock(x, y, z)
        }
    }

    public override stopDestroyBlock(): void {
        this.destroyProgress = 0
        this.destroyDelay = 0
    }

    public override continueDestroyBlock(x: number, y: number, z: number, face: number): void {
        if (this.destroyDelay > 0) {
            this.destroyDelay--
        } else if (x == this.xDestroyBlock && y == this.yDestroyBlock && z == this.zDestroyBlock) {
            let t = this.minecraft.level!.getTile(x, y, z)
            if (t != 0) {
                let tile = Tile.tiles[t]!
                this.oDestroyProgress = tile.getDestroyProgress()
                tile.dig(this.minecraft.level!, x, y, z, face, this.minecraft.particleEngine)
                this.destroyProgress++
                if (this.destroyProgress == this.oDestroyProgress + 1) {
                    this.destroyBlock(x, y, z)
                    this.destroyProgress = 0
                    this.destroyDelay = 5
                }
            }
        } else {
            this.destroyProgress = 0
            this.xDestroyBlock = x
            this.yDestroyBlock = y
            this.zDestroyBlock = z
        }
    }
}