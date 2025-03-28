import { gl, matrix, Minecraft, shader } from "../Minecraft";
import { Matrix } from "../../../util/Matrix";
import { ItemInHandRenderer } from "./ItemInHandRenderer";
import { Entity } from "../Entity";
import { Random } from "../../../util/Random";
import { MouseEvents } from "../input/MouseEvents";
import { RenderBuffer } from "../../../util/RenderBuffer";
import { Vec3 } from "../character/Vec3";
import { Mth } from "../../../util/Mth";
import { CreativeMode } from "../gamemode/CreativeMode";
import { AABB } from "../phys/AABB";
import { HitResult } from "../HitResult";
import { Tile } from "../level/tile/Tile";
import { Material } from "../level/material/Material";
import { Frustum } from "./Frustum";
import { Tesselator } from "./Tesselator";
import { Textures } from "./Textures";

export class GameRenderer {
    public mc: Minecraft
    public fogMultiplier: number = 1.0
    public isDisplayActive: boolean = false
    public renderDistance: number = 0.0
    public itemInHandRenderer: ItemInHandRenderer
    public tick: number = 0
    public hovered: Entity | null = null
    public random: Random = new Random()
    public xMod: number = 0
    public yMod: number = 0
    public lb: number[] = new Array(16)
    public fr: number = 0
    public fg: number = 0
    public fb: number = 0

    private guiBuffer: RenderBuffer = new RenderBuffer(gl.DYNAMIC_DRAW)

    public constructor(mc: Minecraft) {
        this.mc = mc
        this.itemInHandRenderer = new ItemInHandRenderer(mc)
    }

    public getPos(a: number): Vec3 {
        let player = this.mc.player!

        let x = player.xo + (player.x - player.xo) * a
        let y = player.yo + (player.y - player.yo) * a
        let z = player.zo + (player.z - player.zo) * a

        return new Vec3(x, y, z)
    }

    public tick_(): void {
        this.tick++
        this.itemInHandRenderer.tick()

        // todo - rain
    }

    public setLighting(enabled: boolean): void {
        if (!enabled) {
            shader.setLight(false)
        } else {
            shader.setLight(true)
            matrix.applyLightUniforms();
            
            let a = 0.7
            let d = 0.3

            let l = new Vec3(0.0, -1.0, 0.5).normalize()

            shader.setLightPosition(l.x, l.y, l.z)
            shader.setLightDiffuse(d, d, d, 1.0)
            shader.setLightAmbient(0.0, 0.0, 0.0, 1.0)
            shader.setSceneAmbient(a, a, a, 1.0)
        }
    }

    public pick(a: number): void {
        let player = this.mc.player!
        let xRot = player.xRotO + (player.xRot - player.xRotO) * a
        let yRot = player.yRotO + (player.yRot - player.yRotO) * a
        let lerpedPos = this.getPos(a)
        let var27 = Mth.cos(-yRot * (Math.PI / 180.0) - Math.PI)
        let var94 = Mth.sin(-yRot * (Math.PI / 180.0) - Math.PI)
        let var112 = Mth.cos(-xRot * (Math.PI / 180.0))
        let dy = Mth.sin(-xRot * (Math.PI / 180.0))
        let dx = var94 * var112
        let dz = var27 * var112
        let pickRange = this.mc.gameMode.getPickRange()
        let offsetPos = lerpedPos.add(dx * pickRange, dy * pickRange, dz * pickRange)
        this.mc.hitResult = this.mc.level!.clip(lerpedPos, offsetPos)

        let pickDistance = pickRange
        if (this.mc.hitResult != null) {
            pickDistance = this.mc.hitResult.pos!.distanceTo(lerpedPos)
        }

        if (this.mc.gameMode instanceof CreativeMode) {
            pickRange = 32.0
        } else {
            pickRange = pickDistance
        }

        offsetPos = lerpedPos.add(dx * pickRange, dy * pickRange, dz * pickRange)
        this.hovered = null
        let entities = this.mc.level!.blockMap!.getEntities__(player, player.bb.expand(dx * pickRange, dy * pickRange, dz * pickRange))
        if (entities == null) {
            return
        }
        let minDistance = 0.0

        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i]
            if (entity.isPickable()) {
                let pickRadius = 0.1
                let aabbRadius = entity.bb.grow(pickRadius, pickRadius, pickRadius)
                let entityHit = aabbRadius.clip(lerpedPos, offsetPos)
                if (entityHit != null) {
                    let distance = lerpedPos.distanceTo(entityHit.pos!)
                    if (distance < minDistance || minDistance == 0.0) {
                        this.hovered = entity
                        minDistance = distance
                    }
                }
            }
        }

        if (this.hovered != null && !(this.mc.gameMode instanceof CreativeMode)) {
            this.mc.hitResult = HitResult.fromEntity(this.hovered)
        }
    }

    private bobHurt(a: number): void {
        let player = this.mc.player!
        let hurtTime = player.hurtTime - a
        if (player.health <= 0) {
            let deathTime = player.deathTime + a
            matrix.rotate(40.0 - 8000.0 / (deathTime + 200.0), 0.0, 0.0, 1.0)
        }

        if (!(hurtTime < 0.0)) {
            let hurtPercentage = hurtTime / player.hurtDuration
            let hurtRot = Mth.sin(hurtPercentage * hurtPercentage * hurtPercentage * hurtPercentage * Math.PI)
            let hurtDir = player.hurtDir
            matrix.rotate(-player.hurtDir, 0.0, 1.0, 0.0)
            matrix.rotate(-hurtRot * 14.0, 0.0, 0.0, 1.0)
            matrix.rotate(hurtDir, 0.0, 1.0, 0.0)
        }
    }

    private bobView(a: number): void {
        let player = this.mc.player!

        let walkDist = player.walkDist + (player.walkDist - player.walkDistO) * a;
        let bob = player.oBob + (player.bob - player.oBob) * a;
        let tilt = player.oTilt + (player.tilt - player.oTilt) * a;

        matrix.translate(Mth.sin(walkDist * Math.PI) * bob * 0.5, -Math.abs(Mth.cos(walkDist * Math.PI) * bob), 0.0);
        matrix.rotate(Mth.sin(walkDist * Math.PI) * bob * 3.0, 0.0, 0.0, 1.0);
        matrix.rotate(Math.abs(Mth.cos(walkDist * Math.PI + 0.2) * bob) * 5.0, 1.0, 0.0, 0.0);
        matrix.rotate(tilt, 1.0, 0.0, 0.0);
    }

    private moveCameraToPlayer(a: number): void {
        let player = this.mc.player!

        matrix.translate(0.0, 0.0, -0.1)
        matrix.rotate(player.xRotO + (player.xRot - player.xRotO) * a, 1.0, 0.0, 0.0)
        matrix.rotate(player.yRotO + (player.yRot - player.yRotO) * a, 0.0, 1.0, 0.0)

        let x = player.xo + (player.x - player.xo) * a
        let y = player.yo + (player.y - player.yo) * a
        let z = player.zo + (player.z - player.zo) * a

        matrix.translate(-x, -y, -z)
    }

    private setupCamera(a: number): void {
        this.renderDistance = (512 >> (this.mc.options.viewDistance << 1))
        matrix.setActive(Matrix.PROJECTION)
        matrix.loadIdentity()

        let player = this.mc.player!
        let fov = 70.0
        if (player.health <= 0) {
            let deathTime = player.deathTime + a
            fov /= (1.0 - 500.0 / (deathTime + 500.0)) * 2.0 + 1.0
        }

        matrix.perspective(fov, this.mc.width / this.mc.height, 0.05, this.renderDistance)

        matrix.setActive(Matrix.MODELVIEW)
        matrix.loadIdentity()

        this.bobHurt(a)
        if (this.mc.options.bobView) {
            this.bobView(a)
        }

        this.moveCameraToPlayer(a)
    }

    public render(a: number): void {
        if (!shader.isLoaded()) {
            return
        }

        if (this.isDisplayActive && !this.mc.isDisplayActive()) {
            this.mc.pauseGame()
        }

        this.isDisplayActive = this.mc.isDisplayActive()
        if (this.mc.mouseGrabbed) {
            let dx = MouseEvents.getDX()
            let dy = MouseEvents.getDY()

            let mult = -1
            if (this.mc.options.invertYMouse) {
                mult = 1
            }

            this.mc.player!.turn(dx, dy * mult)
        }

        if (!this.mc.noRender) {
            let xAspect = Math.trunc(this.mc.width * 240 / this.mc.height)
            let yAspect = Math.trunc(this.mc.height * 240 / this.mc.height)
            let mx = MouseEvents.getX() * xAspect / this.mc.width
            let my = MouseEvents.getY() * yAspect / this.mc.height
            if (this.mc.level != null) {
                this.renderLevel(a)

                this.mc.gui.render(this.guiBuffer, a, this.mc.screen != null, mx, my)
            } else {
                gl.viewport(0, 0, this.mc.width, this.mc.height)
                matrix.setActive(Matrix.MODELVIEW)
                matrix.loadIdentity()
                matrix.setActive(Matrix.PROJECTION)
                matrix.loadIdentity()
                this.setupGuiScreen()
            }

            if (this.mc.screen != null) {
                gl.clear(gl.DEPTH_BUFFER_BIT)
                this.mc.screen.render(this.guiBuffer, mx, my)
            }
        }

    }

    public renderLevel(a: number): void {
        this.pick(a)

        let player = this.mc.player
        if (player == null) {
            return
        }
        let level = this.mc.level
        if (level == null) {
            return
        }
        let levelRenderer = this.mc.levelRenderer
        let particleEngine = this.mc.particleEngine

        gl.viewport(0, 0, this.mc.width, this.mc.height)

        this.setupClearColor(a)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        this.fogMultiplier = 1.0

        gl.enable(gl.CULL_FACE)

        this.setupCamera(a)

        let frustum = Frustum.getFrustum()
        levelRenderer.cull(frustum)
        levelRenderer.updateDirtyChunks(player)

        this.setupFog()
        shader.setFog(true)
        gl.bindTexture(gl.TEXTURE_2D, levelRenderer.textures.loadTexture("./terrain.png"))
        levelRenderer.render(player, 0)

        if (level.isSolid(player.x, player.y, player.z, 0.1)) {
            let x = Math.trunc(player.x)
            let y = Math.trunc(player.y)
            let z = Math.trunc(player.z)

            for (let xx = x - 1; xx <= x + 1; xx++) {
                for (let yy = y - 1; yy <= y + 1; yy++) {
                    for (let zz = z - 1; zz <= z + 1; zz++) {
                        let tileId = level.getTile(xx, yy, zz)
                        if (tileId != 0 && Tile.tiles[tileId].isSolidRender()) {
                            shader.setColor(0.2, 0.2, 0.2, 1.0)
                            gl.depthFunc(gl.LESS)

                            let t = Tesselator.instance
                            t.begin()

                            for (let f = 0; f < 6; f++) {
                                Tile.tiles[tileId].renderFace(t, xx, yy, zz, f)
                            }

                            t.end(this.guiBuffer)

                            gl.cullFace(gl.FRONT)

                            t.begin()

                            for (let f = 0; f < 6; f++) {
                                Tile.tiles[tileId].renderFace(t, xx, yy, zz, f)
                            }

                            t.end(this.guiBuffer)

                            gl.cullFace(gl.BACK)
                            gl.depthFunc(gl.LEQUAL)
                        }
                    }
                }
            }
        }

        this.setLighting(true)
        let lerpedPos = this.getPos(a)
        if (levelRenderer.level != null && levelRenderer.level.blockMap != null) {
            levelRenderer.level.blockMap.render(lerpedPos, frustum, levelRenderer.textures, a)
        }
        this.setLighting(false)
        this.setupFog()

        particleEngine.render(player, a)

        gl.bindTexture(gl.TEXTURE_2D, levelRenderer.textures.loadTexture("./rock.png"))
        // todo: figure out what this is. Minecraft.java line 682
        this.setupFog()

        levelRenderer.renderClouds(a)

        this.setupFog()
        if (this.mc.hitResult != null) {
            // disable alpha test
            levelRenderer.renderHit(player, this.mc.hitResult, 0, player.inventory.getSelected(), a)
            levelRenderer.renderHitOutline(this.mc.hitResult, 0)
            // enable alpha test
        }

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        this.setupFog()
        gl.enable(gl.BLEND)
        gl.bindTexture(gl.TEXTURE_2D, levelRenderer.textures.loadTexture("./water.png"))
        // todo: figure out what this is. Minecraft.java line 850
        gl.disable(gl.BLEND)

        gl.enable(gl.BLEND)
        gl.bindTexture(gl.TEXTURE_2D, levelRenderer.textures.loadTexture("./terrain.png"))
        levelRenderer.render(player, 1)

        gl.depthMask(true)
        gl.disable(gl.BLEND)
        shader.setFog(false)
        if (this.mc.isRaining) {
            this.renderRain(a)
        }

        if (this.hovered != null) {
            this.hovered.renderHover(this.mc.textures, a)
        }

        gl.clear(gl.DEPTH_BUFFER_BIT)
        matrix.loadIdentity()

        this.bobHurt(a)
        if (this.mc.options.bobView) {
            this.bobView(a)
        }

        this.itemInHandRenderer.render(a)
    }

    private tickRain(): void {

    }

    protected renderRain(a: number): void {
        // todo: minecraft.java line 873
    }

    public setupGuiScreen(): void {
        let screenWidth = this.mc.width * 240 / this.mc.height
        let screenHeight = this.mc.height * 240 / this.mc.height
        gl.clear(gl.DEPTH_BUFFER_BIT)
        matrix.setActive(Matrix.PROJECTION)
        matrix.loadIdentity()
        matrix.ortho(0, screenWidth, screenHeight, 0, 100, 300)
        matrix.setActive(Matrix.MODELVIEW)
        matrix.loadIdentity()
        matrix.translate(0, 0, -200)
    }

    private setupClearColor(a: number): void {
        let level = this.mc.level!
        let player = this.mc.player!

        let viewDistance = 1.0 / (4 - this.mc.options.viewDistance)
        viewDistance = 1.0 - Math.pow(viewDistance, 0.25)

        let sr = (level.skyColor >> 16 & 0xFF) / 255.0
        let sg = (level.skyColor >> 8 & 0xFF) / 255.0
        let sb = (level.skyColor >> 0 & 0xFF) / 255.0
        this.fr = (level.fogColor >> 16 & 0xFF) / 255.0
        this.fg = (level.fogColor >> 8 & 0xFF) / 255.0
        this.fb = (level.fogColor >> 0 & 0xFF) / 255.0

        this.fr = this.fr + (sr - this.fr) * viewDistance
        this.fg = this.fg + (sg - this.fg) * viewDistance
        this.fb = this.fb + (sb - this.fb) * viewDistance

        this.fr *= this.fogMultiplier
        this.fg *= this.fogMultiplier
        this.fb *= this.fogMultiplier

        let tile = Tile.tiles[level.getTile(Math.trunc(player.x), Math.trunc(player.y + 0.12), Math.trunc(player.z))]
        if (tile != null && tile.getMaterial() != Material.none) {
            let material = tile.getMaterial()
            if (material == Material.water) {
                this.fr = 0.02
                this.fg = 0.02
                this.fb = 0.2
            } else if (material == Material.lava) {
                this.fr = 0.6
                this.fg = 0.1
                this.fb = 0.0
            }
        }

        gl.clearColor(this.fr, this.fg, this.fb, 1.0)
    }

    private setupFog(): void {
        let level = this.mc.level!
        let player = this.mc.player!

        shader.setFogColor(this.fr, this.fg, this.fb, 1.0)

        let tile = Tile.tiles[level.getTile(Math.trunc(player.x), Math.trunc(player.y + 0.12), Math.trunc(player.z))]
        if (tile != null && tile.getMaterial() != Material.none) {
            let material = tile.getMaterial()
            // todo - set exp fog
            if (material == Material.water) {
                // todo
            } else if (material == Material.lava) {
                // todo
            }
        } else {
            // todo - set linear fog
            shader.setFogDistance(0.0, this.renderDistance)
        }
    }

    public updateAllChunks(): void {
    }
}