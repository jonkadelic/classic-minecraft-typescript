import { Mouse, MouseButton } from "syncinput";
import { Timer } from "./Timer";
import { Level } from "./level/Level";
import { LevelRenderer } from "./renderer/LevelRenderer";
import { Player } from "./player/Player";
import { ParticleEngine } from "./particle/ParticleEngine";
import { Entity } from "./Entity";
import { Textures } from "./renderer/Textures";
import { HitResult } from "./HitResult";
import { AABB } from "./phys/AABB";
import { Chunk } from "./renderer/Chunk";
import { Tile } from "./level/tile/Tile";
import { Matrix } from "../../util/Matrix";
import { Frustum } from "./renderer/Frustum";
import { Shader } from "../../../shader";
import { Vec3 } from "./character/Vec3";
import { RenderBuffer } from "../../util/RenderBuffer";
import { Tesselator } from "./renderer/Tesselator";
import { Font } from "./gui/Font";
import { Zombie } from "./character/Zombie";
import { Screen } from "./gui/Screen";
import { PauseScreen } from "./gui/PauseScreen";
import { MouseEvents } from "./input/MouseEvents";
import { KeyboardInput } from "./player/KeyboardInput";
import { SelectBlockScreen } from "./gui/BlockSelectScreen";
import { GameRenderer } from "./renderer/GameRenderer";
import { User } from "./User";
import { Gui } from "./gui/Gui";
import { Options } from "./Options";
import { Key, Keyboard } from "../../util/input/Keyboard";
import { LevelGenerator } from "./level/levelgen/RandomLevelSource";
import { WaterTexture } from "./renderer/ptexture/WaterTexture";
import { LavaTexture } from "./renderer/ptexture/LavaTexture";
import { GameMode } from "./gamemode/GameMode";
import { CreativeMode } from "./gamemode/CreativeMode";

export let gl: WebGLRenderingContext
export let mouse: any
export let keyboard: Keyboard
export let matrix = new Matrix()
export let shader: Shader = new Shader()
export let clickedElement: HTMLElement | null = null

export class Minecraft {
    public static readonly VERSION_STRING = "0.30"
    public gameMode: GameMode = new CreativeMode(this)
    public width: number
    public height: number
    private fogColor: number[] = new Array(4)
    private timer: Timer = new Timer(20)
    public level: Level | null = null
    // @ts-ignore
    public levelRenderer: LevelRenderer
    public player: Player | null = null
    // @ts-ignore
    public particleEngine: ParticleEngine
    public user: User | null = null
    private entities: Entity[] = []
    private parent: HTMLCanvasElement
    public paused: boolean = false
    private yMouseAxis: number = -1
    public textures: Textures
    // @ts-ignore
    public font: Font
    public screen: Screen | null = null
    public gameRenderer: GameRenderer = new GameRenderer(this)
    private ticks: number = 0
    // @ts-ignore
    public gui: Gui
    public noRender: boolean = false
    private running: boolean = false
    public fpsString: string = ""
    public mouseGrabbed: boolean = false
    public hitResult: HitResult | null = null
    // @ts-ignore
    public options: Options
    public isRaining: boolean = false
    
    private frames: number = 0
    private lastTime: number = 0

    public constructor(parent: HTMLCanvasElement, width: number, height: number) {
        this.parent = parent
        this.width = width
        this.height = height
        this.textures = new Textures()
        this.textures.preloadTextures()

        mouse = new Mouse(parent)
        mouse.setCanvas(parent)
        keyboard = new Keyboard()
    }

    public isDisplayActive(): boolean {
        return document.pointerLockElement === this.parent
    }

    public init(): void {
        fetch("shader/base.vert")
            .then(response => response.text())
            .then(text => {
                fetch("shader/base.frag")
                    .then(response => response.text())
                    .then(text2 => {
                        shader.init(text, text2)
                    })
            })

        this.fogColor = [0xFF / 0xFF, 0xFF / 0xFF, 0xFF / 0xFF, 1.0]

        this.checkGlError("Pre startup")
        gl.clearDepth(1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.cullFace(gl.BACK)
        matrix.setActive(Matrix.PROJECTION)
        matrix.loadIdentity()
        matrix.setActive(Matrix.MODELVIEW)

        this.checkGlError("Startup")
        this.options = new Options(this)
        this.textures.addDynamicTexture(new WaterTexture())
        this.textures.addDynamicTexture(new LavaTexture())
        this.font = new Font("./default.png", this.textures)

        this.levelRenderer = new LevelRenderer(this, this.textures)
        gl.viewport(0, 0, this.width, this.height)
        if (false /* connectToIp != null && user != null */) {

        } else {
            // todo - minecraft.java line 266

            if (this.level == null) {
                this.createLevel(1)
            }
        }

        this.particleEngine = new ParticleEngine(this.level!, this.textures)

        this.checkGlError("Post startup")

        this.gui = new Gui(this)

        window.onunload = () => {
            this.destroy()
        }
    }

    public updateSize(width: number, height: number): void {
        this.width = width
        this.height = height
        if (this.screen !== null) {
            let screenWidth = Math.trunc(this.width * 240 / this.height)
            let screenHeight = Math.trunc(this.height * 240 / this.height)
            this.screen.init(this, screenWidth, screenHeight)
        }
    }

    public setScreen(screen: Screen | null): void {
        if (this.screen !== null) {
            this.screen.removed()
        }
        // survival death screen would go here
        this.screen = screen
        if (screen !== null) {
            if (this.mouseGrabbed) {
                this.mouseGrabbed = false
                MouseEvents.setGrabbed(false)
            }
            let screenWidth = Math.trunc(this.width * 240 / this.height)
            let screenHeight = Math.trunc(this.height * 240 / this.height)
            screen.init(this, screenWidth, screenHeight)
            // this.online = false;
        } else {
            this.grabMouse()
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
            mouse.update()
            if (this.paused) {
                requestAnimationFrame(() => this.loop())
                return
            }
            MouseEvents.update() // lwjgl
            this.timer.advanceTime()

            for (let i = 0; i < this.timer.ticks; i++) {
                this.ticks++
                this.tick()
            }

            this.checkGlError("Pre render")

            if (!this.noRender) {
                this.gameMode.render(this.timer.a)
                this.gameRenderer.render(this.timer.a)
            }

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
        MouseEvents.setGrabbed(true)
    }

    public pauseGame(): void {
        if (this.screen == null) {
            this.setScreen(new PauseScreen())
        }
    }

    private handleMouseClick(click: number): void {
        if (this.player == null || this.level == null) {
            return
        }

        let selected = this.player.inventory.getSelected()
        if (click == 0) {
            if (this.hitResult != null) {
                let oldTile: Tile = Tile.tiles[this.level.getTile(this.hitResult.x, this.hitResult.y, this.hitResult.z)]
                let changed = this.level.setTile(this.hitResult.x, this.hitResult.y, this.hitResult.z, 0)
                if (oldTile != null && changed) {
                    oldTile.destroy(this.level, this.hitResult.x, this.hitResult.y, this.hitResult.z, this.particleEngine)
                }
            }
            this.gameRenderer.itemInHandRenderer.swing_()
        } else if (click == 1 && this.hitResult != null && selected > 0) {
            let aabb: AABB | null
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
            aabb = Tile.tiles[selected].getAABB(x, y, z)
            if (aabb == null || this.isFree(aabb)) {
                this.level.setTile(x, y, z, selected)
                if (selected != 0) {
                    Tile.tiles[selected].onPlaceByPlayer(this.level, x, y, z)
                }
                this.gameRenderer.itemInHandRenderer.place()
            }
        }
    }

    public tick(): void {
        let oldGrabbed = this.mouseGrabbed
        this.mouseGrabbed = document.pointerLockElement == this.parent
        //mouse.setLock(this.mouseGrabbed) // this wasn't actually doing anything
        /*if (this.screen == null && !this.mouseGrabbed && clickedElement == this.parent && (mouse.buttonPressed(MouseButton.LEFT) || mouse.buttonPressed(MouseButton.RIGHT))) {
            this.grabMouse()
            this.mouse0 = true
            this.mouse1 = true
        } else if (this.mouseGrabbed) {
            
        }*/

        gl.bindTexture(gl.TEXTURE_2D, this.textures.loadTexture("./terrain.png"))
        this.textures.tick()

        if (this.screen == null || this.screen.passEvents) {
            // Mouse
            if (this.screen == null) {
                while (MouseEvents.next()) {
                    if (MouseEvents.getEventDWheel() != 0) {
                        this.player!.inventory.swapPaint(MouseEvents.getEventDWheel())
                    }
                    if (!this.mouseGrabbed && MouseEvents.getEventButtonState() && clickedElement == this.parent) {
                        this.grabMouse();
                    } else {
                        if (MouseEvents.getEventButton() == MouseButton.LEFT && MouseEvents.getEventButtonState()) {
                            this.handleMouseClick(0)
                        }
                        if (MouseEvents.getEventButton() == MouseButton.RIGHT && MouseEvents.getEventButtonState()) {
                            this.handleMouseClick(1)
                        }
                    }
                }
            }

            // Keyboard
            if (!this.mouseGrabbed && this.mouseGrabbed != oldGrabbed) {
                this.pauseGame()
            }
            while (keyboard.next()) {
                this.player!.setKey(keyboard.getEventKey() as Key, keyboard.getEventKeyState() as boolean)
                if (this.screen != null) {
                    this.screen.keyboardEvent()
                }
                if (keyboard.getEventKeyState()) {
                    if (this.screen == null) {
                        if (this.gameMode instanceof CreativeMode) {
                            if (keyboard.getEventKey() == this.options.keyLoadLocation.key) {
                                this.player?.resetPos()
                            }
                            if (keyboard.getEventKey() == this.options.keySaveLocation.key) {
                                this.level?.setSpawnPos(Math.trunc(this.player!.x), Math.trunc(this.player!.y), Math.trunc(this.player!.z), this.player!.yRot)
                                this.player?.resetPos()
                            }
                        }
                        
                        if (keyboard.getEventKey() == Keyboard.KEY_F5) {
                            this.isRaining = !this.isRaining
                        }
                        if (keyboard.getEventKey() == Keyboard.KEY_TAB && false /* todo survival mode - Minecraft.java line 1504 */) {

                        }
                        if (keyboard.getEventKey() == this.options.keyBuild.key) {
                            this.gameMode.openInventory()
                        }
                    }
                    for (let i: number = 0; i < 9; ++i) {
                        if (keyboard.getEventKey() == (i + 1).toString()) {
                            this.player!.inventory.selected = i
                        }
                    }

                    if (keyboard.getEventKey() == this.options.keyFog.key) {
                        this.options.set(4, !keyboard.isKeyDown(Keyboard.KEY_SHIFT) ? 1 : -1)
                    }
                }
            }
        }
        if (this.screen != null) {
            this.screen.updateEvents()
            if (this.screen != null) {
                this.screen.tick()
            }
        }

        if (this.level != null) {
            this.gameRenderer.tick_()
        }

        if (this.level != null) {
            this.levelRenderer.tick()
        }
        
        this.level!.tick()
        this.particleEngine.tick()
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].tick()
            if (this.entities[i].removed) {
                this.entities.splice(i--, 1)
            }
        }
        this.player!.tick()
    }

    private isFree(aabb: AABB): boolean {
        if (this.player!.bb.intersects(aabb)) {
            return false
        }
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].bb.intersects(aabb)) {
                return false
            }
        }
        return true
    }

    public static checkError(): void {
        // TODO
    }

    public hasConnection(): boolean {
        return false
    }

    public createLevel(size: number) {
        let authorName = this.user != null ? this.user.name : "anonymous"
        let level = new LevelGenerator().create(authorName, 128 << size, 128 << size, 64)
        this.gameMode.onSpawn(level)
        this.loadLevel(level)
    }

    public loadLevel(level: Level | null): void {
        this.level = level
        if (level != null) {
            level.initTransient()
            this.gameMode.initLevel(level)
            level.font = this.font
            level.rendererContext = this
            if (!this.hasConnection()) {
                this.player = null
            } else if (this.player != null) {
                this.player.resetPos()
                this.gameMode.initPlayer(this.player)
                if (level != null) {
                    level.player = this.player
                    level.addEntity(this.player)
                }
            }
        }
    
        if (this.player == null) {
            this.player = new Player(level!)
            this.player.resetPos()
            this.gameMode.initPlayer(this.player)
            if (level != null) {
                level.player = this.player
            }
        }

        if (this.player != null) {
            this.player.input = new KeyboardInput(this.options)
            this.gameMode.adjustPlayer(this.player)
        }

        if (this.levelRenderer != null) {
            this.levelRenderer.setLevel(level)
        }

        if (this.particleEngine != null) {
            this.particleEngine.setLevel(level!)
        }
    }
}

export function main() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement

    let g = canvas.getContext("webgl", {antialias: false})
    if (!g) throw new Error("Failed to get WebGL context")
    gl = g

    window.addEventListener("keydown", (e) => {
        if ((e as KeyboardEvent).code == "Space" && clickedElement == canvas) {
            e.preventDefault()
        }
    })

    window.addEventListener("mousedown", (e) => {
        clickedElement = e.target as HTMLElement
    })

    window.addEventListener("wheel", (e) => {
        if (e.deltaY == 0) return
        MouseEvents.wheelUpdated = true
        MouseEvents.wheel -= (e.deltaY > 0 ? 1 : -1)
        MouseEvents.dWheel -= (e.deltaY > 0 ? 1 : -1)
    })

    window.addEventListener("resize", () => {
        if (window.innerHeight == screen.height) {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            canvas.style.position = "fixed"
            canvas.style.left = "0px"
            canvas.style.top = "0px"
        } else {
            canvas.width = 854
            canvas.height = 480
            canvas.style.position = "static"
        }
        console.log("Resized to " + canvas.width + "x" + canvas.height)
        minecraft.updateSize(canvas.width, canvas.height)
    })

    const minecraft = new Minecraft(canvas, canvas.width, canvas.height)
    minecraft.run()
}
