/**
 * Generate a unique session ID for anonymous public chat users
 */
export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create session ID from localStorage
 */
export function getOrCreateSessionId(): string {
    const SESSION_KEY = 'public_chat_session_id';

    let sessionId = localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
}

/**
 * Clear session ID from localStorage
 */
export function clearSessionId(): void {
    localStorage.removeItem('public_chat_session_id');
}
