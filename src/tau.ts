export default class Tau {

  constructor() {
    this.session = pl.create()
  }


  consult(program: string) {
    let { session } = this
    return new Promise((resolve, reject) => {
      session.consult("\n" + program + "\n", { success: resolve, error: reject })
    })
  }


  query(query: string) {
    let { session } = this
    return new Promise((resolve, reject) => {
      session.query(query, { success: resolve, error: reject })
    })
  }

  answer() {
    let { session } = this
    return new Promise((resolve, reject) => 
                       session.answer({ success: 
                                      _ => resolve(session.format_answer(_)), 
                                      fail: resolve,
                                      error: reject })
                      )
  }

  one(query: string) {
    return this.query(query).then(() => this.answer().then(_ => _ && format_format(_)))
  }


  async all(query: string) {

    await this.query(query)

    let res = ''
    for (let i = 0; i < 64; i++) {
      let _ = await this.answer()
      if (_) {
        res += _
      } else {
        break
      }
    }
    return format_format(res)
  }

}

function format_format(n: string) {
  let res = {}
  n.replace('.', '').split(';').forEach(_ => {
    _.split(',').forEach(_ => {
      let [key, value] = _.trim().split(' = ')
      res[key] ||= []
     res[key].push(value)
    })
  })

  return res
}
