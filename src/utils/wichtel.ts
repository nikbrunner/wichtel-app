import { randomUUID } from "node:crypto";

/**
 * Generates a cryptographically secure random token for events or participants
 */
export function generateToken(): string {
  return randomUUID();
}

/**
 * Generates a URL-friendly slug from a name
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 * Adds a random suffix to ensure uniqueness
 */
export function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const randomSuffix = Math.random().toString(36).substring(2, 8);

  return `${baseSlug}-${randomSuffix}`;
}
