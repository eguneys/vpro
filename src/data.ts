import _puzzles from '../assets/athousand_sorted.csv'

let roles = ['k', 'q', 'r', 'n', 'b', 'p']
let files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
let ranks = ['1', '2', '3', '4', '5', '6', '7', '8']

export function fen_pieses(fen: string) {
  let [_pieses] = fen.split(' ')

  let pieses = _pieses.split('/').flatMap((line, i) => {
    let rank = 7 - i
    let file = 0
    let res = []
    for (let char of line) {

      if (roles.indexOf(char.toLowerCase()) !== -1) {

        let color = char.toLowerCase() === char ? 'b' : 'w'
        let role = char.toLowerCase()
        let pos = files[file] + ranks[rank]
        res.push(`${color}${role}@${pos}`)
        file++;
      } else {
        file += parseInt(char)
      }
    }
    return res
  })

  return pieses
}


function read(data) {
  return data.trim()
  .split('\n')
  .map(line => {
    let [id, fen, moves, rating, _, __, ___, tags, link] = line.split(',')
    return {
      id,
      fen,
      moves,
      rating,
      tags,
      link
    }
  })
}

  export const puzzles = read(_puzzles)
