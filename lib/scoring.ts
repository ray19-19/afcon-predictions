/**
 * Calculate points for a prediction based on actual match result
 * 
 * Scoring rules:
 * - Exact score: 5 points
 * - Correct winner + correct goal difference: 3 points
 * - Correct winner only: 1 point
 * - Incorrect: 0 points
 */
export function calculatePoints(
    predictedHome: number,
    predictedAway: number,
    actualHome: number,
    actualAway: number
): number {
    // Exact score → 5 points
    if (predictedHome === actualHome && predictedAway === actualAway) {
        return 5;
    }

    const predictedDiff = predictedHome - predictedAway;
    const actualDiff = actualHome - actualAway;

    // Determine winners
    const predictedWinner = predictedDiff > 0 ? 'home' : predictedDiff < 0 ? 'away' : 'draw';
    const actualWinner = actualDiff > 0 ? 'home' : actualDiff < 0 ? 'away' : 'draw';

    // Correct winner + correct goal difference → 3 points
    if (predictedWinner === actualWinner && Math.abs(predictedDiff) === Math.abs(actualDiff)) {
        return 3;
    }

    // Correct winner only → 1 point
    if (predictedWinner === actualWinner) {
        return 1;
    }

    // Incorrect → 0 points
    return 0;
}

/**
 * Check if a match has started (kickoff time has passed)
 */
export function hasMatchStarted(kickoffTime: string): boolean {
    const kickoff = new Date(kickoffTime);
    const now = new Date();
    return now >= kickoff;
}

/**
 * Validate prediction scores
 */
export function isValidScore(score: number): boolean {
    return Number.isInteger(score) && score >= 0 && score <= 50;
}
