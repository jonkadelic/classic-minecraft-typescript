import { Entity } from "../Entity";
import { Level } from "../level/Level";
import { Textures } from "../renderer/Textures";

export class TakeEntityAnim extends Entity {
    private time: number = 0
    private item: Entity
    private player: Entity
    private xorg: number
    private yorg: number
    private zorg: number

    public constructor(level: Level, item: Entity, player: Entity) {
        super(level)
        this.item = item
        this.player = player
        this.setSize(1.0, 1.0)
        this.xorg = item.x
        this.yorg = item.y
        this.zorg = item.z
    }

    public override tick(): void {
        this.time++
        if (this.time >= 3) {
            this.remove()
        }

        let a = this.time / 3.0
        a *= a
        
        this.xo = this.item.xo = this.item.x
        this.yo = this.item.yo = this.item.y
        this.zo = this.item.zo = this.item.z
        this.x = this.item.x = this.xorg + (this.player.x - this.xorg) * a
        this.y = this.item.y = this.yorg + (this.player.y - 1.0 - this.yorg) * a
        this.z = this.item.z = this.zorg + (this.player.z - this.zorg) * a
        this.setPos(this.x, this.y, this.z)
    }

    public override render(textures: Textures, a: number): void {
        this.item.render(textures, a)
    }
}