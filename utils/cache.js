// server/utils/cache.js (Node.js 环境)
const cacheMap = new Map()

module.exports = {
  async get(key) {
    return cacheMap.get(key) || null
  },
  async set(key, value) {
    cacheMap.set(key, value)
  }
}