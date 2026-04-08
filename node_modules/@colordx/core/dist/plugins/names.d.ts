import { h as Plugin } from '../colordx-Bk4xRxEs.js';

declare module '@colordx/core' {
    interface Colordx {
        toName(options?: {
            closest?: boolean;
        }): string | undefined;
    }
}
declare const names: Plugin;

export { names as default };
