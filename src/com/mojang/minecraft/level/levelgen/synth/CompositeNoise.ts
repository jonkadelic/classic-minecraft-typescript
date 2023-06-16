import { SurfaceNoise } from "./SurfaceNoise";

export class CompositeNoise extends SurfaceNoise {
    private readonly noise1: SurfaceNoise;
    private readonly noise2: SurfaceNoise;

    constructor(noise1: SurfaceNoise, noise2: SurfaceNoise) {
        super()
        this.noise1 = noise1;
        this.noise2 = noise2;
    }

    public override getValue(x: number, y: number): number {
        return this.noise1.getValue(x + this.noise2.getValue(x, y), y);
    }
}
