/**
 * 求和
 * @param {Array} list
 * @return {Number}
 */
export function sum (list) {
  return list.reduce((acc, cur) => acc + cur, 0)
}

/**
 * 计算方差
 * @param {Array} list
 * @return {Number}
 */
export function variance (list) {
  if (list.length === 0) return 0
  const average = sum(list) / list.length
  const total = list.reduce((acc, cur) => acc + Math.pow(cur - average, 2), 0)
  return total / list.length
}

/**
 * Deep copy the given object considering circular structure.
 * This function caches all nested objects and its copies.
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Array<Object>} cache
 * @return {*}
 */
export function deepCopy (obj, cache = []) {
  // just return if obj is immutable value
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // if obj is hit, it is in circular structure
  const hit = cache.find(c => c.original === obj)
  if (hit) {
    return hit.copy
  }

  const copy = Array.isArray(obj) ? [] : {}
  // put the copy into cache at first
  // because we want to refer it in recursive deepCopy
  cache.push({
    original: obj,
    copy
  })

  Object.keys(obj).forEach(key => {
    copy[key] = deepCopy(obj[key], cache)
  })

  return copy
}
