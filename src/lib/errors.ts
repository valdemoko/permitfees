/**
 * Secret redaction for anything we are about to log.
 *
 * A driver error is not supposed to echo a connection string, and usually does
 * not — but "usually" is not a property worth betting credentials on. A malformed
 * or unreachable URL is exactly the case where a library is most likely to quote
 * the whole thing back at you, and that is the case we cannot afford to leak into
 * build logs, CI output or a hosting provider's log viewer.
 *
 * So every log site that can receive a database error routes it through here
 * first. Redaction is deliberately over-eager: a redacted host in a log costs a
 * minute of debugging, a leaked password costs a database.
 */

/** Anything that could be a PostgreSQL connection string, credentials included. */
const CONNECTION_STRING = /\b(postgres(?:ql)?:\/\/)[^\s"'`<>]+/gi;

/** `password=...` / `sslpassword=...` as it appears in a query string or URI. */
const PASSWORD_PARAM = /\b(pass(?:word|wd)?|pwd)=([^&\s"'`]+)/gi;

/** A bare assignment to a sensitive key, e.g. in a stack trace or a shell echo. */
const SECRET_ASSIGNMENT =
  /\b(DATABASE_URL|PGPASSWORD|POSTGRES_PASSWORD|REVALIDATE_TOKEN|POSTGRES_URL|NEON_[A-Z_]*)\b(\s*[=:]\s*)(\S+)/gi;

/** Neon and AWS credentials that can appear as loose tokens in an error body. */
const LOOSE_TOKEN = /\bnpg_[A-Za-z0-9]{6,}\b|\b[A-Za-z0-9]{12,}:[A-Za-z0-9+/=]{24,}\b/g;

export function redactSecrets(input: unknown): string {
  return toLoggableString(input)
    .replace(CONNECTION_STRING, "$1[redacted]")
    .replace(PASSWORD_PARAM, "$1=[redacted]")
    .replace(SECRET_ASSIGNMENT, "$1$2[redacted]")
    .replace(LOOSE_TOKEN, "[redacted]");
}

export function toLoggableString(input: unknown): string {
  if (input instanceof Error) {
    const stack = input.stack ?? "";
    // The stack already begins with `Name: message`, so only append it when it
    // does not, to avoid logging the message twice.
    return stack.startsWith(input.name) ? stack : `${input.name}: ${input.message}\n${stack}`;
  }

  if (typeof input === "string") return input;

  if (input === null || input === undefined) return String(input);

  if (typeof input === "object") {
    try {
      return JSON.stringify(input);
    } catch {
      return "[unserialisable error]";
    }
  }

  return String(input);
}

/**
 * Log an error with its secrets removed.
 *
 * `scope` should name the subsystem, e.g. `db`, so the line is greppable.
 */
export function logSafeError(scope: string, error: unknown, detail?: string): void {
  const suffix = detail ? ` (${detail})` : "";
  console.error(`[${scope}]${suffix} ${redactSecrets(error)}`);
}
