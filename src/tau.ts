class Tau {


  constructor() {
    this.session = pl.create(1000)
  }


  consult(program: string) {
    this.session = pl.create(1000)
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

/*

   Ls = [ok(b-k-(g-1)),check(w-r-(c-6)-(w-r-(c-1)),g-1),flee(b-k-(g-1),b-k-(g-2))] ;
 */

function format_format(n: string) {
  console.log(n)
  let res = {}
  n.replace('.', '').replace(/;$/, '').split(';').forEach(_ => {
    _.split(', ').forEach(_ => {
      let [key, value] = _.trim().split(' = ')

      let arr_match = value.match(/\[([^\]]*)\]/)

      if (arr_match) {

        value = splitNoParen(arr_match[1])
      }

      res[key] ||= []
      res[key].push(value)
    })
  })

  return res
}


/* https://stackoverflow.com/questions/25058134/javascript-split-a-string-by-comma-except-inside-parentheses */
function splitNoParen(s){
  let results = [];
  let next;
  let str = '';
  let left = 0, right = 0;

  function keepResult() {
    results.push(str);
    str = '';
  }

  for(var i = 0; i<s.length; i++) {
    switch(s[i]) {
      case ',': 
        if((left === right)) {
          keepResult();
          left = right = 0;
        } else {
          str += s[i];
        }
        break;
      case '(':
        left++;
        str += s[i];
        break;
      case ')':
        right++;
        str += s[i];
        break;
      default: 
        str += s[i];
    }
  }
  keepResult();
  return results;
}



export default new Tau()
