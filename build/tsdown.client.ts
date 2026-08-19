/**
 * Reproducible tsdown preset for DSH Web plugins.
 * Emits a closure-factory artifact: the bundle calls window.__ModuleLoader__.load
 * ({id, factory}) and resolves externals through the injected require.
 * CSS Modules are compiled by lightningcss inside the bundle: importing
 * `x.module.css` yields the hashed class map, and the css text auto-injects
 * a <style data-plugin="<id>"> tag at factory execution.
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, dirname, relative, resolve as resolvePath, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { UserConfig } from 'tsdown'
import { transform } from 'lightningcss'
import { PLATFORM_MODULES } from './web-platform.ts'

const CSS_VIRTUAL_PREFIX = '\0dsh-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

export const CLIENT_EXTERNALS: readonly string[] = [...PLATFORM_MODULES]

const REPOSITORY_ROOT = fileURLToPath(new URL('..', import.meta.url))

export function clientBundle(
  id: string,
  libEntry: readonly string[] = ['src/index.ts']
): UserConfig[] {
  const cssFiles = new Map<string, string>()

  const nodeConfig: UserConfig = {
    name: id,
    entry: [...libEntry],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: true,
    clean: true,
    external: ['@deepseek-ai/cordis', 'cordis'],
  }

  const clientConfig: UserConfig = {
    name: `${id}/client`,
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    dts: false,
    sourcemap: true,
    clean: false,
    external: [...CLIENT_EXTERNALS],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
    },
    noExternal: (specifier: string) => (CLIENT_EXTERNALS.includes(specifier) ? undefined : true),
    plugins: [
      {
        name: 'dsh-css-modules-inline',
        resolveId(source: string, importer: string | undefined) {
          if (!source.endsWith('.module.css') && !source.endsWith('.css')) return null
          const abs = importer !== undefined ? resolvePath(dirname(importer), source) : source
          const virtualId = CSS_VIRTUAL_PREFIX + abs + CSS_VIRTUAL_SUFFIX
          cssFiles.set(virtualId, abs)
          return virtualId
        },
        async load(virtualId: string) {
          if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
          const fileId = cssFiles.get(virtualId) ?? virtualId.slice(CSS_VIRTUAL_PREFIX.length, -CSS_VIRTUAL_SUFFIX.length)
          this.addWatchFile(fileId)
          const source = await readFile(fileId)
          const isModule = fileId.endsWith('.module.css')

          if (isModule) {
            const { code, exports: cssExports } = transform({
              filename: fileId,
              code: source,
              cssModules: { pattern: '[hash]_[local]' },
              minify: true,
            })
            const classMap: Record<string, string> = {}
            for (const [local, exp] of Object.entries(cssExports ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
              classMap[local] = exp.name
            }
            return [
              `const css = ${JSON.stringify(code.toString())};`,
              `const tagId = ${JSON.stringify(`${id}/${basename(fileId)}`)};`,
              `if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') === null) {`,
              `  const tag = document.createElement('style');`,
              `  tag.dataset.plugin = ${JSON.stringify(id)};`,
              `  tag.dataset.pluginCss = tagId;`,
              `  tag.textContent = css;`,
              `  document.head.appendChild(tag);`,
              `}`,
              `export default ${JSON.stringify(classMap)};`,
            ].join('\n')
          }

          const { code } = transform({
            filename: fileId,
            code: source,
            minify: true,
          })
          return [
            `const css = ${JSON.stringify(code.toString())};`,
            `const tagId = ${JSON.stringify(`${id}/${basename(fileId)}`)};`,
            `if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') === null) {`,
            `  const tag = document.createElement('style');`,
            `  tag.dataset.plugin = ${JSON.stringify(id)};`,
            `  tag.dataset.pluginCss = tagId;`,
            `  tag.textContent = css;`,
            `  document.head.appendChild(tag);`,
            `}`,
            `export default css;`,
          ].join('\n')
        },
      },
    ],
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  }

  return [nodeConfig, clientConfig]
}
