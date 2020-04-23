import crypto from 'crypto'
import getConfig from './config'

export function getLocalKey () {
  const sign = crypto.createHash('md5').update(`${JSON.stringify(getConfig(0))}${JSON.stringify(getConfig(1))}`).digest('hex')
  return `config_${sign}`
}
