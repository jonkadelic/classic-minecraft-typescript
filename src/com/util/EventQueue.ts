export class EventQueue {
    private maxEvents: number = 32
    private currentEventPos: number = -1
    private nextEventPos: number = 0

    public EventQueue(maxEvents: number) {
        this.maxEvents = maxEvents
    }

    public add() {
        this.nextEventPos++
        if (this.nextEventPos == this.maxEvents) {
            this.nextEventPos = 0
        }

        if (this.nextEventPos == this.currentEventPos) {
            this.currentEventPos++
            if (this.currentEventPos == this.maxEvents) {
                this.currentEventPos = 0
            }
        }
    }

    public next(): boolean {
        if (this.currentEventPos == this.nextEventPos - 1) {
            return false
        }
        if (this.nextEventPos == 0 && this.currentEventPos == this.maxEvents - 1) {
            return false
        }

        this.currentEventPos++
        if (this.currentEventPos == this.maxEvents) {
            this.currentEventPos = 0
        }

        return true
    }

    public getMaxEvents(): number {
        return this.maxEvents
    }

    public getCurrentPos(): number {
        return this.currentEventPos
    }

    public getNextPos(): number {
        return this.nextEventPos
    }
}