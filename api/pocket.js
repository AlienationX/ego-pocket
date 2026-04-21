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

export const buyPokeballs = (amount) => {
  return request({ url: '/player/buy_pokeballs/', method: 'POST', data: { amount } })
}

export const getPokedex = () => {
  return request({ url: '/pokedex/' })
}

export const getUserPokemon = () => {
  return request({ url: '/user-pokemon/' })
}

export const encounterPokemon = () => {
  return request({ url: '/catch/' })
}

export const catchPokemon = (pokemon_id) => {
  return request({ url: '/catch/', method: 'POST', data: { pokemon_id } })
}

export const getAllPokemon = () => {
  return request({ url: '/pokemon/' })
}
