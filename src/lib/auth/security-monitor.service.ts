// lib/auth/security-monitor.service.ts
import { LoginAttempt, DeviceInfo, SecurityEvent, SecurityAlert } from '@/types/auth';

export interface SecurityEventFilters {
  type?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: string;
}

export class SecurityMonitorService {
  private static attempts = new Map<string, { count: number; firstAttempt: number; lastAttempt: number }>();
  private static readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_ATTEMPTS = 5;
  private static securityAlerts: SecurityAlert[] = [];

  // Rate Limiting
  static checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; resetTime: number } {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      this.attempts.set(identifier, { 
        count: 1, 
        firstAttempt: now, 
        lastAttempt: now 
      });
      return { 
        allowed: true, 
        remainingAttempts: this.MAX_ATTEMPTS - 1, 
        resetTime: now + this.RATE_LIMIT_WINDOW 
      };
    }

    const timeDiff = now - attempt.firstAttempt;
    
    // Reset if outside window
    if (timeDiff > this.RATE_LIMIT_WINDOW) {
      this.attempts.set(identifier, { 
        count: 1, 
        firstAttempt: now, 
        lastAttempt: now 
      });
      return { 
        allowed: true, 
        remainingAttempts: this.MAX_ATTEMPTS - 1, 
        resetTime: now + this.RATE_LIMIT_WINDOW 
      };
    }

    if (attempt.count >= this.MAX_ATTEMPTS) {
      return { 
        allowed: false, 
        remainingAttempts: 0, 
        resetTime: attempt.firstAttempt + this.RATE_LIMIT_WINDOW 
      };
    }

    attempt.count++;
    attempt.lastAttempt = now;
    
    return { 
      allowed: true, 
      remainingAttempts: this.MAX_ATTEMPTS - attempt.count, 
      resetTime: attempt.firstAttempt + this.RATE_LIMIT_WINDOW 
    };
  }

  static incrementAttempts(identifier: string): void {
    const attempt = this.attempts.get(identifier);
    const now = Date.now();
    
    if (attempt) {
      attempt.count++;
      attempt.lastAttempt = now;
    } else {
      this.attempts.set(identifier, { 
        count: 1, 
        firstAttempt: now, 
        lastAttempt: now 
      });
    }
  }

  static resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }

  static getAttemptStats(identifier: string) {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return null;
    
    return {
      count: attempt.count,
      firstAttempt: new Date(attempt.firstAttempt),
      lastAttempt: new Date(attempt.lastAttempt),
      resetTime: new Date(attempt.firstAttempt + this.RATE_LIMIT_WINDOW)
    };
  }

  // Anomaly Detection
  static detectSuspiciousLogin(loginData: LoginAttempt): { suspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];
    let suspicious = false;

    // Check for rapid successive attempts
    const rateLimitKey = `login:${loginData.email}:${loginData.ip}`;
    const rateLimit = this.checkRateLimit(rateLimitKey);
    
    if (!rateLimit.allowed) {
      reasons.push('Too many failed login attempts');
      suspicious = true;
    }

    // Check for unusual login times
    if (this.isUnusualLoginTime(loginData.timestamp)) {
      reasons.push('Login during unusual hours');
      suspicious = true;
    }

    // Check for location anomalies
    const locationCheck = this.detectLocationChange(loginData.ip);
    if (locationCheck.suspicious) {
      reasons.push(...locationCheck.reasons);
      suspicious = true;
    }

    // Check for new device
    const deviceCheck = this.detectNewDevice(loginData.userAgent);
    if (deviceCheck.suspicious) {
      reasons.push(...deviceCheck.reasons);
      suspicious = true;
    }

    return { suspicious, reasons };
  }

  static detectNewDevice(userAgent: string): { suspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const deviceInfo = this.parseUserAgent(userAgent);
    const storedDevices = this.getStoredDevices();
    const deviceKey = this.generateDeviceKey(deviceInfo);

    if (storedDevices.length > 0 && !storedDevices.includes(deviceKey)) {
      reasons.push(`New device detected: ${deviceInfo.browser} on ${deviceInfo.os}`);
      return { suspicious: true, reasons };
    }

    return { suspicious: false, reasons };
  }

  static detectLocationChange(ipAddress: string): { suspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const currentLocation = this.getLocationFromIP(ipAddress);
    const storedLocations = this.getStoredLocations();

    if (storedLocations.length > 0 && !storedLocations.includes(currentLocation.country)) {
      reasons.push(`Login from new country: ${currentLocation.country}`);
      return { suspicious: true, reasons };
    }

    return { suspicious: false, reasons };
  }

  // Security Alerts Management
  static addSecurityAlert(alert: Omit<SecurityAlert, 'id'>): string {
    const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAlert: SecurityAlert = {
      ...alert,
      id: alertId
    };

    this.securityAlerts.unshift(newAlert);
    
    // Keep only last 50 alerts
    if (this.securityAlerts.length > 50) {
      this.securityAlerts = this.securityAlerts.slice(0, 50);
    }

    this.persistAlerts();
    return alertId;
  }

  static getSecurityAlerts(): SecurityAlert[] {
    return [...this.securityAlerts];
  }

  static dismissSecurityAlert(id: string): void {
    this.securityAlerts = this.securityAlerts.filter(alert => alert.id !== id);
    this.persistAlerts();
  }

  static clearSecurityAlerts(): void {
    this.securityAlerts = [];
    this.persistAlerts();
  }

  // Security Events Logging
  static logSecurityEvent(event: Omit<SecurityEvent, 'id'>): string {
    const events = this.getSecurityEvents();
    const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEvent: SecurityEvent = {
      ...event,
      id
    };

    events.unshift(newEvent);
    
    // Keep only last 1000 events
    if (events.length > 1000) {
      events.pop();
    }
    
    localStorage.setItem('securityEvents', JSON.stringify(events));
    return id;
  }

  static getSecurityEvents(filters?: SecurityEventFilters): SecurityEvent[] {
    const events = JSON.parse(localStorage.getItem('securityEvents') || '[]');
    
    if (!filters) return events;

    return events.filter((event: SecurityEvent) => {
      if (filters.type && event.type !== filters.type) return false;
      if (filters.userId && event.userId !== filters.userId) return false;
      if (filters.startDate && new Date(event.timestamp) < filters.startDate) return false;
      if (filters.endDate && new Date(event.timestamp) > filters.endDate) return false;
      if (filters.severity && event.details.severity !== filters.severity) return false;
      return true;
    });
  }

  static getSecurityStats() {
    const events = this.getSecurityEvents();
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = events.filter(event => 
      new Date(event.timestamp) >= last24Hours
    );

    return {
      totalEvents: events.length,
      recentEvents: recentEvents.length,
      failedLogins: events.filter(e => e.type === 'login_failed').length,
      suspiciousLogins: events.filter(e => e.type === 'suspicious_login').length,
      newDevices: events.filter(e => e.type === 'new_device').length,
    };
  }

  // Private helper methods
  private static isUnusualLoginTime(timestamp: Date): boolean {
    const hour = timestamp.getHours();
    // Consider 10 PM to 6 AM as unusual hours
    return hour >= 22 || hour < 6;
  }

  private static parseUserAgent(userAgent: string): DeviceInfo {
    // Simplified user agent parsing - consider using ua-parser-js in production
    const ua = userAgent.toLowerCase();
    
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';

    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios')) os = 'iOS';

    if (ua.includes('mobile')) device = 'Mobile';
    else if (ua.includes('tablet')) device = 'Tablet';

    return { browser, os, device, ip: '' };
  }

  private static generateDeviceKey(deviceInfo: DeviceInfo): string {
    return `${deviceInfo.browser}-${deviceInfo.os}-${deviceInfo.device}`;
  }

  private static getStoredDevices(): string[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('trustedDevices') || '[]');
  }

  private static getStoredLocations(): string[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('trustedLocations') || '[]');
  }

  private static getLocationFromIP(ip: string): { country: string; region: string; city: string } {
    // Mock implementation - integrate with IP geolocation service like ipapi.co
    // For now, return mock data
    return {
      country: 'US',
      region: 'California',
      city: 'San Francisco'
    };
  }

  private static persistAlerts(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('securityAlerts', JSON.stringify(this.securityAlerts));
    }
  }

  // Initialize from localStorage
  static initialize(): void {
    if (typeof window !== 'undefined') {
      const storedAlerts = localStorage.getItem('securityAlerts');
      if (storedAlerts) {
        try {
          this.securityAlerts = JSON.parse(storedAlerts);
        } catch {
          this.securityAlerts = [];
        }
      }
    }
  }
}

// Initialize on import
if (typeof window !== 'undefined') {
  SecurityMonitorService.initialize();
}