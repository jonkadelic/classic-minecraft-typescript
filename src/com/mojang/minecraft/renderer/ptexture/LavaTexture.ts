import { Mth } from "../../../../util/Mth";
import { Tiles } from "../../level/tile/Tiles";
import { DynamicTexture } from "./DynamicTexture";

export class LavaTexture extends DynamicTexture {
    protected current: number[] = new Array(256)
    protected next: number[] = new Array(256)
    protected heat: number[] = new Array(256)
    protected heata: number[] = new Array(256)

    public constructor() {
        super(Tiles.lava.tex)

		this.current.fill(0)
        this.next.fill(0)
        this.heat.fill(0)
        this.heata.fill(0)
    }

    public override tick(): void {
        for (let x: number = 0; x < 16; x++) {
			for (let y: number = 0; y < 16; y++) {
				let pow: number = 0.0;
				let xxo: number = Math.trunc(Math.sin(y * Math.PI * 2.0 / 16.0) * 1.2);
				let yyo: number = Math.trunc(Math.sin(x * Math.PI * 2.0 / 16.0) * 1.2);

				for (let xx: number = x - 1; xx <= x + 1; xx++) {
					for (let yy: number = y - 1; yy <= y + 1; yy++) {
						let xi: number = xx + xxo & 15;
						let yi: number = yy + yyo & 15;
						pow += this.current[xi + yi * 16];
					}
				}

				this.next[x + y * 16] = pow / 10.0
					+ (
							this.heat[(x + 0 & 15) + (y + 0 & 15) * 16]
								+ this.heat[(x + 1 & 15) + (y + 0 & 15) * 16]
								+ this.heat[(x + 1 & 15) + (y + 1 & 15) * 16]
								+ this.heat[(x + 0 & 15) + (y + 1 & 15) * 16]
						)
						/ 4.0
						* 0.8;
				this.heat[x + y * 16] = this.heat[x + y * 16] + this.heata[x + y * 16] * 0.01;
				if (this.heat[x + y * 16] < 0.0) {
					this.heat[x + y * 16] = 0.0;
				}

				this.heata[x + y * 16] = this.heata[x + y * 16] - 0.06;
				if (Math.random() < 0.005) {
					this.heata[x + y * 16] = 1.5;
				}
			}
		}

		let tmp: number[] = this.next;
		this.next = this.current;
		this.current = tmp;

		for (let i: number = 0; i < 256; i++) {
			let pow: number = this.current[i] * 2.0;
			if (pow > 1.0) {
				pow = 1.0;
			}

			if (pow < 0.0) {
				pow = 0.0;
			}

			let r: number = Math.trunc(pow * 100.0 + 155.0);
			let g: number = Math.trunc(pow * pow * 255.0);
			let b: number = Math.trunc(pow * pow * pow * pow * 128.0);

			this.pixels[i * 4 + 0] = r;
			this.pixels[i * 4 + 1] = g;
			this.pixels[i * 4 + 2] = b;
			this.pixels[i * 4 + 3] = 255;
		}
	}
}