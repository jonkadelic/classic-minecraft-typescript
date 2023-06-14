import { Keyboard, Keys, Mouse, MouseButton } from "syncinput";
import { Timer } from "./Timer";
import { Level } from "./level/Level";
import { LevelRenderer } from "./level/LevelRenderer";
import { Player } from "./Player";
import { ParticleEngine } from "./particle/ParticleEngine";
import { Entity } from "./Entity";
import { Textures } from "./renderer/Textures";
import { HitResult } from "./HitResult";
import { AABB } from "./phys/AABB";
import { Chunk } from "./level/Chunk";
import { Tile } from "./level/tile/Tile";
import { Matrix } from "../../util/Matrix";
import { Frustum } from "./renderer/Frustum";
import { Shader } from "../../../shader";
import { Tiles } from "./level/tile/Tiles";
import { Vec3 } from "./phys/Vec3";
import { RenderBuffer } from "../../util/RenderBuffer";
import { Tesselator } from "./renderer/Tesselator";
import { Font } from "./gui/Font";

export let gl: WebGLRenderingContext
export let mouse: any
export let keyboard: any
export let matrix = new Matrix()
export let shader: Shader = null


export class Minecraft {
    public static readonly VERSION_STRING = "0.0.11a"
    private width: number
    private height: number
    private fogColor0: number[] = new Array(4)
    private fogColor1: number[] = new Array(4)
    private timer: Timer = new Timer(20)
    private level: Level = null
    private levelRenderer: LevelRenderer = null
    private player: Player = null
    private paintTexture: number = 1
    private particleEngine: ParticleEngine = null
    private entities: Entity[] = []
    private parent: HTMLCanvasElement
    public pause: boolean = false
    private yMouseAxis: number = -1
    public textures: Textures
    public font: Font
    private editMode: number = 0
    private running: boolean = false
    private fpsString: string = ""
    private mouseGrabbed: boolean = false
    private hitResult: HitResult = null

    private frames: number = 0
    private lastTime: number = 0

    private mouse0: boolean = false
    private mouse1: boolean = false

    private guiBuffer: RenderBuffer = new RenderBuffer(gl.DYNAMIC_DRAW)

    public constructor(parent: HTMLCanvasElement, width: number, height: number) {
        this.parent = parent
        this.width = width
        this.height = height
        this.textures = new Textures()

        mouse = new Mouse()
        keyboard = new Keyboard()
    }

    public init(): void {
        fetch("shader/base.vert")
            .then(response => response.text())
            .then(text => {
                fetch("shader/base.frag")
                    .then(response => response.text())
                    .then(text2 => {
                        shader = new Shader(text, text2)
                    })
            })

        this.fogColor0 = [0xFE / 0xFF, 0xFB / 0xFF, 0xFA / 0xFF, 1.0]
        this.fogColor1 = [0x0E / 0xFF, 0x0B / 0xFF, 0x0A / 0xFF, 1.0]
        let fr = 0.5
        let fg = 0.8
        let fb = 1.0
        this.checkGlError("Pre startup")
        gl.clearColor(fr, fg, fb, 1.0)
        gl.clearDepth(1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        matrix.setActive(Matrix.PROJECTION)
        matrix.loadIdentity()
        matrix.setActive(Matrix.MODELVIEW)
        this.checkGlError("Startup")
        this.font = new Font("./default.png", this.textures)
        this.level = new Level(256, 256, 64)
        this.levelRenderer = new LevelRenderer(this.level, this.textures)
        this.player = new Player(this.level)
        this.particleEngine = new ParticleEngine(this.level, this.textures)
        this.checkGlError("Post startup")

        window.onunload = () => {
            this.destroy()
        }
    }

    private checkGlError(string: string): void {
        let errorCode = gl.getError()
        if (errorCode !== gl.NO_ERROR) {
            let errorString = ""
            console.log("########## GL ERROR ##########")
            console.log("@ " + string)
            console.log(errorCode + ": " + errorString)
        }
    }

    public destroy(): void {
        this.level?.save()
    }

    public run(): void {
        this.running = true
        this.init()
        this.frames = 0
        this.lastTime = Date.now()

        this.loop()
    }

    private loop(): void {
        if (this.running) {
            if (this.pause) {
                requestAnimationFrame(() => this.loop())
                return
            }
            this.timer.advanceTime()
            for (let i = 0; i < this.timer.ticks; i++) {
                this.tick()
            }
            this.checkGlError("Pre render")
            this.render(this.timer.a)
            this.checkGlError("Post render")
            this.frames++
            while (Date.now() >= this.lastTime + 1000) {
                this.fpsString = this.frames + " fps, " + Chunk.updates + " chunk updates"
                Chunk.updates = 0
                this.lastTime += 1000
                this.frames = 0
            }
            requestAnimationFrame(() => this.loop())
        } else {
            this.destroy()
        }
    }

    public stop(): void {
        this.running = false
    }

    public grabMouse(): void {
        if (this.mouseGrabbed) return
        this.mouseGrabbed = true
        this.parent.requestPointerLock()
    }

    private handleMouseClick(click: number): void {
        if (click == 0) {
            if (this.hitResult != null) {
                let oldTile: Tile = Tile.tiles[this.level.getTile(this.hitResult.x, this.hitResult.y, this.hitResult.z)]
                let changed = this.level.setTile(this.hitResult.x, this.hitResult.y, this.hitResult.z, 0)
                if (oldTile != null && changed) {
                    oldTile.destroy(this.level, this.hitResult.x, this.hitResult.y, this.hitResult.z, this.particleEngine)
                }
            }
        } else if (click == 1 && this.hitResult != null) {
            let aabb: AABB;
            let x = this.hitResult.x
            let y = this.hitResult.y
            let z = this.hitResult.z
            if (this.hitResult.f == 0) {
                y--
            }
            if (this.hitResult.f == 1) {
                y++
            }
            if (this.hitResult.f == 2) {
                z--
            }
            if (this.hitResult.f == 3) {
                z++
            }
            if (this.hitResult.f == 4) {
                x--
            }
            if (this.hitResult.f == 5) {
                x++
            }
            if ((aabb = Tile.tiles[this.paintTexture].getAABB(x, y, z)) == null || this.isFree(aabb)) {
                this.level.setTile(x, y, z, this.paintTexture)
            }
        }
    }

    public tick(): void {
        keyboard.update()
        this.mouseGrabbed = document.pointerLockElement == this.parent
        mouse.setLock(this.mouseGrabbed)
        if (!this.mouseGrabbed && (mouse.buttonPressed(MouseButton.LEFT) || mouse.buttonPressed(MouseButton.RIGHT))) {
            this.grabMouse()
            this.mouse0 = true
            this.mouse1 = true
            return
        }
        if (this.mouseGrabbed) {
            // Mouse
            if (mouse.buttonPressed(MouseButton.LEFT)) {
                if (!this.mouse0) {
                    this.mouse0 = true
                    this.handleMouseClick(0)
                }
            } else {
                this.mouse0 = false
            }
            if (mouse.buttonPressed(MouseButton.RIGHT)) {
                if (!this.mouse1) {
                    this.mouse1 = true
                    this.handleMouseClick(1)
                }
            } else {
                this.mouse1 = false
            }

            // Keyboard
            if (keyboard.keyJustPressed(Keys.ENTER)) {
                this.level.save()
            }
            if (keyboard.keyJustPressed(Keys.NUM1)) {
                this.paintTexture = Tiles.rock.id
            }
            if (keyboard.keyJustPressed(Keys.NUM2)) {
                this.paintTexture = Tiles.dirt.id
            }
            if (keyboard.keyJustPressed(Keys.NUM3)) {
                this.paintTexture = Tiles.stoneBrick.id
            }
            if (keyboard.keyJustPressed(Keys.NUM4)) {
                this.paintTexture = Tiles.bush.id
            }
            if (keyboard.keyJustPressed(Keys.NUM5)) {
                this.paintTexture = Tiles.wood.id
            }
            if (keyboard.keyJustPressed(Keys.Y)) {
                this.yMouseAxis *= -1
            }
        }
        this.level.tick()
        this.particleEngine.tick()
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].tick()
            if (this.entities[i].removed) {
                this.entities.splice(i--, 1)
            }
        }
        this.player.tick()
    }

    private isFree(aabb: AABB): boolean {
        if (this.player.bb.intersects(aabb)) {
            return false
        }
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].bb.intersects(aabb)) {
                return false
            }
        }
        return true
    }

    private moveCameraToPlayer(a: number): void {
        matrix.translate(0, 0, -0.3)
        matrix.rotate(this.player.xRot, 1, 0, 0)
        matrix.rotate(this.player.yRot, 0, 1, 0)
        let x = this.player.xo + (this.player.x - this.player.xo) * a
        let y = this.player.yo + (this.player.y - this.player.yo) * a
        let z = this.player.zo + (this.player.z - this.player.zo) * a
        matrix.translate(-x, -y, -z)
    }

    private setupCamera(a: number): void {
        matrix.setActive(Matrix.PROJECTION)
        matrix.loadIdentity()
        matrix.perspective(90, this.width / this.height, 0.05, 1000)
        matrix.setActive(Matrix.MODELVIEW)
        matrix.loadIdentity()
        this.moveCameraToPlayer(a)
    }

    private pick(a: number): void {
        let yRot = this.player.yRot
        let xRot = this.player.xRot
        let cosY = Math.cos(-yRot * Math.PI / 180 - Math.PI)
        let sinY = Math.sin(-yRot * Math.PI / 180 - Math.PI)
        let cosX = Math.cos(-xRot * Math.PI / 180)
        let sinX = Math.sin(-xRot * Math.PI / 180)
        let pickRange = 5.0
        let offsetX = sinY * cosX
        let offsetY = sinX
        let offsetZ = cosY * cosX
        let playerVec = new Vec3(this.player.x, this.player.y, this.player.z)
        let endVec = playerVec.add(offsetX * pickRange, offsetY * pickRange, offsetZ * pickRange)
        this.hitResult = this.level.clip(playerVec, endVec)
    }

    public render(a: number): void {
        gl.viewport(0, 0, this.width, this.height)
        if (this.mouseGrabbed) {
            let xo = 0.0
            let yo = 0.0
            xo = mouse.delta.x
            yo = mouse.delta.y
            if (Math.abs(xo) < 100)
            {
                this.player.turn(xo, yo * this.yMouseAxis)
            }
        }
        this.checkGlError("Set viewport")
        this.pick(a)
        this.checkGlError("Picked")
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        this.setupCamera(a)
        this.checkGlError("Set up camera")
        gl.enable(gl.CULL_FACE)
        let frustum = Frustum.getFrustum()
        this.levelRenderer.updateDirtyChunks(this.player)
        this.checkGlError("Update chunks")
        this.setupFog(0)
        this.levelRenderer.render(this.player, 0)
        this.checkGlError("Rendered level")
        for (let i = 0; i < this.entities.length; i++) {
            let entity = this.entities[i]
            if (entity.isLit() && frustum.isVisible(entity.bb)) {
                entity.render(a)
            }
        }
        this.checkGlError("Rendered entities")
        this.particleEngine.render(this.player, a, 0)
        this.checkGlError("Rendered particles")
        this.setupFog(1)
        this.particleEngine.render(this.player, a, 1)
        this.checkGlError("Rendered rest")
        if (this.hitResult != null) {
            this.levelRenderer.renderHit(this.hitResult, this.editMode, this.paintTexture)
        }
        this.checkGlError("Rendered hit")
        this.drawGui(a)
        this.checkGlError("Rendered gui")
        mouse.update()

    }

    private drawGui(a: number): void {
        let screenWidth = Math.floor(this.width * 240 / this.height)
        let screenHeight = Math.floor(this.height * 240 / this.height)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        matrix.setActive(Matrix.PROJECTION)
        matrix.loadIdentity()
        matrix.ortho(0, screenWidth, screenHeight, 0, 100, 300)
        matrix.setActive(Matrix.MODELVIEW)
        matrix.loadIdentity()
        matrix.translate(0, 0, -200)
        this.checkGlError("GUI: Init")
        matrix.push()
        matrix.translate(screenWidth - 16, 16, 0)
        let t = Tesselator.instance
        matrix.scale(16, 16, 16)
        matrix.rotate(30, 1, 0, 0)
        matrix.rotate(45, 0, 1, 0)
        matrix.translate(-1.5, 0.5, -0.5)
        matrix.scale(-1.0, -1.0, 1.0)
        let id = this.textures.loadTexture("./terrain.png", gl.NEAREST)
        gl.bindTexture(gl.TEXTURE_2D, id)
        t.init()
        t.color_f(1, 1, 1)
        Tile.tiles[this.paintTexture].render(t, this.level, 0, -2, 0, 0)
        t.flush(this.guiBuffer)
        matrix.applyUniforms()
        this.guiBuffer.draw()
        matrix.pop()
        this.checkGlError("GUI: Draw selected")
        this.font.drawShadow(Minecraft.VERSION_STRING, 2, 2, 0xFFFFFF)
        this.font.drawShadow(this.fpsString, 2, 12, 0xFFFFFF)
        this.checkGlError("GUI: Draw text")
        let wc = Math.floor(screenWidth / 2)
        let hc = Math.floor(screenHeight / 2)
        t.init()
        t.vertex(wc + 1, hc - 4, 0.0);
        t.vertex(wc - 0, hc - 4, 0.0);
        t.vertex(wc - 0, hc + 5, 0.0);
        
        t.vertex(wc - 0, hc + 5, 0.0);
        t.vertex(wc + 1, hc + 5, 0.0);
        t.vertex(wc + 1, hc - 4, 0.0);
        
        t.vertex(wc + 5, hc - 0, 0.0);
        t.vertex(wc - 4, hc - 0, 0.0);
        t.vertex(wc - 4, hc + 1, 0.0);
        
        t.vertex(wc - 4, hc + 1, 0.0);
        t.vertex(wc + 5, hc + 1, 0.0);
        t.vertex(wc + 5, hc - 0, 0.0);
        t.flush(this.guiBuffer);
        matrix.applyUniforms();
        this.guiBuffer.draw();
        this.checkGlError("GUI: Draw crosshair")
    }

    private setupFog(i: number): void {
        if (shader == null) return
        shader.use()
        if (i == 0) {
            gl.uniform1f(shader.getUniformLocation("uFogDensity"), 0.001)
            gl.uniform4fv(shader.getUniformLocation("uFogColor"), this.fogColor0)
        } else if (i == 1) {
            gl.uniform1f(shader.getUniformLocation("uFogDensity"), 0.01)
            gl.uniform4fv(shader.getUniformLocation("uFogColor"), this.fogColor1)
        }
    }

    public static checkError(): void {
        // TODO
    }
}

export function main() {
    const canvas = document.createElement("canvas")
    canvas.width = window.innerWidth * 0.9
    canvas.height = window.innerHeight * 0.9
    document.body.appendChild(canvas)

    let g = canvas.getContext("webgl", {antialias: false})
    if (!g) throw new Error("Failed to get WebGL context")
    gl = g

    const minecraft = new Minecraft(canvas, canvas.width, canvas.height)
    minecraft.run()
}
