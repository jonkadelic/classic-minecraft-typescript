import { Tiles } from "../../level/tile/Tiles";
import { DynamicTexture } from "./DynamicTexture";

export class WaterTexture extends DynamicTexture {
    private current: number[] = new Array(256)
    private next: number[] = new Array(256)
    private heat: number[] = new Array(256)
    private heata: number[] = new Array(256)
    private tickCount: number = 0

    public constructor() {
        super(Tiles.water.tex)

        this.current.fill(0)
        this.next.fill(0)
        this.heat.fill(0)
        this.heata.fill(0)
    }

    public override tick(): void {
        this.tickCount++

        for (let x: number = 0; x < 16; x++) {
            for (let y: number = 0; y < 16; y++) {
                let pow: number = 0.0

                for (let xx: number = x - 1; xx <= x + 1; xx++) {
                    let xi: number = xx & 15
                    let yi: number = y & 15
                    pow += this.current[xi + yi * 16]
                }

                this.next[x + y * 16] = pow / 3.3 + this.heat[x + y * 16] * 0.8
            }
        }

        for (let x: number = 0; x < 16; x++) {
            for (let y: number = 0; y < 16; y++) {
                this.heat[x + y * 16] = this.heat[x + y * 16] + this.heata[x + y * 16] * 0.05
                if (this.heat[x + y * 16] < 0.0) {
                    this.heat[x + y * 16] = 0.0
                }

                this.heata[x + y * 16] = this.heata[x + y * 16] - 0.1
                if (Math.random() < 0.05) {
                    this.heata[x + y * 16] = 0.5
                }
            }
        }

        let tmp: number[] = this.next
        this.next = this.current
        this.current = tmp

        for (let i: number = 0; i < 256; i++) {
            let pow: number = this.current[i]
            if (pow > 1.0) {
                pow = 1.0
            }

            if (pow < 0.0) {
                pow = 0.0
            }

            let pp: number = pow * pow
            let r: number = Math.trunc(32.0 + pp * 32.0)
            let g: number = Math.trunc(50.0 + pp * 64.0)
            let b: number = 255
            let a: number = Math.trunc(146.0 + pp * 50.0)

            this.pixels[i * 4 + 0] = r
            this.pixels[i * 4 + 1] = g
            this.pixels[i * 4 + 2] = b
            this.pixels[i * 4 + 3] = a
        }
    }
}