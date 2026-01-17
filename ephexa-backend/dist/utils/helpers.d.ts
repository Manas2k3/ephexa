/**
 * Hash an IP address using SHA-256
 * We never store raw IP addresses for privacy
 */
export declare function hashIp(ip: string): string;
/**
 * Calculate age from date of birth
 */
export declare function calculateAge(dateOfBirth: Date): number;
/**
 * Generate a random display name for anonymity
 */
export declare function generateDisplayName(): string;
/**
 * Sanitize user input to prevent XSS
 */
export declare function sanitizeInput(input: string): string;
//# sourceMappingURL=helpers.d.ts.map