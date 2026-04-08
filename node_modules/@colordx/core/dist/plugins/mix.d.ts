import { A as AnyColor, h as Plugin } from '../colordx-Bk4xRxEs.js';

declare module '@colordx/core' {
    interface Colordx {
        mix(color: AnyColor | Colordx, ratio?: number): Colordx;
        mixOklab(color: AnyColor | Colordx, ratio?: number): Colordx;
        tints(count?: number): Colordx[];
        shades(count?: number): Colordx[];
        tones(count?: number): Colordx[];
        palette(count: number, target?: AnyColor): Colordx[];
    }
}
declare const mix: Plugin;

export { mix as default };
