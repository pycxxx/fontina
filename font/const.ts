import path from 'node:path'

export enum FontLang {
  TC = 'TC',
  SC = 'SC',
  JP = 'JP',
  KR = 'KR',
}

export const SLICE_CONFIG_DIR = path.join(__dirname, 'slices')
