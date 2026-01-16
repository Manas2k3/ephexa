// Simple profanity filter implementation
const defaultBadWords = [
    'fuck', 'shit', 'ass', 'bitch', 'damn', 'dick', 'cock', 'cunt', 'bastard',
    'asshole', 'motherfucker', 'bullshit', 'piss', 'crap'
];

const customBadWords: string[] = [];
const badWords = [...defaultBadWords, ...customBadWords];

// Create regex pattern for word matching
const pattern = new RegExp(`\\b(${badWords.join('|')})\\b`, 'gi');

/**
 * Check if message contains profanity
 */
export function containsProfanity(text: string): boolean {
    return pattern.test(text);
}

/**
 * Clean profanity from text (replace with asterisks)
 */
export function cleanProfanity(text: string): string {
    return text.replace(pattern, (match) => '*'.repeat(match.length));
}

/**
 * Get list of detected profane words
 */
export function detectProfaneWords(text: string): string[] {
    const matches = text.toLowerCase().match(pattern);
    return matches ? [...new Set(matches)] : [];
}
