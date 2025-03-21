export interface AuthenticationResponse {
  token_type: string // "Bearer"
  expires_in: number // 3600
  access_token: string // '{accessToken}'
  // optionally, the response may contain a "refresh_token" property and token.
}
