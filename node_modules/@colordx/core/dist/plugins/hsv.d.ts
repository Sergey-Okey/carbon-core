import { d as HsvColor, h as Plugin } from '../colordx-Bk4xRxEs.js';

declare module '@colordx/core' {
    interface Colordx {
        toHsv(): HsvColor;
        toHsvString(): string;
    }
}
declare const hsv: Plugin;

export { hsv as default };
