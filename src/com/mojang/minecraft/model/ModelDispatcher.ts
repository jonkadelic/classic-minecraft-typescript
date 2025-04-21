import { CreeperModel } from "./CreeperModel";
import { HumanoidModel } from "./HumanoidModel";
import { Model } from "./Model";
import { PigModel } from "./PigModel";
import { QuadrupedModel } from "./QuadrupedModel";
import { SheepFurModel } from "./SheepFurModel";
import { SheepModel } from "./SheepModel";
import { SkeletonModel } from "./SkeletonModel";
import { SpiderModel } from "./SpiderModel";
import { ZombieModel } from "./ZombieModel";

export class ModelDispatcher {
    private humanoid: HumanoidModel = new HumanoidModel(0.0)
    private humanoidArmor: HumanoidModel = new HumanoidModel(1.0)
    private creeper: CreeperModel = new CreeperModel()
    private skeleton: SkeletonModel = new SkeletonModel()
    private zombie: ZombieModel = new ZombieModel()
    private pig: QuadrupedModel = new PigModel()
    private sheep: QuadrupedModel = new SheepModel()
    private spider: SpiderModel = new SpiderModel()
    private sheepFur: SheepFurModel = new SheepFurModel()

    public getModelById(id: string): Model | null {
        if (id == "humanoid") {
            return this.humanoid
        } else if (id == "humanoid.armor") {
            return this.humanoidArmor
        } else if (id == "creeper") {
            return this.creeper
        } else if (id == "skeleton") {
            return this.skeleton
        } else if (id == "zombie") {
            return this.zombie
        } else if (id == "pig") {
            return this.pig
        } else if (id == "sheep") {
            return this.sheep
        } else if (id == "spider") {
            return this.spider
        } else if (id == "sheep.fur") {
            return this.sheepFur
        }
        
        return null
    }
}