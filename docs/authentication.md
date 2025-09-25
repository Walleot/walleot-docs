---
id: authentication
title: Authentication
slug: /authentication
---

Authenticate every request with your **secret API key**.

- **Test** keys for development.
- **Live** keys for production.
- Keep keys in environment variables or your secret manager.

### HTTP header

```bash
curl https://api.walleot.com/v1/payments   -H "Authorization: Bearer $WALLEOT_API_KEY"   -H "Content-Type: application/json"   -d '{ "amount": 200, "currency": "USD" }'
```

### SDK initialization

```python
from walleot import Walleot
client = Walleot(api_key=os.environ["WALLEOT_API_KEY"])
```

```ts
import { Walleot } from "walleot";
const client = new Walleot({ apiKey: process.env.WALLEOT_API_KEY! });
```

> **Security:** Never expose secrets in client‑side code.
