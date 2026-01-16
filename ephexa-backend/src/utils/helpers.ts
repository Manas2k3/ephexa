import crypto from 'crypto';

/**
 * Hash an IP address using SHA-256
 * We never store raw IP addresses for privacy
 */
export function hashIp(ip: string): string {
    return crypto
        .createHash('sha256')
        .update(ip + (process.env.JWT_SECRET || 'salt'))
        .digest('hex')
        .substring(0, 32);
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
        age--;
    }

    return age;
}

/**
 * Generate a random display name for anonymity
 */
export function generateDisplayName(): string {
    const adjectives = ['Happy', 'Clever', 'Brave', 'Calm', 'Kind', 'Swift', 'Wise', 'Bold'];
    const nouns = ['Panda', 'Eagle', 'Tiger', 'Dolphin', 'Fox', 'Wolf', 'Hawk', 'Bear'];
    const randomNum = Math.floor(Math.random() * 1000);

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adj}${noun}${randomNum}`;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}
