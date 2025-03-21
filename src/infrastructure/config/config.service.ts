import { Injectable, UnauthorizedException } from '@nestjs/common'
import { hashSync } from 'bcrypt'
import { DotenvParseOutput } from 'dotenv'
import { join } from 'path'
import { decrypt, encrypt } from '../../helpers/crypt.helper'
import loadEnv from '../../helpers/load_env'

/**
 * ConfigService is a singleton class that manages the application's configuration.
 * It loads environment variables from a .env file and provides methods to access them.
 * It also calculates the cost of bcrypt salt rounds and configures the application root path.
 *
 * @module ConfigService
 */
@Injectable()
export class ConfigService {
  /**
   * An object that stores the loaded environment variables.
   */
  private readonly envConfig: DotenvParseOutput | NodeJS.ProcessEnv

  /**
   * The application root path.
   */
  private _appRoot?: string

  constructor() {
    this.envConfig = loadEnv()
    this.envConfig['SALT_ROUNDS'] = this.calculateSaltRoundCost().toString()

    this.configureAppRoot()
  }

  /**
   * Gets the value of an environment variable.
   *
   * @param key - The key of the environment variable.
   * @returns The value of the environment variable.
   */
  get(key: string): string {
    return this.envConfig[key] ?? ''
  }

  /**
   * Gets the value of an environment variable as a string.
   *
   * @param key - The key of the environment variable.
   * @returns The value of the environment variable as a string.
   */
  getStr(key: string): string {
    return this.get(key)
  }

  /**
   * Gets the value of an environment variable as a number.
   *
   * @param key - The key of the environment variable.
   * @returns The value of the environment variable as a number.
   */
  getNb(key: string): number {
    return Number(this.get(key))
  }

  /**
   * Gets the number of bcrypt salt rounds.
   *
   * @returns The number of bcrypt salt rounds.
   */
  getSaltRound(): number {
    return this.getNb('SALT_ROUNDS')
  }

  /**
   * Encryps a text using the application's secret and salt.
   *
   * @param text - The text to encrypt.
   * @returns The encrypted text.
   */
  encrypt(text: string) {
    return encrypt(text, this.getStr('APP_SECRET'), this.getStr('APP_SALT'))
  }

  /**
   * Decrypts a text using the application's secret and salt.
   *
   * @param text - The text to decrypt.
   * @returns The decrypted text.
   */
  decrypt(text: string) {
    return decrypt(text, this.getStr('APP_SECRET'), this.getStr('APP_SALT'))
  }

  /**
   * Calculates the cost of bcrypt salt rounds based on the time it takes to hash a password.
   *
   * @returns The cost of bcrypt salt rounds.
   */
  calculateSaltRoundCost() {
    let timeDiff = 0
    let saltRounds = 9
    do {
      saltRounds += 1
      const time = new Date().getTime()
      hashSync('randompassword', saltRounds)
      timeDiff = new Date().getTime() - time
    } while (timeDiff < 250)
    return saltRounds
  }

  /**
   * Gets the application root path.
   *
   * @returns The application root path.
   */
  get appRoot(): string {
    if (!this._appRoot) {
      this.configureAppRoot()
    }
    return this._appRoot!
  }

  /**
   * Checks if the application is in debug mode.
   *
   * @returns True if the application is in debug mode, false otherwise.
   */
  isDebug() {
    return this.get('WITH_GQL_DEBUG') === 'true'
  }

  /**
   * Authenticates a Basic Auth header.
   *
   * @param authHeader - The Basic Auth header to authenticate.
   * @throws UnauthorizedException if the header is missing, invalid, or the credentials are incorrect.
   */
  authenticateBasic(authHeader: string | null | undefined): void {
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header')
    }

    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii',
    )
    const [username, password] = credentials.split(':')
    if (!username || !password) {
      throw new UnauthorizedException('Invalid credentials format')
    }

    if (
      username !== this.getStr('BASIC_AUTH_USERNAME') ||
      password !== this.getStr('BASIC_AUTH_PASSWORD')
    ) {
      throw new UnauthorizedException('Invalid credentials')
    }
  }

  private configureAppRoot() {
    // config.service file location matters !
    // use env to define app root path, more robust ?
    const isInDist = /\/dist\//.test(__dirname)
    let rootPath = '../../..'
    if (isInDist) rootPath += '/..'
    this._appRoot = join(__dirname, rootPath)
  }
}
