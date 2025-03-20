import { Matrix } from "../../../util/Matrix";
import { Mob } from "../mob/Mob";
import { gl, matrix, shader } from "../Minecraft";
import { Level } from "../level/Level";
import { Textures } from "../renderer/Textures";
import { ZombieModel } from "./ZombieModel";

export class Zombie extends Mob {
    private static zombieModel: ZombieModel | null = null
    private textures: Textures

    public constructor(level: Level, textures: Textures, x: number, y: number, z: number) {
        super(level)
        if (Zombie.zombieModel == null) {
            Zombie.zombieModel = new ZombieModel()
        }
        this.textures = textures
        this.setPos(x, y, z)
    }

    public override render(a: number): void {
        gl.bindTexture(gl.TEXTURE_2D, this.textures.loadTexture("./char.png"))
        matrix.push()
        let brightness = this.getBrightness(a)
        shader.setColor(brightness, brightness, brightness)
        let time = performance.now() / 1000 * 10 * this.speed + this.timeOffs
        let size = 0.058333334
        let yy = (-Math.abs(Math.sin(time * 0.6662)) * 5 - 23)
        matrix.translate(this.xo + (this.x - this.xo) * a, this.yo + (this.y - this.yo) * a, this.zo + (this.z - this.zo) * a)
        matrix.scale(1, -1, 1)
        matrix.scale(size, size, size)
        matrix.translate(0, yy, 0)
        let c = 57.29578
        matrix.rotate(this.rot * c + 180, 0, 1, 0)
        Zombie.zombieModel?.render(time)
        shader.setColor(1, 1, 1)
        matrix.pop()
    }
}