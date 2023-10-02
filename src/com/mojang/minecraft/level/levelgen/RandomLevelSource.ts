import { Random } from "../../../../util/Random";
import { Level } from "../Level";
import { Tile } from "../tile/Tile";
import { Tiles } from "../tile/Tiles";
import { CompositeNoise } from "./synth/CompositeNoise";
import { PerlinNoise } from "./synth/PerlinNoise";

export class LevelGenerator {
    private sizeX: number = 0
    private sizeZ: number = 0
    private sizeY: number = 0
    private random: Random = new Random()
    private blocks: number[] = []
    private waterLevel: number = 0
    private floodFillStackPositions = new Array(0x100000)

    public constructor() {
        for (let i = 0; i < 0x100000; i++) {
            this.floodFillStackPositions[i] = 0
        }
    }

    public create(authorName: string, sizeX: number, sizeZ: number, sizeY: number): Level {
        this.sizeX = sizeX
        this.sizeZ = sizeZ
        this.sizeY = 64
        this.waterLevel = 32
        this.blocks = new Array(sizeX * sizeZ * sizeY)
        for (let i = 0; i < this.blocks.length; i++) {
            this.blocks[i] = 0
        }

        // Raising phase
        let heightNoiseGeneratorA = new CompositeNoise(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8))
        let heightNoiseGeneratorB = new CompositeNoise(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8))
        let heightNoiseGeneratorSelector = new PerlinNoise(this.random, 6)
        let heightMap = new Array(sizeX * sizeZ)
        let xzScale = 1.3

        for (let x = 0; x < this.sizeX; x++) {
            for (let z = 0; z < this.sizeZ; z++) {
                let heightNoiseA = heightNoiseGeneratorA.getValue(x / xzScale, z / xzScale) / 6 - 4
                let heightNoiseB = heightNoiseGeneratorB.getValue(x / xzScale, z / xzScale) / 5 + 10 - 4
                if (heightNoiseGeneratorSelector.getValue(x, z) / 8 > 0) {
                    heightNoiseB = heightNoiseA;
                }

                let height = Math.max(heightNoiseA, heightNoiseB) / 2
                if (height < 0) {
                    height *= 0.8
                }

                heightMap[x + z * this.sizeX] = Math.floor(height)
            }
        }

        // Eroding phase
        let erosionPowerNoiseGenerator = new CompositeNoise(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8))
        let erosionAmountNoiseGenerator = new CompositeNoise(new PerlinNoise(this.random, 8), new PerlinNoise(this.random, 8))
        
        for (let x = 0; x < this.sizeX; x++) {
            for (let z = 0; z < this.sizeZ; z++) {
                let erosionPower = erosionPowerNoiseGenerator.getValue(x << 1, z << 1) / 8
                let erosionAmount = erosionAmountNoiseGenerator.getValue(x << 1, z << 1) > 0 ? 1 : 0

                if (erosionPower > 2.0) {
                    let height = heightMap[x + z * this.sizeX]
                    height = ((height - erosionAmount) / 2 << 1) + erosionAmount
                    heightMap[x + z * this.sizeX] = height
                }
            }
        }

        // Soiling phase
        let soilNoiseGenerator = new PerlinNoise(this.random, 8)

        for (let x = 0; x < this.sizeX; x++) {
            for (let z = 0; z < this.sizeZ; z++) {
                // Determine the height of the soil layer
                let soilNoise = Math.floor(soilNoiseGenerator.getValue(x, z) / 24.0) - 4
                let height = heightMap[x + z * this.sizeX] + this.waterLevel
                let soilHeight = height + soilNoise

                // Clamp the heightmap
                heightMap[x + z * this.sizeX] = Math.max(height, soilHeight)
                if (heightMap[x + z * this.sizeX] > this.sizeY - 2) {
                    heightMap[x + z * this.sizeX] = this.sizeY - 2
                }
                if (heightMap[x + z * this.sizeX] < 1) {
                    heightMap[x + z * this.sizeX] = 1
                }

                // Fill the soil layer
                for (let y = 0; y < this.sizeY; y++) {
                    let i = (y * this.sizeZ + z) * this.sizeX + x
                    let id = 0

                    if (y <= height) {
                        id = Tiles.dirt.id
                    }

                    if (y <= soilHeight) {
                        id = Tiles.rock.id
                    }

                    if (y === 0) {
                        id = Tiles.lava.id
                    }

                    this.blocks[i] = id
                }
            }
        }

        // Carving phase
        let numCaves = this.sizeX * this.sizeZ * this.sizeY / 256 / 64 << 1

        for (let i = 0; i < numCaves; i++) {
            // Get starting position for worm
            let wormX = this.random.nextFloat() * this.sizeX
            let wormY = this.random.nextFloat() * this.sizeY
            let wormZ = this.random.nextFloat() * this.sizeZ

            // Initialize worm data
            let wormLength = Math.floor((this.random.nextFloat() + this.random.nextFloat()) * 200)
            let wormPitch = this.random.nextFloat() * Math.PI * 2
            let wormPitchDelta = 0
            let wormYaw = this.random.nextFloat() * Math.PI * 2
            let wormYawDelta = 0
            let wormRadius = this.random.nextFloat() * this.random.nextFloat()

            for (let w = 0; w < wormLength; w++) {
                // Set next position of worm
                wormX += Math.sin(wormPitch) * Math.cos(wormYaw)
                wormZ += Math.cos(wormPitch) * Math.cos(wormYaw)
                wormY += Math.sin(wormYaw)

                // Update worm angle
                wormPitch += wormPitchDelta * 0.2
                wormPitchDelta *= 0.9
                wormPitchDelta += this.random.nextFloat() - this.random.nextFloat()
                wormYaw += wormYawDelta * 0.5
                wormYaw *= 0.5
                wormYawDelta *= 12 / 16
                wormYawDelta += this.random.nextFloat() - this.random.nextFloat()

                if (!(this.random.nextFloat() < 0.25)) {
                    // Get central coordinates of blob
                    let blobX = wormX + (this.random.nextFloat() * 4 - 2) * 0.2
                    let blobY = wormY + (this.random.nextFloat() * 4 - 2) * 0.2
                    let blobZ = wormZ + (this.random.nextFloat() * 4 - 2) * 0.2

                    let heightPercentage = (this.sizeY - blobY) / this.sizeY
                    let radiusFactor = 1.2 + (heightPercentage * 3.5 + 1) * wormRadius
                    let blobRadius = Math.sin(w * Math.PI / wormLength) * radiusFactor

                    for (let x = Math.floor(blobX - blobRadius); x <= Math.floor(blobX + blobRadius); x++) {
                        for (let y = Math.floor(blobY - blobRadius); y <= Math.floor(blobY + blobRadius); y++) {
                            for (let z = Math.floor(blobZ - blobRadius); z <= Math.floor(blobZ + blobRadius); z++) {
                                let dx = x - blobX
                                let dy = y - blobY
                                let dz = z - blobZ
                                if (dx * dx + dy * dy * 2 + dz * dz < blobRadius * blobRadius
                                    && x >= 1 && y >= 1 && z >= 1
                                    && x < sizeX - 1 && y < sizeY - 1 && z < sizeZ - 1) {
                                    let index = (y * this.sizeZ + z) * this.sizeX + x
                                    if (this.blocks[index] == Tiles.rock.id) {
                                        this.blocks[index] = 0
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Generate ores
        this.populateOre(Tiles.coalOre.id, 90)
        this.populateOre(Tiles.ironOre.id, 70)
        this.populateOre(Tiles.goldOre.id, 50)

        // Watering phase
        let waterId = Tiles.calmWater.id

        for (let x = 0; x < this.sizeX; x++) {
            this.floodFill(x, this.waterLevel - 1, 0, 0, waterId)
            this.floodFill(x, this.waterLevel - 1, this.sizeZ - 1, 0, waterId)
        }

        for (let z = 0; z < this.sizeZ; z++) {
            this.floodFill(0, this.waterLevel - 1, z, 0, waterId)
            this.floodFill(this.sizeX - 1, this.waterLevel - 1, z, 0, waterId)
        }

        // Place random water spots
        let numWaterSpots = this.sizeX * this.sizeZ / 8000
        for (let i = 0; i < numWaterSpots; i++) {
            let x = this.random.nextInt(this.sizeX)
            let y = this.waterLevel - 1 - this.random.nextInt(2)
            let z = this.random.nextInt(this.sizeZ)
            if (this.blocks[(y * this.sizeZ + z) * this.sizeX + x] == 0) {
                this.floodFill(x, y, z, 0, waterId)
            }
        }

        // Melting phase
        let numLavaSpots = this.sizeX * this.sizeZ / 20000
        for (let i = 0; i < numLavaSpots; i++) {
            let x = this.random.nextInt(this.sizeX)
            let y = Math.floor(this.random.nextFloat() * this.random.nextFloat() * (this.waterLevel - 3))
            let z = this.random.nextInt(this.sizeZ)
            if (this.blocks[(y * this.sizeZ + z) * this.sizeX + x] == 0) {
                this.floodFill(x, y, z, 0, Tiles.calmLava.id)
            }
        }

        // Growing phase
        let sandNoiseGenerator = new PerlinNoise(this.random, 8)
        let gravelNoiseGenerator = new PerlinNoise(this.random, 8)

        for (let x = 0; x < this.sizeX; x++) {
            for (let z = 0; z < this.sizeZ; z++) {
                let isSand = sandNoiseGenerator.getValue(x, z) > 8
                let isGravel = gravelNoiseGenerator.getValue(x, z) > 12
                let height = heightMap[x + z * this.sizeX]
                let i = (height * this.sizeZ + z) * this.sizeX + x
                let topBlock = this.blocks[((height + 1) * this.sizeZ + z) * this.sizeX + x] & 255
                if ((topBlock == Tiles.water.id || topBlock == Tiles.calmWater.id)
                    && height < this.sizeY / 2 - 1 && isGravel) {
                    this.blocks[i] = Tiles.gravel.id
                }

                if (topBlock == 0) {
                    let tile = Tiles.grass.id
                    if (height <= sizeY / 2 - 1 && isSand) {
                        tile = Tiles.sand.id
                    }

                    this.blocks[i] = tile
                }
            }
        }

        // Planting phase
        let numFlowers = this.sizeX * this.sizeZ / 3000
        for (let i = 0; i < numFlowers; i++) {
            let flowerType = this.random.nextInt(2)
            let x = this.random.nextInt(this.sizeX)
            let z = this.random.nextInt(this.sizeZ)

            for (let j = 0; j < 10; j++) {
                let flowerX = x
                let flowerZ = z

                for (let k = 0; k < 5; k++) {
                    flowerX += this.random.nextInt(6) - this.random.nextInt(6)
                    flowerZ += this.random.nextInt(6) - this.random.nextInt(6)
                    if ((flowerType < 2 || this.random.nextInt(4) == 0) || flowerX >= 0 && flowerZ >= 0 && flowerX < this.sizeX && flowerZ < this.sizeZ) {
                        let height = heightMap[flowerX + flowerZ * this.sizeX] + 1
                        if ((this.blocks[(height * this.sizeZ + flowerZ) * this.sizeX + flowerX] & 255) == 0) {
                            let index = (height * this.sizeZ + flowerZ) * this.sizeX + flowerX
                            if ((this.blocks[((height - 1) * sizeZ + flowerZ) * sizeX + flowerX] & 255) == Tiles.grass.id) {
                                if (flowerType == 0) {
                                    this.blocks[index] = Tiles.rose.id
                                } else if (flowerType == 1) {
                                    this.blocks[index] = Tiles.flower.id
                                }
                            }
                        }
                    }
                }
            }
        }

        let numMushrooms = this.sizeX * this.sizeZ / 3000
        for (let i = 0; i < numMushrooms; i++) {
            let mushroomType = this.random.nextInt(2)
            let x = this.random.nextInt(this.sizeX)
            let y = this.random.nextInt(this.sizeY)
            let z = this.random.nextInt(this.sizeZ)

            for (let j = 0; j < 20; j++) {
                let mushroomX = x
                let mushroomY = y
                let mushroomZ = z

                for (let k = 0; k < 5; k++) {
                    mushroomX += this.random.nextInt(6) - this.random.nextInt(6)
                    mushroomY += this.random.nextInt(2) - this.random.nextInt(2)
                    mushroomZ += this.random.nextInt(6) - this.random.nextInt(6)
                    if ((mushroomType < 2 || this.random.nextInt(4) == 0) ||
                        mushroomX >= 0 && mushroomZ >= 0 && mushroomY >= 1 &&
                        mushroomX < this.sizeX && mushroomZ < this.sizeZ && mushroomY < heightMap[mushroomX + mushroomZ * this.sizeX] + 1 &&
                        (this.blocks[(mushroomY * this.sizeZ + mushroomZ) * this.sizeX + mushroomX] & 255) == 0) {
                        let index = (mushroomY * this.sizeZ + mushroomZ) * this.sizeX + mushroomX
                        if ((this.blocks[((mushroomY - 1) * sizeZ + mushroomZ) * sizeX + mushroomX] & 255) == Tiles.rock.id) {
                            if (mushroomType == 0) {
                                this.blocks[index] = Tiles.mushroom1.id
                            } else if (mushroomType == 1) {
                                this.blocks[index] = Tiles.mushroom2.id
                            }
                        }
                    }
                }
            }
        }

        let level = new Level(this.sizeX, this.sizeZ, this.sizeY)
        level.setData(this.sizeX, this.sizeZ, this.sizeY, this.blocks)
        level.createTime = Date.now()
        level.creator = authorName
        level.name = "A Nice World"
    
        let numTrees = this.sizeX * this.sizeZ / 4000

        for (let i = 0; i < numTrees; i++) {
            let x = this.random.nextInt(this.sizeX)
            let z = this.random.nextInt(this.sizeZ)

            for (let j = 0; j < 20; j++) {
                let treeX = x
                let treeZ = z

                for (let k = 0; k < 20; k++) {
                    treeX += this.random.nextInt(6) - this.random.nextInt(6)
                    treeZ += this.random.nextInt(6) - this.random.nextInt(6)

                    if (treeX >= 0 && treeZ >= 0 && treeX < this.sizeX && treeZ < this.sizeZ) {
                        let height = heightMap[treeX + treeZ * this.sizeX] + 1
                        if (this.random.nextInt(4) == 0) {
                            level.maybeGrowTree(treeX, height, treeZ)
                        }
                    }
                }
            }
        }

        return level
    }

    private populateOre(id: number, count: number) {
        let tileId = id
        let sizeX = this.sizeX
        let sizeY = this.sizeY
        let sizeZ = this.sizeZ
        let numWorms = Math.floor(sizeX * sizeY * sizeZ / 256 / 64 * count / 100)

        for (let i = 0; i < numWorms; i++) {
            // Get starting position for worm
            let wormX = this.random.nextFloat() * sizeX
            let wormY = this.random.nextFloat() * sizeY
            let wormZ = this.random.nextFloat() * sizeZ

            // Initialize worm data
            let wormLength = Math.floor((this.random.nextFloat() + this.random.nextFloat()) * 75 * count / 100)
            let wormPitch = this.random.nextFloat() * Math.PI * 2
            let wormPitchDelta = 0
            let wormYaw = this.random.nextFloat() * Math.PI * 2
            let wormYawDelta = 0

            for (let w = 0; w < wormLength; w++) {
                // Set next position of worm
                wormX += Math.sin(wormPitch) * Math.cos(wormYaw)
                wormZ += Math.cos(wormPitch) * Math.cos(wormYaw)
                wormY += Math.sin(wormYaw)

                // Update worm angle
                wormPitch += wormPitchDelta * 0.2
                wormPitchDelta *= 0.9
                wormPitchDelta += this.random.nextFloat() - this.random.nextFloat()
                wormYaw += wormYawDelta * 0.5
                wormYaw *= 0.5
                wormYawDelta *= 12 / 16
                wormYawDelta += this.random.nextFloat() - this.random.nextFloat()

                // Get radius of blob
                let blobRadius = Math.sin(w * Math.PI / wormLength) * count / 100 + 1

                for (let x = Math.floor(wormX - blobRadius); x <= Math.floor(wormX + blobRadius); x++) {
                    for (let y = Math.floor(wormY - blobRadius); y <= Math.floor(wormY + blobRadius); y++) {
                        for (let z = Math.floor(wormZ - blobRadius); z <= Math.floor(wormZ + blobRadius); z++) {
                            let dx = x - wormX
                            let dy = y - wormY
                            let dz = z - wormZ
                            if (dx * dx + dy * dy * 2 + dz * dz < blobRadius * blobRadius
                                && x >= 1 && y >= 1 && z >= 1
                                && x < sizeX - 1 && y < sizeY - 1 && z < sizeZ - 1) {
                                let index = (y * sizeZ + z) * sizeX + x
                                if (this.blocks[index] == Tiles.rock.id) {
                                    this.blocks[index] = tileId
                                }
                            }
                        }
                    }
                }
                    
            }
        }
    }

    private floodFill(x: number, y: number, z: number, tileToCheck: number, tileToPlace: number): number {
        let idToPlace = tileToPlace
        let idToCheck = tileToCheck
        let floodFillStack = Array<Array<number>>()
        let floodFillStackPositionsIndex = 0
        let xBits = 1
        let zBits = 1

        while (1 << xBits < this.sizeX) {
            xBits++
        }

        while (1 << zBits < this.sizeZ) {
            zBits++
        }

        let maxZ = this.sizeZ - 1
        let maxX = this.sizeX - 1
        floodFillStackPositionsIndex++
        this.floodFillStackPositions[0] = ((y << zBits) + z << xBits) + x
        let numSteps = 0
        let tilesPerY = this.sizeX * this.sizeZ

        while (floodFillStackPositionsIndex > 0) {
            let i = this.floodFillStackPositions[--floodFillStackPositionsIndex]
            if (floodFillStackPositionsIndex == 0 && floodFillStack.length > 0) {
                this.floodFillStackPositions = floodFillStack.splice(floodFillStack.length - 1, 1)[0]
                floodFillStackPositionsIndex = this.floodFillStackPositions.length
            }

            let iz = i >> xBits & maxZ
            let iy = i >> xBits + zBits
            let ix = i & maxX

            let ixMax = ix
            while (ix > 0 && this.blocks[i - 1] == idToCheck) {
                i--
                ix--
            }

            while (ixMax < this.sizeX && this.blocks[i + ixMax - ix] == idToCheck) {
                ixMax++
            }

            let izNew = i >> xBits & maxZ
            let iyNew = i >> xBits + zBits
            if (tileToPlace == 255 && (ix == 0 || ixMax == this.sizeX - 1 || iy == 0 || iy == this.sizeY - 1 || iz == 0 || iz == this.sizeZ - 1)) {
                return -1
            }

            if (izNew != iz || iyNew != iy) {
                console.log("Diagonal flood!?")
            }

            let isIdMinZ = false
            let isIdMaxZ = false
            let isIdMinY = false
            numSteps += ixMax - ix

            for (let fx = ix; fx < ixMax; fx++) {
                this.blocks[i] = idToPlace
                if (iz > 0) {
                    let isId = this.blocks[i - this.sizeX] == idToCheck
                    if (isId && !isIdMinZ) {
                        if (floodFillStackPositionsIndex == this.floodFillStackPositions.length) {
                            floodFillStack.push(this.floodFillStackPositions)
                            this.floodFillStackPositions = new Array(0x100000)
                            for (let i = 0; i < 0x100000; i++) {
                                this.floodFillStackPositions[i] = 0
                            }
                            floodFillStackPositionsIndex = 0
                        }

                        this.floodFillStackPositions[floodFillStackPositionsIndex++] = i - this.sizeX
                    }

                    isIdMinZ = isId
                }

                if (iz < this.sizeZ - 1) {
                    let isId = this.blocks[i + this.sizeX] == idToCheck
                    if (isId && !isIdMaxZ) {
                        if (floodFillStackPositionsIndex == this.floodFillStackPositions.length) {
                            floodFillStack.push(this.floodFillStackPositions)
                            this.floodFillStackPositions = new Array(0x100000)
                            for (let i = 0; i < 0x100000; i++) {
                                this.floodFillStackPositions[i] = 0
                            }
                            floodFillStackPositionsIndex = 0
                        }

                        this.floodFillStackPositions[floodFillStackPositionsIndex++] = i + this.sizeX
                    }

                    isIdMaxZ = isId
                }

                if (iy > 0) {
                    let blockAbove = this.blocks[i - tilesPerY]
                    if ((idToPlace == Tiles.lava.id || idToPlace == Tiles.calmLava.id) && (blockAbove == Tiles.water.id || blockAbove == Tiles.calmWater.id)) {
                        this.blocks[i - tilesPerY] = Tiles.rock.id
                    }

                    let isId = blockAbove == idToCheck
                    if (isId && !isIdMinY) {
                        if (floodFillStackPositionsIndex == this.floodFillStackPositions.length) {
                            floodFillStack.push(this.floodFillStackPositions)
                            this.floodFillStackPositions = new Array(0x100000)
                            for (let i = 0; i < 0x100000; i++) {
                                this.floodFillStackPositions[i] = 0
                            }
                            floodFillStackPositionsIndex = 0
                        }

                        this.floodFillStackPositions[floodFillStackPositionsIndex++] = i - tilesPerY
                    }

                    isIdMinY = isId
                }

                i++
            }
        }

        return numSteps
    }
}
