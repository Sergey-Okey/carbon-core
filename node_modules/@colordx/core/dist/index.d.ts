import { A as AnyColor, C as ColorFormat } from './colordx-Bk4xRxEs.js';
export { a as CmykColor, b as ColorParser, c as Colordx, H as HslColor, d as HsvColor, e as HwbColor, L as LabColor, f as LchColor, O as OklabColor, g as OklchColor, P as P3Color, h as Plugin, R as Rec2020Color, i as RgbColor, X as XyzColor, j as colordx, k as extend, n as nearest, r as random } from './colordx-Bk4xRxEs.js';

declare const getFormat: (input: AnyColor) => ColorFormat | undefined;

/**
 * Returns true if the color is within the sRGB gamut.
 * Always true for hex, rgb, hsl, hsv, and hwb inputs.
 * For oklch/oklab inputs, checks whether the computed linear sRGB channels are in [0, 1].
 */
declare const inGamutSrgb: (input: AnyColor) => boolean;

/**
 * Convert OKLCH to unclamped linear sRGB channels without object allocation.
 * This is the shared expensive step (OKLCH → OKLab → linear sRGB via 3× cbrt + matrix).
 * Use this when you need multiple color spaces from the same color — compute once,
 * then pass to linearToP3Channels / linearToRec2020Channels (from their plugins) to avoid duplicate work.
 *
 * In-gamut sRGB colors have all channels in [0, 1]. Channels outside this range
 * indicate an out-of-gamut color — use as a free gamut check.
 */
declare const oklchToLinear: (l: number, c: number, h: number) => [number, number, number];
/**
 * Convert OKLCH to gamma-encoded sRGB channels without object allocation.
 * Returns [r, g, b] in [0, 1] for in-gamut colors. Out-of-gamut channels may
 * exceed this range — callers are responsible for clamping before byte encoding.
 */
declare const oklchToRgbChannels: (l: number, c: number, h: number) => [number, number, number];
/**
 * Convert OKLCH to both linear and gamma-encoded sRGB channels in a single pass.
 * Avoids recomputing the expensive OKLCH → OKLab → linear step when you need both.
 *
 * Linear channels are useful for gamut checks (all in [0,1] = in sRGB gamut)
 * and as input to P3/Rec2020 conversion matrices.
 * Gamma channels are ready for display on an sRGB canvas (still need clamping for out-of-gamut).
 *
 * Returns [[lr, lg, lb], [sr, sg, sb]] — both in [0, 1] for in-gamut colors.
 */
declare const oklchToLinearAndSrgb: (l: number, c: number, h: number) => [[number, number, number], [number, number, number]];

export { AnyColor, ColorFormat, getFormat, inGamutSrgb, oklchToLinear, oklchToLinearAndSrgb, oklchToRgbChannels };
