import { Level } from "../level/Level";
import { gl, shader } from "../Minecraft";
import { HumanoidModel } from "../model/HumanoidModel";
import { Textures } from "../renderer/Textures";
import { Mob } from "./Mob";

export class HumanoidMob extends Mob {
    public helmet: boolean = Math.random() < 0.2
    public armor: boolean = Math.random() < 0.2

    public constructor( level: Level, x: number, y: number, z: number) {
        super(level)
        this.modelName = "humanoid"
        this.setPos(x, y, z)
    }

    public override renderModel(textures: Textures, time: number, a: number, r: number, yRot: number, xRot: number, scale: number): void {
        super.renderModel(textures, time, a, r, yRot, xRot, scale)
        let model = Mob.modelCache.getModelById(this.modelName!)!
        shader.setAlphaTest(true)
        if (this.allowAlpha) {
            gl.enable(gl.CULL_FACE)
        }

        if (this.hasHair) {
            gl.disable(gl.CULL_FACE)
            let hModel = model as HumanoidModel
            hModel.hair.yRot = hModel.head.yRot
            hModel.hair.xRot = hModel.head.xRot
            hModel.hair.render(scale)
            gl.enable(gl.CULL_FACE)
        }

        if (this.armor || this.helmet) {
            gl.bindTexture(gl.TEXTURE_2D, textures.loadTexture("./armor/plate.png"))
            gl.disable(gl.CULL_FACE)

            let armorModel: HumanoidModel = Mob.modelCache.getModelById("humanoid.armor") as HumanoidModel
            armorModel.head.visible = this.helmet
            armorModel.body.visible = this.armor
            armorModel.arm0.visible = this.armor
            armorModel.arm1.visible = this.armor
            armorModel.leg0.visible = false
            armorModel.leg1.visible = false

            let hModel = model as HumanoidModel
            armorModel.head.yRot = hModel.head.yRot
            armorModel.head.xRot = hModel.head.xRot
            armorModel.arm0.xRot = hModel.arm0.xRot
            armorModel.arm0.zRot = hModel.arm0.zRot
            armorModel.arm1.xRot = hModel.arm1.xRot
            armorModel.arm1.zRot = hModel.arm1.zRot
            armorModel.leg0.xRot = hModel.leg0.xRot
            armorModel.leg1.xRot = hModel.leg1.xRot
            armorModel.head.render(scale)
            armorModel.body.render(scale)
            armorModel.arm0.render(scale)
            armorModel.arm1.render(scale)
            armorModel.leg0.render(scale)
            armorModel.leg1.render(scale)

            gl.enable(gl.CULL_FACE)
        }

        shader.setAlphaTest(false)
    }
}