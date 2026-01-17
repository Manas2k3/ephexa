"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.containsProfanity = containsProfanity;
exports.cleanProfanity = cleanProfanity;
exports.detectProfaneWords = detectProfaneWords;
// Simple profanity filter implementation
const defaultBadWords = [
    'fuck', 'shit', 'ass', 'bitch', 'damn', 'dick', 'cock', 'cunt', 'bastard',
    'asshole', 'motherfucker', 'bullshit', 'piss', 'crap'
];
const customBadWords = [];
const badWords = [...defaultBadWords, ...customBadWords];
// Create regex pattern for word matching
const pattern = new RegExp(`\\b(${badWords.join('|')})\\b`, 'gi');
/**
 * Check if message contains profanity
 */
function containsProfanity(text) {
    return pattern.test(text);
}
/**
 * Clean profanity from text (replace with asterisks)
 */
function cleanProfanity(text) {
    return text.replace(pattern, (match) => '*'.repeat(match.length));
}
/**
 * Get list of detected profane words
 */
function detectProfaneWords(text) {
    const matches = text.toLowerCase().match(pattern);
    return matches ? [...new Set(matches)] : [];
}
//# sourceMappingURL=profanityFilter.js.map