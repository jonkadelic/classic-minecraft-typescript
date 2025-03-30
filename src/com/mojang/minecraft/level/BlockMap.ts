import { Vec3 } from "../phys/Vec3"
import { Entity } from "../Entity"
import { AABB } from "../phys/AABB"
import { Culler } from "../renderer/Culler"
import { Textures } from "../renderer/Textures"

export class BlockMap {
    private width: number
    private depth: number
    private height: number
    private slot: BlockMap$Slot = new BlockMap$Slot(this)
    private slot2: BlockMap$Slot = new BlockMap$Slot(this)
    public entityGrid: Entity[][]
    public all: Entity[] = []
    public tmp: Entity[] = []

    public constructor(width: number, depth: number, height: number) {
        this.width = Math.trunc(width / 16)
        this.depth = Math.trunc(depth / 16)
        this.height = Math.trunc(height / 16)

        if (this.width == 0) {
            this.width = 1
        }
        if (this.depth == 0) {
            this.depth = 1
        }
        if (this.height == 0) {
            this.height = 1
        }

        this.entityGrid = new Array(this.width * this.depth * this.height)

        for (let xx = 0; xx < this.width; xx++) {
            for (let yy = 0; yy < this.depth; yy++) {
                for (let zz = 0; zz < this.height; zz++) {
                    this.entityGrid[(zz * this.depth + yy) * this.width + xx] = []
                }
            }
        }
    }

    public insert(entity: Entity): void {
        this.all.push(entity)
        this.slot.init(entity.x, entity.y, entity.z).add(entity)
        entity.xOld = entity.x
        entity.yOld = entity.y
        entity.zOld = entity.z
        entity.blockMap = this
    }

    public remove(entity: Entity): void {
        this.slot.init(entity.xOld, entity.yOld, entity.zOld).remove(entity)
        this.all.splice(this.all.indexOf(entity))
    }

    public moved(entity: Entity): void {
        let slot: BlockMap$Slot = this.slot.init(entity.xOld, entity.yOld, entity.zOld)
        let slot2: BlockMap$Slot = this.slot2.init(entity.x, entity.y, entity.z)
        if (slot != slot2) {
            slot.remove(entity)
            slot2.add(entity)
            entity.xOld = entity.x
            entity.yOld = entity.y
            entity.zOld = entity.z
        }
    }

    public getEntities(entity: Entity, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): Entity[] {
        this.tmp.length = 0
        return this.getEntities_(entity, x0, y0, z0, x1, y1, z1, this.tmp)
    }

    public getEntities_(entity: Entity, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, entities: Entity[]): Entity[] {
        let slot: BlockMap$Slot = this.slot.init(x0, y0, z0)
        let slot2: BlockMap$Slot = this.slot2.init(x1, y1, z1)

        for (let x: number = slot.xSlot - 1; x <= slot2.xSlot + 1; x++) {
            for (let y: number = slot.ySlot - 1; y <= slot2.ySlot + 1; y++) {
                for (let z: number = slot.zSlot - 1; z <= slot2.zSlot + 1; z++) {
                    if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) {
                        continue
                    }

                    let subList = this.entityGrid[(z * this.depth + y) * this.width + x]
                    for (let i: number = 0; i < subList.length; i++) {
                        let e: Entity = subList[i]
                        if (e == entity || !entity.intersects(x0, y0, z0, x1, y1, z1)) {
                            continue
                        }
                        entities.push(e)
                    }
                }
            }
        }

        return entities
    }

    public removeAllNonCreativeModeEntities(): void {
        for (let x: number = 0; x < this.width; x++) {
            for (let y: number = 0; y < this.depth; y++) {
                for (let z: number = 0; z < this.height; z++) {
                    let subList = this.entityGrid[(z * this.depth + y) * this.width + x]
                    for (let i: number = 0; i < subList.length; i++) {
                        let e: Entity = subList[i]
                        if (e.isCreativeModeAllowed()) continue
                        subList.splice(i--)
                    }
                }
            }
        }
    }

    public getEntities__(entity: Entity, aabb: AABB): Entity[] {
        this.tmp.length = 0
        return this.getEntities_(entity, aabb.x0, aabb.y0, aabb.z0, aabb.x1, aabb.y1, aabb.z1, this.tmp)
    }

    public getEntities___(entity: Entity, aabb: AABB, entities: Entity[]): Entity[] {
        return this.getEntities_(entity, aabb.x0, aabb.y0, aabb.z0, aabb.x1, aabb.y1, aabb.z1, entities)
    }

    public tickAll(): void {
        for (let i: number = 0; i < this.all.length; i++) {
            let entity: Entity = this.all[i]
            entity.tick()
            if (entity.removed) {
                this.all.splice(i--)
                this.slot.init(entity.xOld, entity.yOld, entity.zOld).remove(entity)
                continue
            }
            let xOld = Math.trunc(entity.xOld / 16.0)
            let yOld = Math.trunc(entity.yOld / 16.0)
            let zOld = Math.trunc(entity.zOld / 16.0)
            let x = Math.trunc(entity.x / 16.0)
            let y = Math.trunc(entity.y / 16.0)
            let z = Math.trunc(entity.z / 16.0)
            if (xOld == x && yOld == y && zOld == z) {
                continue
            }
            this.moved(entity)
        }
    }

    public render(lerpedPos: Vec3, culler: Culler, textures: Textures, a: number) {
        
    }

    static access$000(blockMap: BlockMap): number {
        return blockMap.width
    }

    static access$100(blockMap: BlockMap): number {
        return blockMap.depth
    }

    static access$200(blockMap: BlockMap): number {
        return blockMap.height
    }
}

export class BlockMap$Slot {
    xSlot: number = 0
    ySlot: number = 0
    zSlot: number = 0
    private readonly this$0: BlockMap

    public constructor(this$0: BlockMap) {
        this.this$0 = this$0
    }

    public init(x: number, y: number, z: number): BlockMap$Slot {
        this.xSlot = Math.trunc(x / 16.0)
        this.ySlot = Math.trunc(y / 16.0)
        this.zSlot = Math.trunc(z / 16.0)

        if (this.xSlot < 0) {
            this.xSlot = 0
        }
        if (this.ySlot < 0) {
            this.ySlot = 0
        }
        if (this.zSlot < 0) {
            this.zSlot = 0
        }

        if (this.xSlot >= BlockMap.access$000(this.this$0)) {
            this.xSlot = BlockMap.access$000(this.this$0) - 1
        }
        if (this.ySlot >= BlockMap.access$100(this.this$0)) {
            this.ySlot = BlockMap.access$100(this.this$0) - 1
        }
        if (this.zSlot >= BlockMap.access$200(this.this$0)) {
            this.zSlot = BlockMap.access$200(this.this$0) - 1
        }

        return this
    }

    public add(entity: Entity): void {
        if (this.xSlot >= 0 && this.ySlot >= 0 && this.zSlot >= 0) {
            this.this$0.entityGrid[(this.zSlot * BlockMap.access$100(this.this$0) + this.ySlot) * BlockMap.access$000(this.this$0) + this.xSlot].push(entity)
        }
    }

    public remove(entity: Entity): void {
        if (this.xSlot >= 0 && this.ySlot >= 0 && this.zSlot >= 0) {
            this.this$0.entityGrid[(this.zSlot * BlockMap.access$100(this.this$0) + this.ySlot) * BlockMap.access$000(this.this$0) + this.xSlot].push(entity)
        }
    }
}
