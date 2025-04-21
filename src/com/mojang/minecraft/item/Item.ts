import { Mth } from "../../../util/Mth";
import { Entity } from "../Entity";
import { Level } from "../level/Level";
import { Tile } from "../level/tile/Tile";
import { gl, matrix, shader } from "../Minecraft";
import { Player } from "../player/Player";
import { Textures } from "../renderer/Textures";
import { ItemModel } from "./ItemModel";
import { TakeEntityAnim } from "./TakeEntityAnim";

export class Item extends Entity {
    private static MODELS: ItemModel[] = new Array(256)
    private rot: number
    private resource: number
    private tickCount: number = 0
    private age: number = 0

    public static initModels(): void {
        for (let i = 0; i < 256; i++) {
            let tile = Tile.tiles[i]
            if (tile != null) {
                Item.MODELS[i] = new ItemModel(tile.tex)
            }
        }
    }

    public constructor(level: Level, x: number, y: number, z: number, resource: number) {
        super(level)

        this.setSize(0.25, 0.25)
        this.heightOffset = this.bbHeight / 2.0
        this.setPos(x, y, z)
        this.resource = resource
        this.rot = Math.random() * 360.0
        this.xd = Math.random() * 0.2 - 0.1
        this.yd = 0.2
        this.zd = Math.random() * 0.2 - 0.1
        this.makeStepSound = false
    }

    public override tick(): void {
        this.xo = this.x
        this.yo = this.y
        this.zo = this.z
        this.yd -= 0.04
        this.move(this.xd, this.yd, this.zd)
        this.xd *= 0.98
        this.yd *= 0.98
        this.zd *= 0.98
        if (this.onGround) {
            this.xd *= 0.7
            this.zd *= 0.7
            this.yd *= -0.5
        }
        this.tickCount++
        this.age++
        if (this.age >= 6000) {
            this.remove()
        }
    }

    public override render(textures: Textures, a: number): void {
        this.textureId = textures.loadTexture("./terrain.png")
        gl.bindTexture(gl.TEXTURE_2D, this.textureId)
        let br = this.level.getBrightness(Math.trunc(this.x), Math.trunc(this.y), Math.trunc(this.z))
        let rot = this.rot + (this.tickCount + a) * 3.0
        matrix.push()
        shader.setColor(br, br, br, 1.0)
        let cycle = Mth.sin(rot / 10.0)
        let bob  = cycle * 0.1 + 0.1
        matrix.translate(
            this.xo + (this.x - this.xo) * a,
            this.yo + (this.y - this.yo) * a + bob,
            this.zo + (this.z - this.zo) * a
        )
        matrix.rotate(rot, 0.0, 1.0, 0.0)
        Item.MODELS[this.resource].render()
        let alpha = cycle * 0.5 + 0.5
        alpha *= alpha
        alpha *= alpha
        shader.setColor(1.0, 1.0, 1.0, alpha * 0.4)
        // todo: disable texture
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
        shader.setAlphaTest(false)
        Item.MODELS[this.resource].render()
        shader.setAlphaTest(true)
        gl.disable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        shader.setColor(1.0, 1.0, 1.0, 1.0)
        matrix.pop()
        // todo: enable texture
    }

    public override playerTouch(player: Entity): void {
        let p = player as Player
        if (p.addResource(this.resource)) {
            this.level.addEntity(new TakeEntityAnim(this.level, this, p))
            this.remove()
        }
    }
}