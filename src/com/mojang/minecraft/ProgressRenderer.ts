import { ProgressListener } from "../../util/ProgressListener";
import { Minecraft } from "./Minecraft";

export class ProgressRenderer implements ProgressListener {
    private status: string = ""
    private minecraft: Minecraft
    private title: string = ""
    private lastTime: number = window.performance.now()

    public constructor(minecraft: Minecraft) {
        this.minecraft = minecraft
    }

    progressStart(title: string): void {
        if (!this.minecraft.running) {
            
        }
    }

    progressStage(title: string): void {
        throw new Error("Method not implemented.");
    }

    progressStagePercentage(progress: number): void {
        throw new Error("Method not implemented.");
    }
}