"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashIp = hashIp;
exports.calculateAge = calculateAge;
exports.generateDisplayName = generateDisplayName;
exports.sanitizeInput = sanitizeInput;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Hash an IP address using SHA-256
 * We never store raw IP addresses for privacy
 */
function hashIp(ip) {
    return crypto_1.default
        .createHash('sha256')
        .update(ip + (process.env.JWT_SECRET || 'salt'))
        .digest('hex')
        .substring(0, 32);
}
/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth) {
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
function generateDisplayName() {
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
function sanitizeInput(input) {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}
//# sourceMappingURL=helpers.js.map