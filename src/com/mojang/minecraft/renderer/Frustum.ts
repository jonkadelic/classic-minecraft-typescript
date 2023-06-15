import { Matrix } from "../../../util/Matrix";
import { matrix } from "../Minecraft";
import { AABB } from "../phys/AABB";

export class Frustum {
    public m_Frustum: number[][] = new Array(6).fill(0).map(() => new Array(4).fill(0))
    public static readonly RIGHT: number = 0
    public static readonly LEFT: number = 1
    public static readonly BOTTOM: number = 2
    public static readonly TOP: number = 3
    public static readonly BACK: number = 4
    public static readonly FRONT: number = 5
    public static readonly A: number = 0
    public static readonly B: number = 1
    public static readonly C: number = 2
    public static readonly D: number = 3
    private static frustum: Frustum = new Frustum()
    private proj: number[] = new Array(16)
    private modl: number[] = new Array(16)
    private clip: number[] = new Array(16)

    private constructor() { }

    public static getFrustum(): Frustum {
        this.frustum.calculateFrustum()
        return Frustum.frustum
    }

    private normalizePlane(frustum: number[][], side: number): void {
        let magnitude = Math.sqrt(frustum[side][0] * frustum[side][0] + frustum[side][1] * frustum[side][1] + frustum[side][2] * frustum[side][2]);
        let fArray = frustum[side];
        fArray[0] = fArray[0] / magnitude;
        let fArray2 = frustum[side];
        fArray2[1] = fArray2[1] / magnitude;
        let fArray3 = frustum[side];
        fArray3[2] = fArray3[2] / magnitude;
        let fArray4 = frustum[side];
        fArray4[3] = fArray4[3] / magnitude;
    }

    private calculateFrustum(): void {
        this.proj = matrix.getFloat(Matrix.PROJECTION);
        this.modl = matrix.getFloat(Matrix.MODELVIEW);
        this.clip[0] = this.modl[0] * this.proj[0] + this.modl[1] * this.proj[4] + this.modl[2] * this.proj[8] + this.modl[3] * this.proj[12];
        this.clip[1] = this.modl[0] * this.proj[1] + this.modl[1] * this.proj[5] + this.modl[2] * this.proj[9] + this.modl[3] * this.proj[13];
        this.clip[2] = this.modl[0] * this.proj[2] + this.modl[1] * this.proj[6] + this.modl[2] * this.proj[10] + this.modl[3] * this.proj[14];
        this.clip[3] = this.modl[0] * this.proj[3] + this.modl[1] * this.proj[7] + this.modl[2] * this.proj[11] + this.modl[3] * this.proj[15];
        this.clip[4] = this.modl[4] * this.proj[0] + this.modl[5] * this.proj[4] + this.modl[6] * this.proj[8] + this.modl[7] * this.proj[12];
        this.clip[5] = this.modl[4] * this.proj[1] + this.modl[5] * this.proj[5] + this.modl[6] * this.proj[9] + this.modl[7] * this.proj[13];
        this.clip[6] = this.modl[4] * this.proj[2] + this.modl[5] * this.proj[6] + this.modl[6] * this.proj[10] + this.modl[7] * this.proj[14];
        this.clip[7] = this.modl[4] * this.proj[3] + this.modl[5] * this.proj[7] + this.modl[6] * this.proj[11] + this.modl[7] * this.proj[15];
        this.clip[8] = this.modl[8] * this.proj[0] + this.modl[9] * this.proj[4] + this.modl[10] * this.proj[8] + this.modl[11] * this.proj[12];
        this.clip[9] = this.modl[8] * this.proj[1] + this.modl[9] * this.proj[5] + this.modl[10] * this.proj[9] + this.modl[11] * this.proj[13];
        this.clip[10] = this.modl[8] * this.proj[2] + this.modl[9] * this.proj[6] + this.modl[10] * this.proj[10] + this.modl[11] * this.proj[14];
        this.clip[11] = this.modl[8] * this.proj[3] + this.modl[9] * this.proj[7] + this.modl[10] * this.proj[11] + this.modl[11] * this.proj[15];
        this.clip[12] = this.modl[12] * this.proj[0] + this.modl[13] * this.proj[4] + this.modl[14] * this.proj[8] + this.modl[15] * this.proj[12];
        this.clip[13] = this.modl[12] * this.proj[1] + this.modl[13] * this.proj[5] + this.modl[14] * this.proj[9] + this.modl[15] * this.proj[13];
        this.clip[14] = this.modl[12] * this.proj[2] + this.modl[13] * this.proj[6] + this.modl[14] * this.proj[10] + this.modl[15] * this.proj[14];
        this.clip[15] = this.modl[12] * this.proj[3] + this.modl[13] * this.proj[7] + this.modl[14] * this.proj[11] + this.modl[15] * this.proj[15];
        this.m_Frustum[0][0] = this.clip[3] - this.clip[0];
        this.m_Frustum[0][1] = this.clip[7] - this.clip[4];
        this.m_Frustum[0][2] = this.clip[11] - this.clip[8];
        this.m_Frustum[0][3] = this.clip[15] - this.clip[12];
        this.normalizePlane(this.m_Frustum, 0);
        this.m_Frustum[1][0] = this.clip[3] + this.clip[0];
        this.m_Frustum[1][1] = this.clip[7] + this.clip[4];
        this.m_Frustum[1][2] = this.clip[11] + this.clip[8];
        this.m_Frustum[1][3] = this.clip[15] + this.clip[12];
        this.normalizePlane(this.m_Frustum, 1);
        this.m_Frustum[2][0] = this.clip[3] + this.clip[1];
        this.m_Frustum[2][1] = this.clip[7] + this.clip[5];
        this.m_Frustum[2][2] = this.clip[11] + this.clip[9];
        this.m_Frustum[2][3] = this.clip[15] + this.clip[13];
        this.normalizePlane(this.m_Frustum, 2);
        this.m_Frustum[3][0] = this.clip[3] - this.clip[1];
        this.m_Frustum[3][1] = this.clip[7] - this.clip[5];
        this.m_Frustum[3][2] = this.clip[11] - this.clip[9];
        this.m_Frustum[3][3] = this.clip[15] - this.clip[13];
        this.normalizePlane(this.m_Frustum, 3);
        this.m_Frustum[4][0] = this.clip[3] - this.clip[2];
        this.m_Frustum[4][1] = this.clip[7] - this.clip[6];
        this.m_Frustum[4][2] = this.clip[11] - this.clip[10];
        this.m_Frustum[4][3] = this.clip[15] - this.clip[14];
        this.normalizePlane(this.m_Frustum, 4);
        this.m_Frustum[5][0] = this.clip[3] + this.clip[2];
        this.m_Frustum[5][1] = this.clip[7] + this.clip[6];
        this.m_Frustum[5][2] = this.clip[11] + this.clip[10];
        this.m_Frustum[5][3] = this.clip[15] + this.clip[14];
        this.normalizePlane(this.m_Frustum, 5);
    }

    public pointInFrustum(x: number, y: number, z: number): boolean {
        let i = 0;
        while (i < 6) {
            if (this.m_Frustum[i][0] * x + this.m_Frustum[i][1] * y + this.m_Frustum[i][2] * z + this.m_Frustum[i][3] <= 0.0) {
                return false;
            }
            ++i;
        }
        return true;   
    }

    public sphereInFrustum(x: number, y: number, z: number, radius: number): boolean {
        let i = 0;
        while (i < 6) {
            if (this.m_Frustum[i][0] * x + this.m_Frustum[i][1] * y + this.m_Frustum[i][2] * z + this.m_Frustum[i][3] <= -radius) {
                return false;
            }
            ++i;
        }
        return true;
    }

    public cubeFullyInFrustum(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): boolean {
        let i = 0;
        while (i < 6) {
            if (!(this.m_Frustum[i][0] * x1 + this.m_Frustum[i][1] * y1 + this.m_Frustum[i][2] * z1 + this.m_Frustum[i][3] > 0.0)) {
                return false;
            }
            if (!(this.m_Frustum[i][0] * x2 + this.m_Frustum[i][1] * y1 + this.m_Frustum[i][2] * z1 + this.m_Frustum[i][3] > 0.0)) {
                return false;
            }
            if (!(this.m_Frustum[i][0] * x1 + this.m_Frustum[i][1] * y2 + this.m_Frustum[i][2] * z1 + this.m_Frustum[i][3] > 0.0)) {
                return false;
            }
            if (!(this.m_Frustum[i][0] * x2 + this.m_Frustum[i][1] * y2 + this.m_Frustum[i][2] * z1 + this.m_Frustum[i][3] > 0.0)) {
                return false;
            }
            if (!(this.m_Frustum[i][0] * x1 + this.m_Frustum[i][1] * y1 + this.m_Frustum[i][2] * z2 + this.m_Frustum[i][3] > 0.0)) {
                return false;
            }
            if (!(this.m_Frustum[i][0] * x2 + this.m_Frustum[i][1] * y1 + this.m_Frustum[i][2] * z2 + this.m_Frustum[i][3] > 0.0)) {
                return false;
            }
            if (!(this.m_Frustum[i][0] * x1 + this.m_Frustum[i][1] * y2 + this.m_Frustum[i][2] * z2 + this.m_Frustum[i][3] > 0.0)) {
                return false;
            }
            if (!(this.m_Frustum[i][0] * x2 + this.m_Frustum[i][1] * y2 + this.m_Frustum[i][2] * z2 + this.m_Frustum[i][3] > 0.0)) {
                return false;
            }
            ++i;
        }
        return true;
    }

    public cubeInFrustum(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): boolean {
        let i = 0;
        while (i < 6) {
            if (!(this.m_Frustum[i][0] * x1 + this.m_Frustum[i][1] * y1 + this.m_Frustum[i][2] * z1 + this.m_Frustum[i][3] > 0.0 || this.m_Frustum[i][0] * x2 + this.m_Frustum[i][1] * y1 + this.m_Frustum[i][2] * z1 + this.m_Frustum[i][3] > 0.0 || this.m_Frustum[i][0] * x1 + this.m_Frustum[i][1] * y2 + this.m_Frustum[i][2] * z1 + this.m_Frustum[i][3] > 0.0 || this.m_Frustum[i][0] * x2 + this.m_Frustum[i][1] * y2 + this.m_Frustum[i][2] * z1 + this.m_Frustum[i][3] > 0.0 || this.m_Frustum[i][0] * x1 + this.m_Frustum[i][1] * y1 + this.m_Frustum[i][2] * z2 + this.m_Frustum[i][3] > 0.0 || this.m_Frustum[i][0] * x2 + this.m_Frustum[i][1] * y1 + this.m_Frustum[i][2] * z2 + this.m_Frustum[i][3] > 0.0 || this.m_Frustum[i][0] * x1 + this.m_Frustum[i][1] * y2 + this.m_Frustum[i][2] * z2 + this.m_Frustum[i][3] > 0.0 || this.m_Frustum[i][0] * x2 + this.m_Frustum[i][1] * y2 + this.m_Frustum[i][2] * z2 + this.m_Frustum[i][3] > 0.0)) {
                return false;
            }
            ++i;
        }
        return true;
    }

    public isVisible(aabb: AABB): boolean {
        return this.cubeInFrustum(aabb.x0, aabb.y0, aabb.z0, aabb.x1, aabb.y1, aabb.z1);
    }
}