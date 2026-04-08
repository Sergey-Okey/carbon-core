import { R as Rec2020Color, A as AnyColor, h as Plugin } from '../colordx-Bk4xRxEs.cjs';

declare module '@colordx/core' {
    interface Colordx {
        toRec2020(): Rec2020Color;
        toRec2020String(): string;
    }
    namespace Colordx {
        function toGamutRec2020(input: AnyColor): Colordx;
    }
}
/**
 * Convert linear sRGB channels (from oklchToLinear) to gamma-encoded Rec.2020 channels.
 * This is the cheap step — only a matrix multiply + BT.2020 gamma, no cbrt.
 */
declare const linearToRec2020Channels: (lr: number, lg: number, lb: number) => [number, number, number];
/**
 * Convert OKLCH to gamma-encoded Rec.2020 channels without object allocation.
 * Returns [r, g, b] in [0, 1] for in-gamut colors. Out-of-gamut channels may
 * exceed this range — callers are responsible for clamping before byte encoding.
 * Uses the BT.2020 transfer function (exponent 0.45, distinct from sRGB 1/2.4).
 */
declare const oklchToRec2020Channels: (l: number, c: number, h: number) => [number, number, number];
/**
 * Returns true if the color is within the Rec.2020 gamut.
 * sRGB inputs (hex, rgb, hsl, etc.) always return true (sRGB ⊂ Rec.2020).
 */
declare const inGamutRec2020: (input: AnyColor) => boolean;
declare const rec2020: Plugin;

export { rec2020 as default, inGamutRec2020, linearToRec2020Channels, oklchToRec2020Channels };
