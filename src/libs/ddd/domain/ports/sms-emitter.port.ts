export interface SmsEmitterPort {
  sendSMS(tel: string, content: string): Promise<boolean>
}
