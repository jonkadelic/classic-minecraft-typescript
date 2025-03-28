import { Synth } from "./Synth";

export class Distort extends Synth {
    private readonly source: Synth;
    private readonly distort: Synth;

    constructor(synth1: Synth, synth2: Synth) {
        super()
        this.source = synth1;
        this.distort = synth2;
    }

    public override getValue(x: number, y: number): number {
        return this.source.getValue(x + this.distort.getValue(x, y), y);
    }
}
