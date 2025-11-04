import { Contract, Signature, EvidencePackage } from '@/lib/types/contracts'
import { TechnicalEvidence } from '@/types/contracts'

export class SecurityService {
  private readonly algorithm = 'SHA-256'
  
  /**
   * Generate SHA-256 hash for content integrity
   */
  async generateContentHash(content: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      // Browser environment
      const encoder = new TextEncoder()
      const data = encoder.encode(content)
      const hashBuffer = await crypto.subtle.digest(this.algorithm, data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } else {
      // Node.js environment or fallback
      return this.fallbackHash(content)
    }
  }

  /**
   * Validate content against stored hash
   */
  async validateContentHash(content: string, expectedHash: string): Promise<boolean> {
    const actualHash = await this.generateContentHash(content)
    return actualHash === expectedHash
  }

  /**
   * Generate comprehensive evidence package
   */
  generateEvidencePackage(signature: Signature, contract: Contract): Partial<EvidencePackage> {
    const evidencePackage: Partial<EvidencePackage> = {
      id: `evd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contractId: contract.id,
      signatureId: signature.id,
      evidence: {
        signer: {
          id: signature.userId,
          fullName: signature.fullName,
          email: signature.email,
          company: signature.company
        },
        contract: {
          id: contract.id,
          title: contract.title,
          contentHash: contract.contentHash,
          templateVersion: '1.0' // Default version since not available
        },
        signature: {
          type: signature.signatureType,
          data: signature.signatureData,
          image: signature.signatureImage,
          timestamp: signature.signedAt
        },
        consents: {
          terms: signature.consents.terms,
          privacy: signature.consents.privacy,
          cancellation: signature.consents.cancellation
        },
        technical: {
          ipAddress: signature.ipAddress,
          userAgent: signature.userAgent,
          deviceInfo: signature.deviceInfo,
          osInfo: signature.osInfo,
          browserInfo: signature.browserInfo
        },
        legal: {
          termsVersion: '1.0', // Default version since not available in contract
          privacyVersion: '1.0'
        }
      },
      createdAt: new Date()
    }

    return evidencePackage
  }

  /**
   * Validate signature integrity and evidence
   */
  async validateSignatureIntegrity(signature: Signature, contract: Contract): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate content hash
    const isHashValid = await this.validateContentHash(contract.content, signature.contentHash)
    if (!isHashValid) {
      errors.push('Content hash mismatch - document may have been tampered with')
    }

    // Validate signature data
    if (!signature.signatureData && signature.signatureType !== 'typed') {
      errors.push('Signature data is missing')
    }

    // Validate consents
    if (!signature.consents.terms) {
      errors.push('Terms of service consent not provided')
    }
    if (!signature.consents.privacy) {
      errors.push('Privacy policy consent not provided')
    }

    // Validate technical evidence
    if (!signature.ipAddress) {
      warnings.push('IP address not captured')
    }
    if (!signature.userAgent) {
      warnings.push('User agent not captured')
    }

    // Check for suspicious patterns
    if (this.isSuspiciousIp(signature.ipAddress)) {
      warnings.push('IP address may be from VPN or proxy')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Generate digital certificate for signature
   */
  generateDigitalCertificate(signature: Signature, contract: Contract): string {
    const certificate = {
      version: '1.0',
      signatureId: signature.id,
      contractId: contract.id,
      signer: {
        name: signature.fullName,
        email: signature.email
      },
      timestamp: signature.signedAt,
      hash: signature.contentHash,
      evidence: {
        ip: signature.ipAddress,
        userAgent: signature.userAgent,
        device: signature.deviceInfo
      },
      issuer: 'Eagle Contracts Digital Signature System',
      algorithm: this.algorithm,
      compliance: ['ESIGN', 'eIDAS']
    }

    return JSON.stringify(certificate, null, 2)
  }

  /**
   * Fallback hash function for environments without crypto.subtle
   */
  private fallbackHash(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36) + content.length.toString(36)
  }

  /**
   * Extract device information from user agent
   */
  private getDeviceInfo(): string {
    if (typeof window === 'undefined') return 'Server'

    const ua = navigator.userAgent
    let deviceInfo = ''

    // Detect browser
    if (ua.includes('Chrome')) deviceInfo += 'Chrome/'
    else if (ua.includes('Firefox')) deviceInfo += 'Firefox/'
    else if (ua.includes('Safari')) deviceInfo += 'Safari/'
    else if (ua.includes('Edge')) deviceInfo += 'Edge/'

    // Detect OS
    if (ua.includes('Windows')) deviceInfo += 'Windows'
    else if (ua.includes('Mac')) deviceInfo += 'macOS'
    else if (ua.includes('Linux')) deviceInfo += 'Linux'
    else if (ua.includes('Android')) deviceInfo += 'Android'
    else if (ua.includes('iOS')) deviceInfo += 'iOS'
    else deviceInfo += 'Unknown'

    // Detect mobile
    if (/Mobi|Android/i.test(ua)) {
      deviceInfo += ' Mobile'
    }

    return deviceInfo
  }

  /**
   * Basic IP validation for suspicious patterns
   */
  private isSuspiciousIp(ip: string): boolean {
    // Simple check for common VPN ranges and local IPs
    const suspiciousPatterns = [
      /^10\./, // Private network
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private network
      /^192\.168\./, // Private network
      /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Carrier-grade NAT
    ]

    return suspiciousPatterns.some(pattern => pattern.test(ip))
  }
}

export const securityService = new SecurityService()