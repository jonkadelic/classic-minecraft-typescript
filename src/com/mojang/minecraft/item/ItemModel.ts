import { Cube } from "../model/Cube";
import { Polygon } from "../model/Polygon";
import { Vertex } from "../model/Vertex";

export class ItemModel {
    private model: Cube = new Cube(0, 0)

    public constructor(tex: number) {
        let zMin = -2.0
        let yMin = -2.0
        let xMin = -2.0
        let zMax = 2.0
        let yMax = 2.0
        let xMax = 2.0
        let uMin = 0.0
        let vMin = 0.0
        let uMax = 8.0
        let vMax = 8.0

        let model = this.model
        model.vertices = new Array(8)
        model.polygons = new Array(6)

        let vtx0 = new Vertex(xMin, yMin, zMin, uMin, vMin)
        let vtx1 = new Vertex(xMax, yMin, zMin, uMin, vMax)
        let vtx2 = new Vertex(xMax, yMax, zMin, uMax, vMax)
        let vtx3 = new Vertex(xMin, yMax, zMin, uMax, vMin)
        let vtx4 = new Vertex(xMin, yMin, zMax, uMin, vMin)
        let vtx5 = new Vertex(xMax, yMin, zMax, uMin, vMax)
        let vtx6 = new Vertex(xMax, yMax, zMax, uMax, vMax)
        let vtx7 = new Vertex(xMin, yMax, zMax, uMax, vMin)

        model.vertices[0] = vtx0
        model.vertices[1] = vtx1
        model.vertices[2] = vtx2
        model.vertices[3] = vtx3
        model.vertices[4] = vtx4
        model.vertices[5] = vtx5
        model.vertices[6] = vtx6
        model.vertices[7] = vtx7

        let su = 0.25
        let sv = 0.25
        let u0 = ((tex % 16) + (1.0 - su)) / 16.0
        let v0 = ((tex / 16) + (1.0 - sv)) / 16.0
        let u1 = ((tex % 16) + su) / 16.0
        let v1 = ((tex / 16) + sv) / 16.0

        model.polygons[0] = new Polygon([vtx5, vtx1, vtx2, vtx6], u0, v0, u1, v1)
        model.polygons[1] = new Polygon([vtx0, vtx4, vtx7, vtx3], u0, v0, u1, v1)
        model.polygons[2] = new Polygon([vtx5, vtx4, vtx0, vtx1], u0, v0, u1, v1)
        model.polygons[3] = new Polygon([vtx2, vtx3, vtx7, vtx6], u0, v0, u1, v1)
        model.polygons[4] = new Polygon([vtx1, vtx0, vtx3, vtx2], u0, v0, u1, v1)
        model.polygons[5] = new Polygon([vtx4, vtx5, vtx6, vtx7], u0, v0, u1, v1)
    }

    public render(): void {
        this.model.render(0.0625)
    }
}