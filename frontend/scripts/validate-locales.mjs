import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse, TYPE } from '@formatjs/icu-messageformat-parser'

const root = fileURLToPath(new URL('../../', import.meta.url))
const supported = ['en', 'ru']
const extensionRoots = readdirSync(resolve(root, 'extensions'), { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => `extensions/${entry.name}/frontend`)
  .filter(dir => existsSync(resolve(root, dir)))
const sourceRoots = ['frontend/src', ...extensionRoots]
const sources = sourceRoots.flatMap(dir =>
  readdirSync(resolve(root, dir), { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(?:[cm]?[jt]s|svelte)$/.test(entry.name))
    .map(entry => resolve(entry.parentPath, entry.name)),
)
const catalogDirs = ['frontend/src/lib/i18n', ...extensionRoots
  .map(dir => `${dir}/i18n`)
  .filter(dir => existsSync(resolve(root, dir, 'index.ts')))]

const errors = []
const read = path => readFileSync(resolve(root, path), 'utf8')
const sorted = values => [...values].sort()
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const isObject = value => value && typeof value === 'object' && !Array.isArray(value)

function readJSON(path) {
  try {
    return JSON.parse(read(path))
  } catch (err) {
    throw new Error(`${path}: ${err.message}`, { cause: err })
  }
}

function signature(value) {
  // Match svelte-i18n's parser mode, where HTML tags are literal text.
  const parameters = new Set()
  function visit(nodes) {
    for (const node of nodes) {
      if ('value' in node && node.type !== TYPE.literal) {
        parameters.add(`${node.value}:${node.type}`)
      }
      if ('options' in node) {
        for (const option of Object.values(node.options)) visit(option.value)
      }
    }
  }
  visit(parse(value, { ignoreTag: true, requiresOtherClause: true }))
  return sorted(parameters)
}

function compare(en, ru, path) {
  if (typeof en === 'string' && typeof ru === 'string') {
    const signatures = [en, ru].map((message, i) => {
      try {
        return signature(message)
      } catch (err) {
        errors.push(`${path} (${supported[i]}): invalid message format (${err.message})`)
      }
    })
    if (signatures.every(Boolean) && !equal(...signatures)) {
      errors.push(`${path}: interpolation differs (${signatures[0]} vs ${signatures[1]})`)
    }
    return 1
  }

  if (!isObject(en) || !isObject(ru)) {
    errors.push(`${path}: expected matching strings or objects`)
    return 0
  }

  let count = 0
  for (const key of new Set([...Object.keys(en), ...Object.keys(ru)])) {
    if (!Object.hasOwn(en, key) || !Object.hasOwn(ru, key)) {
      errors.push(`${path}.${key}: missing in ${Object.hasOwn(en, key) ? 'ru' : 'en'}`)
      continue
    }
    count += compare(en[key], ru[key], `${path}.${key}`)
  }
  return count
}

for (const dir of catalogDirs) {
  try {
    const files = readdirSync(resolve(root, dir, 'locales')).filter(file => file.endsWith('.json'))
    if (!equal(sorted(files), supported.map(code => `${code}.json`))) {
      errors.push(`${dir}: expected exactly en.json and ru.json`)
    }
    const catalogs = supported.map(code => readJSON(`${dir}/locales/${code}.json`))
    const count = compare(...catalogs, dir)

    const registrations = [...read(`${dir}/index.ts`).matchAll(/\bregister\(\s*['"]([^'"]+)['"]\s*,\s*\(\)\s*=>\s*import\(['"]\.\/locales\/([^'"]+)\.json['"]\)/g)]
    if (!equal(sorted(registrations.map(([, code, file]) => `${code}:${file}`)), ['en:en', 'ru:ru'])) {
      errors.push(`${dir}: expected one loader for each supported locale`)
    }
    console.log(`${dir}: ${count} message pairs`)
  } catch (err) {
    errors.push(`${dir}: ${err.message}`)
  }
}

const coreIndex = read(`${catalogDirs[0]}/index.ts`)
const pickerCodes = [...coreIndex.matchAll(/\{\s*code:\s*['"]([^'"]+)['"]/g)].map(([, code]) => code)
if (!equal(pickerCodes, supported)) errors.push('The language picker must contain en and ru in that order')

for (const path of sources) {
  const source = read(path)
  for (const [, code] of source.matchAll(/\/locales\/([\w-]+)\.json\b/g)) {
    if (!supported.includes(code)) errors.push(`${relative(root, path)}: unsupported catalog ${code}.json`)
  }
  if (/from\s+['"]svelte-i18n['"]/.test(source)) {
    const registrations = [...source.matchAll(/\bregister\(\s*([^,]+),/g)]
    if (registrations.length && !catalogDirs.some(dir => resolve(root, dir, 'index.ts') === path)) {
      errors.push(`${relative(root, path)}: register UI catalogs in an i18n/index.ts module`)
    }
    for (const [, code] of registrations) {
      if (!/^(['"])(?:en|ru)\1\s*$/.test(code)) {
        errors.push(`${relative(root, path)}: unsupported UI locale registration ${code}`)
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
}
