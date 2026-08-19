import { Context } from "cordis";
//#region src/index.d.ts
declare const name = "@dsh-external/dsh-peak";
/**
 * Register plugin with Cordis host context.
 */
declare function apply(_ctx: Context): void;
//#endregion
export { apply, apply as default, name };