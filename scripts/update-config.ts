import { generateBlockRangesFiles } from '../font'

generateBlockRangesFiles().catch(err => {
  console.error(err)
  process.exit(1)
})
