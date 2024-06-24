import css from 'css'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { SLICE_CONFIG_DIR, FontLang } from './const'

const getCssUrl = (lang: FontLang) => `https://fonts.googleapis.com/css2?family=Noto+Sans+${lang}`

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const getFilePath = (lang: FontLang) => path.join(SLICE_CONFIG_DIR, `${lang}.json`)

export interface Block {
  name: string
  ranges: Array<[number, number] | number>
}

export const generateSliceRangesFiles = async () => {
  for (const lang of Object.values(FontLang)) {
    console.log(`Generating block ranges for ${lang}...`)
    const blocks = await fetchSliceRanges(lang)
    await fs.writeFile(getFilePath(lang), JSON.stringify(blocks, null, 2))
    console.log(`Block ranges for ${lang} generated`)
  }
}

export const getSliceRanges = async (lang: FontLang): Promise<Block[]> => {
  const content = await fs.readFile(getFilePath(lang), 'utf8')
  return JSON.parse(content)
}

export const fetchSliceRanges = async (lang: FontLang) => {
  const url = getCssUrl(lang)
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  })
  const content = await res.text()
  const obj = (css as any).parse(content, { compress: false })
  let block = { name: '', ranges: [] }
  const blocks: Block[] = []

  obj.stylesheet.rules.forEach((rule: any) => {
    switch (rule.type) {
      case 'font-face':
        const value =
          (rule as any).declarations.find(({ property }: { property: string }) => property === 'unicode-range')
            ?.value ?? ''
        block.ranges = value.split(',').map((range: string) => {
          range = range.trim().replace(/^U\+/, '')
          if (/\?/.test(range)) {
            throw new Error('Unsupported range')
          }
          if (!/-/.test(range)) {
            return parseInt(range, 16)
          }
          return range.split('-').map(v => parseInt(v, 16))
        })
        blocks.push(block)
        block = { name: '', ranges: [] }
        break
      case 'comment':
        block.name = (rule as any).comment.trim()
        break
      default:
        throw new Error('Unknown rule type')
    }
  })

  return blocks
}
