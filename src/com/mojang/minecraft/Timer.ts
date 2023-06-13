export class Timer {
    private static readonly NS_PER_SECOND = 1_000_000_000
    private static readonly MAX_NS_PER_UPDATE = 1_000_000_000 
    private static readonly MAX_TICKS_PER_UPDATE = 100
    private ticksPerSecond: number
    private lastTime: number
    public ticks: number = 0
    public a: number = 0
    public timeScale: number = 1
    public fps: number = 0
    public passedTime: number = 0

    public constructor(ticksPerSecond: number) {
        this.ticksPerSecond = ticksPerSecond
        this.lastTime = window.performance.now() * 1_000_000
    }

    public advanceTime(): void {
        let now = window.performance.now() * 1_000_000
        let passedNs = now - this.lastTime
        this.lastTime = now
        if (passedNs < 0) {
            passedNs = 0
        }
        if (passedNs > Timer.MAX_NS_PER_UPDATE) {
            passedNs = Timer.MAX_NS_PER_UPDATE
        }
        this.fps = Math.floor(Timer.NS_PER_SECOND / passedNs)
        this.passedTime += passedNs * this.timeScale * this.ticksPerSecond / Timer.NS_PER_SECOND
        this.ticks = Math.floor(this.passedTime)
        if (this.ticks > Timer.MAX_TICKS_PER_UPDATE) {
            this.ticks = Timer.MAX_TICKS_PER_UPDATE
        }
        this.passedTime -= this.ticks
        this.a = this.passedTime
    }
}