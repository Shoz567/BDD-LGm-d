/**
 * Robustly extract JSON from an LLM response that may be wrapped in markdown code blocks
 * or contain leading/trailing text.
 */
export function extractJson(raw: string | null | undefined): string {
  if (!raw) return '{}';

  // Already plain JSON (starts with { or [)
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return trimmed;

  // Strip ```json ... ``` or ``` ... ``` blocks
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();

  // Find first { and last } as a fallback
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}
