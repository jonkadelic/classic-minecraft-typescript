import { CreeperModel } from "./CreeperModel";
import { HumanoidModel } from "./HumanoidModel";
import { Model } from "./Model";
import { ZombieModel } from "./ZombieModel";

export class ModelDispatcher {
    private humanoid: HumanoidModel = new HumanoidModel(0.0)
    private humanoidArmor: HumanoidModel = new HumanoidModel(1.0)
    private creeper: CreeperModel = new CreeperModel()
    // skeleton
    private zombie: ZombieModel = new ZombieModel()
    // pig
    // sheep
    // spider
    // sheepFur

    public getModelById(id: string): Model | null {
        if (id == "humanoid") {
            return this.humanoid
        } else if (id == "humanoid.armor") {
            return this.humanoidArmor
        } else if (id == "creeper") {
            return this.creeper
        } else if (id == "skeleton") {

        } else if (id == "zombie") {
            return this.zombie
        } else if (id == "pig") {
            
        } else if (id == "sheep") {

        } else if (id == "spider") {

        } else if (id == "sheep.fur") {

        }
        
        return null
    }
}