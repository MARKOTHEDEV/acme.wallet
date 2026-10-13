/**
 * Up to two initials for an avatar, e.g. "Ada Okafor" -> "AO",
 * "Okonkwo-Adeyemi Logistics & Haulage" -> "OA". Words are split on spaces and hyphens.
 */
export function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter((word) => /^[\p{L}\p{N}]/u.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}
