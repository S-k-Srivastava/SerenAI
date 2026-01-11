import { AxiosError } from 'axios';

/**
 * Extracts a human-readable error message from an API error response.
 * @param error The error object (usually from Axios)
 * @param fallback A default message to show if extraction fails
 * @returns The extracted error message string
 */
export const getErrorMessage = (error: unknown, fallback: string = "An unexpected error occurred"): string => {
    if (error instanceof AxiosError) {
        // Handle Axios error structure
        const data = error.response?.data;

        // Priority 1: Backend specific error message (standard format)
        if (data?.message) return data.message;

        // Priority 2: Backend specific error field (standard format)
        if (data?.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);

        // Priority 3: Fallback to status text
        if (error.response?.statusText) return `${error.response.statusText} (${error.response.status})`;

        // Priority 4: Axios internal error message
        return error.message;
    }

    // Non-axios errors
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;

    return fallback;
};
