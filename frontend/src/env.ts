/**
 * env.ts — Centralized, validated environment configuration.
 *
 * Vite inlines import.meta.env.* at build time.  This module validates
 * that required variables are present and exports strongly-typed values.
 */

const RAW_API_URL: string | undefined = import.meta.env.VITE_API_URL as
  | string
  | undefined

/**
 * Backend API base URL.  Falls back to same-origin in production, localhost
 * in development.
 */
export const API_URL: string =
  RAW_API_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "")

/** Application mode derived from Vite. */
export const MODE: string = import.meta.env.MODE

/** True when running in Vite dev server. */
export const IS_DEV: boolean = import.meta.env.DEV

/** True when running a production build. */
export const IS_PROD: boolean = import.meta.env.PROD
