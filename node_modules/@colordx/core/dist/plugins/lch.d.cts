import { f as LchColor, h as Plugin } from '../colordx-Bk4xRxEs.cjs';

declare module '@colordx/core' {
    interface Colordx {
        toLch(): LchColor;
        toLchString(): string;
    }
}
declare const lch: Plugin;

export { lch as default };
