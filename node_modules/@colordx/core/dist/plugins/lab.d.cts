import { L as LabColor, X as XyzColor, A as AnyColor, h as Plugin } from '../colordx-Bk4xRxEs.cjs';

declare module '@colordx/core' {
    interface Colordx {
        toLab(): LabColor;
        toLabString(): string;
        toXyz(): XyzColor;
        toXyzString(): string;
        mixLab(color: AnyColor, ratio?: number): Colordx;
        delta(color?: AnyColor): number;
    }
}
declare const lab: Plugin;

export { lab as default };
