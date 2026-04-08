import { P as P3Color, A as AnyColor, h as Plugin } from '../colordx-Bk4xRxEs.js';

declare module '@colordx/core' {
    interface Colordx {
        toP3(): P3Color;
        toP3String(): string;
    }
    namespace Colordx {
        function toGamutP3(input: AnyColor): Colordx;
    }
}
/**
 * Convert linear sRGB channels (from oklchToLinear) to gamma-encoded Display-P3 channels.
 * This is the cheap step — only a matrix multiply + gamma encoding, no cbrt.
 * Pair with oklchToLinear to convert one OKLCH color to multiple spaces without
 * repeating the expensive OKLab pipeline.
 */
declare const linearToP3Channels: (lr: number, lg: number, lb: number) => [number, number, number];
/**
 * Convert OKLCH to gamma-encoded Display-P3 channels without object allocation.
 * Returns [r, g, b] in [0, 1] for in-gamut colors. Out-of-gamut channels may
 * exceed this range — callers are responsible for clamping before byte encoding.
 * Uses the sRGB transfer function (P3 does not use DCI-P3 gamma 2.6).
 */
declare const oklchToP3Channels: (l: number, c: number, h: number) => [number, number, number];
/**
 * Returns true if the color is within the Display-P3 gamut.
 * sRGB inputs (hex, rgb, hsl, etc.) always return true (sRGB ⊂ P3).
 */
declare const inGamutP3: (input: AnyColor) => boolean;
declare const p3: Plugin;

export { p3 as default, inGamutP3, linearToP3Channels, oklchToP3Channels };
