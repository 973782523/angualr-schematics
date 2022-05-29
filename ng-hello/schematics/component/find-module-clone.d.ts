/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Path } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
export interface ModuleOptions {
    module?: string;
    name: string;
    flat?: boolean;
    path?: string;
    skipImport?: boolean;
    moduleExt?: string;
    routingModuleExt?: string;
    standalone?: boolean;
}
export declare const MODULE_EXT = ".module.clone.ts";
export declare const ROUTING_MODULE_EXT = "-routing.module.ts";
/**
 * 找到传递给示意图的一组选项所引用的模块。
 */
export declare function findModuleFromOptionsClone(host: Tree, options: ModuleOptions): Path | undefined;
/**
 * Function to find the "closest" module to a generated file's path.
 */
export declare function findModule(host: Tree, generateDir: string, moduleExt?: string, routingModuleExt?: string): Path;
/**
 * Build a relative path from one file path to another file path.
 */
export declare function buildRelativePath(from: string, to: string): string;
