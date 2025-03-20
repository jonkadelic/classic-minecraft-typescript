import { AABB } from "../phys/AABB"

export class Culler {
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
    public m_Frustum: number[][] = new Array(16).fill(new Array(16))
    public proj: number[] = new Array(16)
    public modl: number[] = new Array(16)
    public clip: number[] = new Array(16)

    
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