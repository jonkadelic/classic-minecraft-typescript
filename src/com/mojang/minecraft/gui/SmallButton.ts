import { Button } from "./Button";

export class SmallButton extends Button {
    public constructor(id: number, x: number, y: number, text: string) {
        super(id, x, y, text, 150, 20)
    }
}