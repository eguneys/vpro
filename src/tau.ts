class Tau {


  constructor() {
    this.session = pl.create(100)
  }


  consult(program: string) {
    this.session = pl.create(100)
    let { session } = this
    return new Promise((resolve, reject) => {
      session.consult("\n" + program + "\n", { success: () => resolve(program), error: reject })
    })
  }


  _query(query: string) {
    let { session } = this
    return new Promise((resolve, reject) => {
      session.query(query, { success: resolve, limit: () => reject('limit'), error: reject })
    })
  }

  answer() {
    let { session } = this
    return new Promise((resolve, reject) => 
                       session.answer({ success: 
                                      _ => resolve(session.format_answer(_)), 
                                      limit: () => reject('limit'),
                                      fail: resolve,
                                      error: reject })
                      )
  }

  one(query: string) {
    return this._query(query).then(() => this.answer().then(_ => {
      if (_ === 'true.') {
        return true
      }
      if (_) {
        return format_format(_)
      }
    }))
  }


  async all(query: string) {

    await this._query(query)

    let res = ''
    for (let i = 0; i < 64; i++) {
      let _ = await this.answer()
      if (typeof _ === 'boolean') {
        if (res === '') {
          return _
        } else {
          break
        }
      }
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
  n.replace('.', '').replace(/;$/, '').split(';').forEach(_ => {
    _.split(',').forEach(_ => {
      let [key, value] = _.trim().split(' = ')
      res[key] ||= []
     res[key].push(value)
    })
  })

  return res
}

export default new Tau()
