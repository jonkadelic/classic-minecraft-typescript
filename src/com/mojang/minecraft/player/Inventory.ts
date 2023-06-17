import { User } from "../User";
import { Tile } from "../level/tile/Tile";

export class Inventory {
    public static readonly POP_TIME_DURATION: number = 5
    public slots: number[] = new Array(9)
    public count: number[] = new Array(9)
    public popTime: number[] = new Array(9)
    public selected: number = 0

    public constructor() {
        for (let i: number = 0; i < 9; ++i) {
            this.slots[i] = -1
            this.count[i] = 0
        }
    }

    public getSelected(): number {
        return this.slots[this.selected]
    }

    private getSlot(id: number): number {
        for (let i: number = 0; i < this.slots.length; ++i) {
            if (id == this.slots[i]) {
                return i
            }
        }

        return -1
    }

    public grabTexture(id: number, replace: boolean): void {
        let var3 = this.getSlot(id)
        if (var3 >= 0) {
            this.selected = var3
        } else {
            if (replace && id > 0 && User.tiles.includes(Tile.tiles[id])) {
                this.replaceSlot(Tile.tiles[id])
            }
        }
    }

    public swapPaint(by: number): void {
        if (by > 0) {
            by = 1
        }

        if (by < 0) {
            by = -1
        }

        for (this.selected -= by; this.selected < 0; this.selected += this.slots.length) {
        }

        while (this.selected >= this.slots.length) {
            this.selected -= this.slots.length
        }
    }

    public replaceSlot(id: number): void {
        if (id >= 0) {
            this.replaceSlotTile(User.tiles.get(id))
        }
    }

    public replaceSlotTile(tile: Tile): void {
        if (tile != null) {
            let var2 = this.getSlot(tile.id)
            if (var2 >= 0) {
                this.slots[var2] = this.slots[this.selected]
            }

            this.slots[this.selected] = tile.id
        }
 
    }

    public addResource(id: number): boolean {
        let var2 = this.getSlot(id)
        if (var2 < 0) {
            var2 = this.getSlot(-1)
        }

        if (var2 < 0) {
            return false
        } else if (this.count[var2] >= 99) {
            return false
        } else {
            this.slots[var2] = id
            ++this.count[var2]
            this.popTime[var2] = 5
            return true
        }
    }
 
    public tick(): void {
        for (let i: number = 0; i < this.popTime.length; ++i) {
            if (this.popTime[i] > 0) {
                --this.popTime[i]
            }
        }
    }

    public removeResource(id: number): boolean {
        id = this.getSlot(id)
        if (id < 0) {
            return false
        } else {
            if (--this.count[id] <= 0) {
                this.slots[id] = -1
            }

            return true
        }
    }
}