import path from 'node:path'
import arg from 'arg'
import { generateFontSlicesForLang } from '../font/slice'
import { FontLang, generateCssFile } from '../font'
import { mkdirp } from 'mkdirp'

async function main() {
  const args = arg({
    '--lang': String,
    '--out': String,
    '--name': String,
    '--base-url': String,
  })
  const file = args._[0]
  const lang = args['--lang'] as FontLang
  const out = args['--out']
  const name = args['--name']
  const baseUrl = args['--base-url'] ?? ''

  if (!file || !lang || !out || !name) {
    console.log()
    console.log('  Usage: yarn:slice <file> --lang <language> --out <output_dir> --name <font_family_name>')
    console.log()
    process.exit(1)
  }

  await mkdirp(path.join(out, 'slices'))

  await generateFontSlicesForLang({
    name,
    source: file,
    destDir: path.join(out, 'slices'),
    lang,
  })

  await generateCssFile({
    basePath: baseUrl + '/slices',
    dest: out,
    lang,
    name,
  })
}


main().catch(err => {
  console.error(err)
  process.exit(1)
})
