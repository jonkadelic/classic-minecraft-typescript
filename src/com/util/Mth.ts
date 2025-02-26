export class Mth {
    public static sin(x: number): number {
        return Math.sin(x)
    }

    public static cos(x: number): number {
        return Math.cos(x)
    }

    public static sqrt(x: number): number {
        return Math.sqrt(x)
    }

    public static clamp(x: number, min: number, max: number): number {
        if (x < min) {
            return min
        }
        if (x > max) {
            return max
        }

        return x
    }
}
