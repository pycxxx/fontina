import path from 'node:path'
import { flatten } from 'lodash'
import { promisify } from 'node:util'
import childProcess from 'node:child_process'
import { getSliceRanges } from './ranges'
import { FontLang } from './const'

const exec = promisify(childProcess.exec)

export async function generateFontSlicesForLang({
  name,
  source,
  destDir,
  lang,
}: {
  name: string
  source: string
  destDir: string
  lang: FontLang
}) {
  const ranges = await getSliceRanges(lang)

  for (const block of ranges) {
    const subset = flatten(
      block.ranges.map(range => {
        if (Array.isArray(range)) {
          const [start, end] = range
          return Array.from({ length: end - start + 1 }, (_, i) => start + i)
        }
        return range
      })
    )

    const filePath = path.join(destDir, `${name}-${block.name}.woff2`)
    await generateFontSlice(source, filePath, subset)
  }
}

export async function generateFontSlice(source: string, dest: string, subset: number[]) {
  await exec(
    `pyftsubset ${source} --no-hinting --no-recommended-glyphs --ignore-missing-glyphs  --with-zopfli --flavor=woff2 --output-file=${dest} --unicodes=${subset.map(cp => cp.toString(16)).join(',')}`
  )
}
