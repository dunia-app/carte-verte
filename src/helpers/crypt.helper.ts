import crypto from 'crypto'

const encryptAlgo = 'aes-192-cbc'

export function encrypt(text: string, password: string, salt: string) {
  const key = crypto.scryptSync(password, salt, 24)
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(encryptAlgo, key, iv)

  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')

  return iv.toString('hex') + ':' + crypted
}

export function decrypt(encrypted: string, password: string, salt: string) {
  const key = crypto.scryptSync(password, salt, 24)

  const encryptedArray = encrypted.split(':')
  const iv = Buffer.from(encryptedArray[0], 'hex')
  const decipher = crypto.createDecipheriv(encryptAlgo, key, iv)

  let decrypted = decipher.update(
    Buffer.from(encryptedArray[1], 'hex'),
    undefined,
    'utf8',
  )
  decrypted += decipher.final('utf8')

  return decrypted
}
