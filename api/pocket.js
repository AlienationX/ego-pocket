const BASE_URL = 'http://127.0.0.1:8000/pocket'

export const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: options.header || {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        resolve(res.data)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export const getPlayerInfo = () => {
  return request({ url: '/player/me/' })
}

export const getPlayerStats = () => {
  return request({ url: '/player/stats/' })
}

export const buyPokeballs = (amount) => {
  return request({ url: '/player/buy_pokeballs/', method: 'POST', data: { amount } })
}

export const buyBerries = (amount) => {
  return request({ url: '/player/buy_berries/', method: 'POST', data: { amount } })
}

export const getPokedex = () => {
  return request({ url: '/pokedex/' })
}

export const getPlayerPokemon = (page = 1, search = '') => {
  return request({ url: `/user-pokemon/?page=${page}&search=${search}` })
}

export const encounterPokemon = () => {
  return request({ url: '/catch/' })
}

export const catchPokemon = (pokemon_id, use_berry = false, weather = '', nickname = '') => {
  return request({ url: '/catch/', method: 'POST', data: { pokemon_id, use_berry, weather, nickname } })
}

export const getAllPokemon = (page = 1, search = '') => {
  return request({ url: `/pokemon/?page=${page}&search=${search}` })
}

export const getPokemonDetail = (id) => {
  return request({ url: `/pokemon/${id}/` })
}
