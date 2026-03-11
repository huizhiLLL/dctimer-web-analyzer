export type PuzzleTypeInfo = {
  code: number
  idx: number | null
  sub: number | null
  categoryName: string | null
  itemName: string | null
  displayName: string
}

type PuzzleCategory = {
  idx: number
  key: string
  name: string
  items: string[]
}

const PUZZLE_CATEGORIES: PuzzleCategory[] = [
  { idx: 0, key: 'wca', name: 'WCA', items: ['3x3x3', '4x4x4', '5x5x5', '2x2x2', '3x3 BLD', '3x3 OH', '3x3 FM', 'Megaminx', 'Pyraminx', 'Square-1', 'Clock', 'Skewb', '6x6x6', '7x7x7', '4x4 BLD', '5x5 BLD', '3x3 MBLD'] },
  { idx: 1, key: '222', name: '2x2', items: ['random state', '3-gen', '6-gen', 'CLL training', 'EG1 training', 'EG2 training', 'PBL training', 'EG training', 'TCLL+ training', 'TCLL- training', 'No bar'] },
  { idx: 2, key: '333', name: '3x3', items: ['old style', 'random state', 'cross solved', 'last layer', 'PLL', 'edges only', 'corners only', 'last slot+last layer', 'ZBLL', 'ELL', 'CLL', 'last six edges', 'CMLL + LSE', 'edges permutation', 'edges orientation', 'corners permutation', 'corners orientation', 'permutation only', 'orientation only', 'easy cross', '2GLL', 'ZBLS', 'ZZLL', '3-cycle edges', '3-cycle corners', '3x3 for noobs'] },
  { idx: 3, key: '444', name: '4x4', items: ['old style', 'SiGN', 'YJ', 'edges', 'R,r,U,u'] },
  { idx: 4, key: '555', name: '5x5', items: ['prefix', 'SiGN', 'edges'] },
  { idx: 5, key: '666', name: '6x6', items: ['prefix', 'SiGN', 'suffix', 'edges'] },
  { idx: 6, key: '777', name: '7x7', items: ['prefix', 'SiGN', 'suffix', 'edges'] },
  { idx: 7, key: 'mega', name: 'Megaminx', items: ['Pochmann', 'old style'] },
  { idx: 8, key: 'pyr', name: 'Pyraminx', items: ['random state', 'random moves', 'L4E'] },
  { idx: 9, key: 'sq1', name: 'Square-1', items: ['face turn metric', 'twist metric', 'random state', 'cube shape', 'PBL'] },
  { idx: 10, key: 'clk', name: 'Clock', items: ['WCA', 'Jaap order', 'concise', 'efficient pin order'] },
  { idx: 11, key: 'skewb', name: 'Skewb', items: ['random state', 'U L R B', 'L2L'] },
  { idx: 12, key: 'mnl', name: 'LxMxN', items: ['1x3x3', 'Super 1x3x3', '2x3x3', '2x2x3', '2x2x4', '3x3x4', '3x3x5', '3x3x6', '3x3x7', '4x4x6', '8x8x8', '9x9x9', '10x10x10', '11x11x11'] },
  { idx: 13, key: 'cmt', name: 'Cmetrick', items: ['normal', 'mini'] },
  { idx: 14, key: 'gear', name: 'Gear Cube', items: ['random state', '3-gen'] },
  { idx: 15, key: 'smc', name: 'Siamese Cube', items: ['1x1x3 block', '1x2x3 block', '2x2x2 block'] },
  { idx: 16, key: '15p', name: '15 puzzle', items: ['piece moves', 'blank moves'] },
  { idx: 17, key: 'other', name: 'Other', items: ['Latch Cube', 'Helicopter', 'Square-2', 'Super SQ1', 'UFO', 'FTO', 'Redi cube', 'Master pyraminx', '8 puzzle'] },
  { idx: 18, key: '333_sub', name: '3x3 subsets', items: ['2-gen R,U', '2-gen L,U', 'Roux-gen M,U', '3-gen F,R,U', '3-gen R,U,L', '3-gen R,r,U', 'half turns only', 'LSLL(old)'] },
  { idx: 19, key: 'bandage', name: 'Bandaged Cube', items: ['Bicube', 'SQ1 /,(1,0)'] },
  { idx: 20, key: 'minx_sub', name: 'Megaminx subsets', items: ['2-gen R,U', 'LSLL'] },
  { idx: 21, key: 'relay', name: 'Relay', items: ['lots of 3x3s', '234 relay', '2345 relay', '23456 relay', '234567 relay', 'Guildford challenge', 'Mini Guildford challenge'] },
]

export function decodePuzzleType(code: number | null): PuzzleTypeInfo | null {
  if (code === null || Number.isNaN(code)) {
    return null
  }

  const idx = code >> 5
  const sub = code & 31
  const category = PUZZLE_CATEGORIES[idx]
  const itemName = category?.items[sub] ?? null
  const categoryName = category?.name ?? null

  return {
    code,
    idx,
    sub,
    categoryName,
    itemName,
    displayName: itemName ? `${categoryName} · ${itemName}` : `${categoryName ?? '未知项目'} (#${code})`,
  }
}
