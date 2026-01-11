/**
 * Counts the number of words in a given text.
 * Matches sequences of non-whitespace characters.
 * @param text The input string to count words for.
 * @returns The integer number of words.
 */
export const countWords = (text: string): number => {
  if (!text) return 0;
  // Trim and split by whitespace
  return text.trim().split(/\s+/).length;
};

/**
 * Checks if the word count is within the allowed quota, including a tolerance percentage.
 * @param text The input text to check.
 * @param maxWords The maximum allowed words (quota).
 * @param tolerancePercentage The allowed tolerance in percentage (e.g., 5 for 5%). Defaults to 0.
 * @returns True if within quota (inclusive of tolerance), false otherwise.
 */
export const isWithinWordCountQuota = (
  text: string,
  maxWords: number,
  tolerancePercentage: number = 0
): boolean => {
  const words = countWords(text);
  const tolerance = maxWords * (tolerancePercentage / 100);
  const allowedLimit = maxWords + tolerance;
  return words <= allowedLimit;
};
