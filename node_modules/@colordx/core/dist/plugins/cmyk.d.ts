import { a as CmykColor, h as Plugin } from '../colordx-Bk4xRxEs.js';

declare module '@colordx/core' {
    interface Colordx {
        toCmyk(): CmykColor;
        toCmykString(): string;
    }
}
declare const cmyk: Plugin;

export { cmyk as default };
