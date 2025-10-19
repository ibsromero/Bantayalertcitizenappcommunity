/**
 * Phone and SMS Utilities for BantayAlert
 * These use native device protocols to make calls and send SMS
 */

/**
 * Initiates a phone call using the tel: protocol
 * Works on mobile devices and desktop with telephony apps
 */
export function makePhoneCall(phoneNumber: string, name?: string): void {
  try {
    // Clean the phone number (remove spaces, dashes, parentheses)
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (!cleanNumber) {
      throw new Error('Invalid phone number');
    }
    
    // Create tel: link and trigger it
    const telLink = `tel:${cleanNumber}`;
    window.location.href = telLink;
    
    console.log(`Initiating call to ${name || cleanNumber}`);
  } catch (error) {
    console.error('Error making phone call:', error);
    throw error;
  }
}

/**
 * Opens SMS app with pre-filled recipient
 * Works on mobile devices
 */
export function sendSMS(phoneNumber: string, message?: string): void {
  try {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (!cleanNumber) {
      throw new Error('Invalid phone number');
    }
    
    // Create sms: link
    let smsLink = `sms:${cleanNumber}`;
    
    // Add message body if provided (URL encoded)
    if (message) {
      // iOS uses & for separator, Android uses ?
      const separator = /iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?';
      smsLink += `${separator}body=${encodeURIComponent(message)}`;
    }
    
    window.location.href = smsLink;
    
    console.log(`Opening SMS to ${cleanNumber}`);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

/**
 * Sends emergency alert to multiple contacts via SMS
 */
export function sendMassAlert(contacts: Array<{ name: string; number: string }>, message: string): void {
  // Note: Most platforms don't support sending to multiple recipients from web
  // This will open SMS for each contact sequentially
  contacts.forEach((contact, index) => {
    setTimeout(() => {
      sendSMS(contact.number, message);
    }, index * 1000); // Delay each by 1 second to avoid overwhelming the system
  });
}

/**
 * Format phone number for display (Philippines format)
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a Philippine number
  if (cleaned.startsWith('63')) {
    // Format: +63 XXX XXX XXXX
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
  } else if (cleaned.startsWith('0')) {
    // Format: 0XXX XXX XXXX
    const match = cleaned.match(/^(\d{4})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
  }
  
  return phoneNumber;
}

/**
 * Validate Philippine phone number
 */
export function isValidPhilippineNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Philippine mobile numbers: 09XX XXX XXXX or +63 9XX XXX XXXX
  // Landline: (02) XXXX XXXX or similar
  const mobilePattern = /^(09|\+639)\d{9}$/;
  const landlinePattern = /^(\+63|0)(2|3[2-5]|4[2-8]|5[2-5]|6[2-8]|7[2-8]|8[2-8])\d{7,8}$/;
  
  return mobilePattern.test(cleaned) || landlinePattern.test(cleaned);
}
