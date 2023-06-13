export interface LevelListener {
    tileChanged(x: number, y: number, z: number): void
    lightColumnChanged(x: number, z: number, y0: number, y1: number): void
    allChanged(): void
}