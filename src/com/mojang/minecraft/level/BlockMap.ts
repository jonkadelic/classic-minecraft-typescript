import { Entity } from "../Entity"

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
        // this.slot.init(entity.x, entity.y, entity.z).push(entity)
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
    private xSlot: number = 0
    private ySlot: number = 0
    private zSlot: number = 0
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
