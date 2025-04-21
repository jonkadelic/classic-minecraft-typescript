import { ProgressListener } from "../../../util/ProgressListener";
import { Entity } from "../Entity";
import { Pig } from "../mob/Pig";
import { Spider } from "../mob/Spider";
import { Zombie } from "../mob/Zombie";
import { Level } from "./Level";
import { Material } from "./material/Material";

export class MobSpawner {
    public level: Level

    public constructor(level: Level) {
        this.level = level
    }

    public tick(tries: number, player: Entity | null, progressListener: ProgressListener | null): number {
        let mobsSpawned: number = 0

        for (let i = 0; i < tries; i++) {
            if (progressListener != null) {
                progressListener.progressStagePercentage(i * Math.trunc(100 / (tries - 1)))
            }

            let type = this.level.random.nextInt(6)
            let x = this.level.random.nextInt(this.level.width)
            let y = Math.trunc(Math.min(this.level.random.nextFloat(), this.level.random.nextFloat()) * this.level.depth)
            let z = this.level.random.nextInt(this.level.height)

            if (!this.level.isSolidTile(x, y, z) &&
                this.level.getLiquid(x, y, z) == Material.none &&
                (!this.level.isLit(x, y, z) || this.level.random.nextInt(5) == 0)
            ) {
                for (let j = 0; j < 3; j++) {
                    let xx = x
                    let yy = y
                    let zz = z

                    for (let k = 0; k < 3; k++) {
                        xx += this.level.random.nextInt(6) - this.level.random.nextInt(6)
                        yy += this.level.random.nextInt(1) - this.level.random.nextInt(1)
                        zz += this.level.random.nextInt(6) - this.level.random.nextInt(6)

                        if (xx >= 0 && zz >= 1 && yy >= 0 &&
                            yy < this.level.depth - 2 && xx < this.level.width && zz < this.level.height &&
                            this.level.isSolidTile(xx, yy - 1, zz) && !this.level.isSolidTile(xx, yy, zz) && !this.level.isSolidTile(xx, yy + 1, zz)
                        ) {
                            let cx = xx + 0.5
                            let cy = yy + 1.0
                            let cz = zz + 0.5

                            if (player != null) {
                                let ox = cx - player.x
                                let oy = cy - player.y
                                let oz = cz - player.z

                                if (ox * ox + oy * oy + oz * oz < 256.0) {
                                    continue
                                }
                            } else {
                                let ox = cx - this.level.xSpawn
                                let oy = cy - this.level.ySpawn
                                let oz = cz - this.level.zSpawn

                                if (ox * ox + oy * oy + oz * oz < 256.0) {
                                    continue
                                }
                            }

                            let entity: Entity | null = null

                            if (type == 0) {
                                entity = new Zombie(this.level, cx, cy, cz)
                            }

                            if (type == 1) {
                                // entity = new Skeleton(this.level, var15, var16, var17)
                            }

                            if (type == 2) {
                                entity = new Pig(this.level, cx, cy, cz)
                            }

                            if (type == 3) {
                                // entity = new Creeper(this.level, var15, var16, var17)
                            }

                            if (type == 4) {
                                entity = new Spider(this.level, cx, cy, cz)
                            }

                            if (type == 5) {
                                // entity = new Sheep(this.level, var15, var16, var17)
                            }

                            let e = entity

                            if (e != null && this.level.isFree(e.bb)) {
                                mobsSpawned++
                                this.level.addEntity(e)
                            }
                        }
                    }
                }
            }
        }

        return mobsSpawned
    }
}