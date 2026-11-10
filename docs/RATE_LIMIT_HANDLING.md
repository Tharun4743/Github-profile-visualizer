# GitHub GraphQL API Rate Limit Strategy

- Token bucket algorithm tracking remaining quota from \X-RateLimit-Remaining\ headers.
- Exponential backoff with jitter on HTTP 403 / 429 response codes.
- Intelligent local IndexedDB caching for historical year segments with 24-hour TTL.
