/**
 * Global type declarations for conditional compilation flags
 * These are defined in vite.config.ts and replaced at build time
 */

/**
 * True when running in development mode (npm run dev)
 */
declare const __DEV__: boolean;

/**
 * True when review/demo mode is enabled (development only)
 * This flag gates the review mode functionality that bypasses authentication
 */
declare const __REVIEW_MODE_ENABLED__: boolean;
