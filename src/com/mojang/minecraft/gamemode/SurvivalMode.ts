import { Level } from "../level/Level";
import { MobSpawner } from "../level/MobSpawner";
import { Tile } from "../level/tile/Tile";
import { Tiles } from "../level/tile/Tiles";
import { Mob } from "../mob/Mob";
import { Player } from "../player/Player";
import { GameMode } from "./GameMode";

export class SurvivalMode extends GameMode {
    private xDestroyBlock: number = -1
    private yDestroyBlock: number = -1
    private zDestroyBlock: number = -1
    private destroyProgress: number = 0
    private oDestroyProgress: number = 0
    private destroyDelay: number = 0
    private mobSpawner: MobSpawner | null = null

    public override initPlayer(player: Player): void {
        player.inventory.slots[8] = Tiles.tnt.id
        player.inventory.count[8] = 10
    }

    public override destroyBlock(x: number, y: number, z: number): void {
        let t = this.minecraft.level!.getTile(x, y, z)
        Tile.tiles[t]!.spawnResources(this.minecraft.level!, x, y, z)
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

    public override render(a: number): void {
        if (this.destroyProgress <= 0) {
            this.minecraft.levelRenderer.destroyProgress = 0.0
        } else {
            this.minecraft.levelRenderer.destroyProgress = (this.destroyProgress + a - 1.0) / this.oDestroyProgress
        }
    }

    public override getPickRange(): number {
        return 4.0
    }

    public override useItem(player: Player, item: number): boolean {
        let heldItem = Tile.tiles[item]
        if (heldItem == Tiles.mushroom2 && this.minecraft.player?.inventory.removeResource(item)) {
            player.hurt(null, 3)
            return true
        } else if (heldItem == Tiles.mushroom1 && this.minecraft.player?.inventory.removeResource(item)) {
            player.heal(5)
            return true
        } else {
            return false
        }
    }

    public override initLevel(level: Level): void {
        super.initLevel(level)
        this.mobSpawner = new MobSpawner(level)
    }

    public override tick(): void {
        let mobSpawner = this.mobSpawner!
        let n = Math.trunc(mobSpawner.level.width * mobSpawner.level.height * mobSpawner.level.depth / 64 / 64 / 64)
        if (mobSpawner.level.random.nextInt(100) < n /* && mobSpawner.level.countInstanceOf(Mob.class) < n * 20 */) {
            mobSpawner.tick(n, mobSpawner.level.player, null)
        }
    }

    public override onSpawn(level: Level): void {
        this.mobSpawner = new MobSpawner(level)
        this.minecraft.progressRenderer.progressStage("Spawning..")
        let n = Math.trunc(level.width * level.height * level.depth / 800)
        this.mobSpawner.tick(n, null, this.minecraft.progressRenderer)
    }
}