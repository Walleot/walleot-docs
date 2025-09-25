---
id: errors
title: Errors
slug: /api/errors
---

We use standard HTTP status codes and structured error bodies.

```json
{
  "error": {
    "type": "invalid_request",
    "message": "amount must be a positive integer"
  }
}
```

- **400** invalid request
- **401** unauthorized
- **402** payment required
- **404** not found
- **429** rate limited
- **500** server error
