const make_storage = (storage: Storage) => {
  let api = {

    get: (k: string) => storage.getItem(k),
    set: (k: string, v: string) => storage.setItem(k, v),
    remove: (k: string) => storage.removeItem(k),
    make: (k: string) => ({
      get: () => api.get(k),
      set: (v: any) => api.set(k, v),
      remove: () => api.remove(k)
    })
  }
  return api
}

export const storage = make_storage(window.localStorage)

export const file_store = storage.make('vpro-chess.pl')
export const cursor_store = storage.make('vpro-chess.cu')
