export function mapmap<K, A, B>(obj: Map<K, A>, fn: (k: K, a: A) => B | undefined): Map<K, B> {
  let res = new Map<K, B>()
  for (let [key, value] of obj) {
    let v2 = fn(key, value)
    if (v2) {
      res.set(key, v2)
    }
  }
  return res
}


export const pos_make = (file: string, rank: string) => {
  return file + rank
}

export const epos_make = (efile: number, erank: number) => {
  return pos_make(files[efile -1 ], ranks[erank-1])
}

export const files = ['a', 'b', 'c' , 'd', 'e', 'f', 'g', 'h']
export const ranks = ['1', '2', '3', '4', '5', '6', '7', '8']
export const eposs = [1, 2, 3, 4, 5, 6, 7, 8]

export const posmap: PosMap<Pos> = (() => {
  let res = new Map<Pos, Pos>()
  eposs.forEach(file => eposs.forEach(rank => {
    res.set(epos_make(file, rank), epos_make(file, rank))
  })) 
  return res
})()


export const pos_file = (pos: string) => pos[0]
export const promotables = ['b', 'n', 'q', 'r']

export const uci_pos = (uci: string) => uci
export const uci_promotable = (uci: string) => {
  let res = uci.toLowerCase()
  if (isPromotable(res)) { return res }
}

export function isPromotable(_: string): _ is PromotableRole {
  return promotables.includes(_ as PromotableRole)
}


export function uci_uci(uci: string) {
  if (uci.length === 4) {
    let orig = uci_pos(uci.slice(0, 2)),
      dest = uci_pos(uci.slice(2))

    if (orig && dest) {
      return {
        orig,
        dest
      }
    }
  } else if (uci.length === 6) {
    let orig = uci_pos(uci.slice(0, 2)),
      dest = uci_pos(uci.slice(2))
    let promote = uci_promotable(uci[5])

    if (orig && dest && promote) {
      return {
        orig,
        dest,
        promote
      }
    }
  }
}


export type UciChar = string

export type FilePairPromotable = string

export function uci_char(uci: Uci) {
  let { orig, dest } = uci
  if (uci.promote) {
    return pos_to2char(orig) + pos_to2char_p(pos_file(dest), uci.promote)
  } else {
    return pos_to2char(orig) + pos_to2char(dest)
  }
}


const charShift = 35
export const voidChar = String.fromCharCode(33) // '!'. skip 34 \"

const pos_hash = (pos: Pos) => (files.indexOf(pos[0]) - 1) * 8 + ranks.indexOf(pos[1]) - 1

const pos2charMap: PosMap<string> = mapmap(posmap, (pos, _) => {
  return String.fromCharCode(pos_hash(pos) + charShift)
})

const pos_to2char = (pos: Pos) => pos2charMap.get(pos) || voidChar

const promotion2charMap: Map<FilePairPromotable, string> = new Map()
promotables.map((role, i) => {
  eposs.map(file => {
    let key = role + file
    let res = String.fromCharCode(charShift + pos2charMap.size + i * 8 + file - 1)
    promotion2charMap.set(key, res)
  })
})

const pos_to2char_p = (file: File, role: PromotableRole) => promotion2charMap.get(role + file) || voidChar

