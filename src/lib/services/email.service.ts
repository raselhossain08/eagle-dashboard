// lib/email.service.ts - MISSING
export class EmailService {
  async sendContractForSignature(contract: Contract, recipient: string): Promise<void>
  async sendSignatureConfirmation(contract: Contract): Promise<void>
  async sendExpiryReminder(contract: Contract): Promise<void>
}