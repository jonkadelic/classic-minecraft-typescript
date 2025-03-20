import { RenderBuffer } from "../../../util/RenderBuffer";
import { gl, shader } from "../Minecraft";
import { Player } from "../player/Player";
import { Level } from "../level/Level";
import { Tesselator } from "../renderer/Tesselator";
import { Textures } from "../renderer/Textures";
import { Particle } from "./Particle";

export class ParticleEngine {
    protected level: Level
    private particles: Particle[] = []
    private textures: Textures
    private buffer: RenderBuffer

    public constructor(level: Level, textures: Textures) {
        this.level = level
        this.textures = textures
        this.buffer = new RenderBuffer(gl.DYNAMIC_DRAW)
    }

    public add(particle: Particle): void {
        this.particles.push(particle)
    }

    public tick(): void {
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i]
            p.tick()
            if (p.removed) {
                this.particles.splice(i--, 1)
            }
        }
    }

    public render(player: Player, a: number): void {
        if (this.particles.length === 0) return
        gl.bindTexture(gl.TEXTURE_2D, this.textures.loadTexture("./terrain.png"))
        let xa = -(Math.cos(player.yRot * Math.PI / 180))
        let za = -Math.sin(player.yRot * Math.PI / 180)
        let xa2 = -za * Math.sin(player.xRot * Math.PI / 180)
        let za2 = xa * Math.sin(player.xRot * Math.PI / 180)
        let ya =  Math.cos(player.xRot * Math.PI / 180)
        let t = Tesselator.instance
        t.begin()
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i]
            p.renderParticle(t, a, xa, ya, za, xa2, za2)
        }
        t.end(this.buffer)
        this.buffer.draw()
    }

    public setLevel(level: Level): void {
        this.level = level

        // todo
    }
}