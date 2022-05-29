"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const core_1 = require("@angular-devkit/core");
const ts = require("@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const change_1 = require("@schematics/angular/utility/change");
const find_module_1 = require("@schematics/angular/utility/find-module");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const validation_1 = require("@schematics/angular/utility/validation");
const workspace_1 = require("@schematics/angular/utility/workspace");
const schema_1 = require("./schema");
const find_module_clone_1 = require("./find-module-clone");
function readIntoSourceFile(host, modulePath) {
    const text = host.read(modulePath);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    return ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
}
// 把组件添加的模块上的
function addDeclarationToNgModule(options) {
    return (host) => {
        if (options.skipImport || options.standalone || !options.module) {
            return host;
        }
        options.type = options.type != null ? options.type : 'Component';
        const modulePath = options.module;
        const source = readIntoSourceFile(host, modulePath);
        const componentPath = `/${options.path}/` +
            (options.flat ? '' : core_1.strings.dasherize(options.name) + '/') +
            core_1.strings.dasherize(options.name) +
            (options.type ? '.' : '') +
            core_1.strings.dasherize(options.type);
        const relativePath = (0, find_module_1.buildRelativePath)(modulePath, componentPath);
        const classifiedName = core_1.strings.classify(options.name) + core_1.strings.classify(options.type);
        const declarationChanges = (0, ast_utils_1.addDeclarationToModule)(source, modulePath, classifiedName, relativePath);
        const declarationRecorder = host.beginUpdate(modulePath);
        for (const change of declarationChanges) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        if (options.export) {
            // Need to refresh the AST because we overwrote the file in the host.
            const source = readIntoSourceFile(host, modulePath);
            const exportRecorder = host.beginUpdate(modulePath);
            const exportChanges = (0, ast_utils_1.addExportToModule)(source, modulePath, core_1.strings.classify(options.name) + core_1.strings.classify(options.type), relativePath);
            for (const change of exportChanges) {
                if (change instanceof change_1.InsertChange) {
                    exportRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
            host.commitUpdate(exportRecorder);
        }
        return host;
    };
}
function buildSelector(options, projectPrefix) {
    let selector = core_1.strings.dasherize(options.name);
    if (options.prefix) {
        selector = `${options.prefix}-${selector}`;
    }
    else if (options.prefix === undefined && projectPrefix) {
        selector = `${projectPrefix}-${selector}`;
    }
    return selector;
}
function default_1(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        // 读取angular.json 文件
        const workspace = yield (0, workspace_1.getWorkspace)(host);
        /*
        * 拿到的值有两个方法
        * extensions
        * > extensions[xxxx]  拿到当前的某某属性
        * projects 就是angular.json中的project属性, 也有一些方法
        * > 比如 .projects.get('xx')  拿到对应的属性
        * */
        const defaultProjectName = workspace.extensions['defaultProject'];
        // 如果不--project 编写, 就取默认的
        const project = workspace.projects.get((options.project || defaultProjectName));
        // 如果没有就报错
        if (!project) {
            throw new schematics_1.SchematicsException(`Project "${options.project}" does not exist.`);
        }
        // 如果没有设置--path
        if (options.path === undefined) {
            // 构建用于生成的默认项目路径。
            // @param项目将生成其默认路径的项目。
            options.path = (0, workspace_1.buildDefaultPath)(project);
            // options.path=  /src/app
        }
        // 找到传递给示意图的一组选项所引用的模块
        // export const MODULE_EXT = '.module.ts'; 找到对应的默认
        // export const ROUTING_MODULE_EXT = '-routing.module.ts';
        // options.module = findModuleFromOptions(host, options);
        options.module = (0, find_module_clone_1.findModuleFromOptionsClone)(host, options);
        const parsedPath = (0, parse_name_1.parseName)(options.path, options.name);
        // 自己设置的name
        options.name = parsedPath.name;
        // 当前所在的地址
        options.path = parsedPath.path;
        // 选择器, 加前缀, 例如 selector: app-xxx
        // selector = `${options.prefix}-${selector}`;
        options.selector =
            options.selector || buildSelector(options, (project && project.prefix) || '');
        // 必须以字母开头，并且必须只包含字母数字字符或破折号。
        (0, validation_1.validateHtmlSelector)(options.selector);
        //是否生成css文件夹  --inlineStyle 别名  --s
        const skipStyleFile = options.inlineStyle || options.style === schema_1.Style.None;
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files'), [
            skipStyleFile ? (0, schematics_1.filter)((path) => !path.endsWith('.__style__.template')) : (0, schematics_1.noop)(),
            options.inlineTemplate ? (0, schematics_1.filter)((path) => !path.endsWith('.html.template')) : (0, schematics_1.noop)(),
            (0, schematics_1.applyTemplates)(Object.assign(Object.assign(Object.assign({}, core_1.strings), { 'if-flat': (s) => (options.flat ? '' : s) }), options)),
            !options.type
                ? (0, schematics_1.forEach)(((file) => {
                    return file.path.includes('..')
                        ? {
                            content: file.content,
                            path: file.path.replace('..', '.'),
                        }
                        : file;
                }))
                : (0, schematics_1.noop)(),
            (0, schematics_1.move)(parsedPath.path),
        ]);
        // 将多个规则链接到一个规则中。
        return (0, schematics_1.chain)([addDeclarationToNgModule(options), (0, schematics_1.mergeWith)(templateSource)]);
    });
}
exports.default = default_1;
//# sourceMappingURL=index.js.map