interface RgbColor {
    r: number;
    g: number;
    b: number;
    alpha: number;
}
interface HslColor {
    h: number;
    s: number;
    l: number;
    alpha: number;
}
interface HsvColor {
    h: number;
    s: number;
    v: number;
    alpha: number;
}
interface HwbColor {
    h: number;
    /** Whiteness [0, 100] */
    w: number;
    /** Blackness [0, 100] */
    b: number;
    alpha: number;
}
/** CIE LAB (D50) */
interface LabColor {
    l: number;
    /** Green–red axis */
    a: number;
    /** Blue–yellow axis */
    b: number;
    alpha: number;
    readonly colorSpace: 'lab';
}
/** CIE LCH (D50) */
interface LchColor {
    l: number;
    c: number;
    h: number;
    alpha: number;
    readonly colorSpace: 'lch';
}
/** CIE XYZ (D65) */
interface XyzColor {
    x: number;
    y: number;
    z: number;
    alpha: number;
}
interface CmykColor {
    c: number;
    m: number;
    y: number;
    k: number;
    alpha: number;
}
/** Oklab — perceptually uniform, D65 */
interface OklabColor {
    l: number;
    /** Green–red axis */
    a: number;
    /** Blue–yellow axis */
    b: number;
    alpha: number;
}
/** Oklch — perceptually uniform, polar form of Oklab */
interface OklchColor {
    l: number;
    c: number;
    h: number;
    alpha: number;
}
/** CSS Color 4 Display-P3 */
interface P3Color {
    r: number;
    g: number;
    b: number;
    alpha: number;
    readonly colorSpace: 'display-p3';
}
/** CSS Color 4 Rec.2020 */
interface Rec2020Color {
    r: number;
    g: number;
    b: number;
    alpha: number;
    readonly colorSpace: 'rec2020';
}
type AnyColor = string | RgbColor | HslColor | HsvColor | HwbColor | LabColor | LchColor | XyzColor | CmykColor | OklabColor | OklchColor | P3Color | Rec2020Color;
type ColorParser<T = AnyColor> = (input: T) => RgbColor | null;
type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv' | 'hwb' | 'oklab' | 'oklch' | 'lab' | 'lch' | 'xyz' | 'cmyk' | 'p3' | 'rec2020' | 'name';

declare const _SENTINEL: unique symbol;
declare class Colordx {
    private readonly _rgb;
    private readonly _valid;
    constructor(input: AnyColor | Colordx | typeof _SENTINEL, _direct?: RgbColor);
    private static _make;
    /**
     * Construct a Colordx from OKLab values, storing unclamped gamma-encoded sRGB internally.
     * Unlike new Colordx(oklabObject), this does NOT clamp channels to [0, 1] before gamma encoding,
     * so wide-gamut P3/Rec2020 colors are preserved accurately for toP3() / toRec2020() output.
     * sRGB output methods (toRgb, toHex, etc.) clamp to [0, 255] before returning.
     */
    static _makeFromOklab({ l, a, b, alpha }: OklabColor): Colordx;
    isValid(): boolean;
    toRgb(): RgbColor;
    /** Returns the internal unrounded RGB. Intended for plugin use where deferred rounding matters. */
    _rawRgb(): RgbColor;
    toRgbString(): string;
    toHex(): string;
    /** Returns a 24-bit RGB integer (0x000000–0xFFFFFF). Alpha is not included. */
    toNumber(): number;
    toHsl(precision?: number): HslColor;
    toHslString(precision?: number): string;
    toOklab(): OklabColor;
    toOklabString(): string;
    toOklch(): OklchColor;
    toOklchString(): string;
    brightness(): number;
    isDark(): boolean;
    isLight(): boolean;
    alpha(): number;
    alpha(value: number): Colordx;
    hue(): number;
    hue(value: number): Colordx;
    lightness(): number;
    lightness(value: number): Colordx;
    chroma(): number;
    chroma(value: number): Colordx;
    lighten(amount?: number, options?: {
        relative?: boolean;
    }): Colordx;
    darken(amount?: number, options?: {
        relative?: boolean;
    }): Colordx;
    saturate(amount?: number, options?: {
        relative?: boolean;
    }): Colordx;
    desaturate(amount?: number, options?: {
        relative?: boolean;
    }): Colordx;
    grayscale(): Colordx;
    invert(): Colordx;
    rotate(amount?: number): Colordx;
    isEqual(color: AnyColor): boolean;
    toString(): string;
    /**
     * Maps an out-of-sRGB-gamut color into sRGB using the CSS Color 4 gamut mapping algorithm.
     * Colors already in gamut are returned as-is. sRGB inputs (hex, rgb, hsl, etc.) are passed through.
     */
    static toGamutSrgb: (input: AnyColor) => Colordx;
}
type Plugin = (ColordxClass: typeof Colordx, parsers: ColorParser[], formatParsers: [ColorParser, ColorFormat][]) => void;
declare const colordx: (input: AnyColor | Colordx) => Colordx;
declare const extend: (plugins: Plugin[]) => void;
declare const nearest: <T extends AnyColor>(color: AnyColor, candidates: T[]) => T;
declare const random: () => Colordx;

export { type AnyColor as A, type ColorFormat as C, type HslColor as H, type LabColor as L, type OklabColor as O, type P3Color as P, type Rec2020Color as R, type XyzColor as X, type CmykColor as a, type ColorParser as b, Colordx as c, type HsvColor as d, type HwbColor as e, type LchColor as f, type OklchColor as g, type Plugin as h, type RgbColor as i, colordx as j, extend as k, nearest as n, random as r };
