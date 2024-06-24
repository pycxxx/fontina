import { promises as fs } from 'node:fs'
import path from 'node:path'
import { FontLang } from './const'
import { getSliceRanges as getSliceRanges } from './ranges'

export async function generateCssFile({
  basePath,
  dest,
  lang,
  name,
}: {
  basePath: string
  dest: string
  lang: FontLang
  name: string
}) {
  const ranges = await getSliceRanges(lang)

  let result = ''
  for (const range of ranges) {
    result += `/* ${range.name} */\n`
    result += `@font-face {\n`
    result += `  font-family: '${name}';\n`
    result += `  src: url('${basePath}/${name}-${range.name}.woff2') format('woff2');\n`
    result += `  font-weight: 400;\n`
    result += `  font-style: normal;\n`
    result += `  unicode-range: ${range.ranges
      .map(range => {
        if (Array.isArray(range)) {
          return `U+${range[0].toString(16).toUpperCase()}-${range[1].toString(16).toUpperCase()}`
        }
        return `U+${range.toString(16).toUpperCase()}`
      })
      .join(', ')};\n`
    result += `}\n\n`
  }

  await fs.writeFile(path.join(dest, `${name}.css`), result)
}
