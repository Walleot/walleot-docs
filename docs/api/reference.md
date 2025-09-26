---
title: API Reference
slug: /api/reference
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# API Reference

This reference shows how to authenticate, create a payment session (get a link), and check payment status via the REST API. It also includes SDK usage patterns for Node.js and Python MCP servers.

## Authentication

Send your secret key in the Authorization header on every request.

### Headers

```
Authorization: Bearer <YOUR_SECRET_KEY>
Content-Type: application/json
```

### Base URL

```
https://api.walleot.com/v1
```

Keep your secret key on the server side only. Do not embed in client apps.

## Create a payment session

Creates a payment session and returns a session ID and checkout URL.

### Endpoint

```
POST /sessions
```

### Request body

- `amount` (integer, required) – amount in cents
- `currency` (string, required) – ISO 4217 currency code (e.g., "usd")
- `description` (string, optional) – human-readable purpose

<Tabs>
<TabItem value="node" label="Node.js">

```javascript
const response = await fetch('https://api.walleot.com/v1/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.WALLEOT_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 200,
    currency: 'usd',
    description: 'Pro feature unlock'
  })
});

const session = await response.json();
console.log(session.sessionId, session.url);
```

</TabItem>
<TabItem value="python" label="Python">

```python
import requests
import os

response = requests.post(
    'https://api.walleot.com/v1/sessions',
    headers={
        'Authorization': f'Bearer {os.getenv("WALLEOT_API_KEY")}',
        'Content-Type': 'application/json',
    },
    json={
        'amount': 200,
        'currency': 'usd',
        'description': 'Pro feature unlock'
    }
)

session = response.json()
print(session['sessionId'], session['url'])
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
curl -X POST "https://api.walleot.com/v1/sessions" \
  -H "Authorization: Bearer $WALLEOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200,
    "currency": "usd",
    "description": "Pro feature unlock"
  }'
```

</TabItem>
</Tabs>

### Response

```json
{
  "sessionId": "sess_123",
  "url": "https://pay.walleot.com/checkout/sess_123"
}
```

### Notes

- The server expects amount in cents. (SDKs accept dollars and convert to cents for you.)
- currency is lowercase in the underlying request.

## Check payment status

Retrieve the current status of a payment session.

### Endpoint

```
GET /sessions/{sessionId}
```

<Tabs>
<TabItem value="curl" label="cURL">

```bash
curl "https://api.walleot.com/v1/sessions/sess_123" \
  -H "Authorization: Bearer $WALLEOT_API_KEY"
```

</TabItem>
<TabItem value="node" label="Node.js">

```javascript
const response = await fetch('https://api.walleot.com/v1/sessions/sess_123', {
  headers: {
    'Authorization': `Bearer ${process.env.WALLEOT_API_KEY}`
  }
});

const status = await response.json();
console.log(status.status); // "paid", "pending", etc.
```

</TabItem>
<TabItem value="python" label="Python">

```python
import requests
import os

response = requests.get(
    'https://api.walleot.com/v1/sessions/sess_123',
    headers={
        'Authorization': f'Bearer {os.getenv("WALLEOT_API_KEY")}'
    }
)

status = response.json()
print(status['status'])  # "paid", "pending", etc.
```

</TabItem>
</Tabs>

### Response

```json
{
  "status": "paid"
}
```

## Complete payment flow example

Here's how to create a session, get a payment link, and check status:

<Tabs>
<TabItem value="node" label="Node.js">

```javascript
// 1. Create a payment session
const session = await fetch('https://api.walleot.com/v1/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.WALLEOT_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 200, // $2.00 in cents
    currency: 'usd',
    description: 'Premium feature unlock'
  })
});

const { sessionId, url } = await session.json();

// 2. Redirect user to payment link
console.log('Send user to:', url);

// 3. Check payment status (poll)
const checkStatus = async (sessionId) => {
  const response = await fetch(`https://api.walleot.com/v1/sessions/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${process.env.WALLEOT_API_KEY}` }
  });
  const { status } = await response.json();
  return status; // "paid", "pending", "failed", etc.
};

// Poll for completion
const status = await checkStatus(sessionId);
if (status === 'paid') {
  console.log('Payment successful! Enable premium feature.');
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import requests
import os
import time

api_key = os.getenv('WALLEOT_API_KEY')
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

# 1. Create a payment session
session_response = requests.post(
    'https://api.walleot.com/v1/sessions',
    headers=headers,
    json={
        'amount': 200,  # $2.00 in cents
        'currency': 'usd',
        'description': 'Premium feature unlock'
    }
)

session_data = session_response.json()
session_id = session_data['sessionId']
payment_url = session_data['url']

# 2. Direct user to payment link
print(f'Send user to: {payment_url}')

# 3. Check payment status
def check_status(session_id):
    response = requests.get(
        f'https://api.walleot.com/v1/sessions/{session_id}',
        headers={'Authorization': f'Bearer {api_key}'}
    )
    return response.json()['status']

# Poll for completion
status = check_status(session_id)
if status == 'paid':
    print('Payment successful! Enable premium feature.')
```

</TabItem>
</Tabs>

## SDK usage with MCP (automatic per-call pricing)

For MCP servers, use the SDKs for automatic per-call charging:

<Tabs>
<TabItem value="node" label="Node.js">

```typescript
import { Server } from "@modelcontextprotocol/sdk/server";
import { installWalleot, PaymentFlow } from "walleot";
import { z } from "zod";

const server = new Server({ name: "my-server", version: "0.0.1" });

installWalleot(server, {
  apiKey: process.env.WALLEOT_API_KEY!,
  paymentFlow: PaymentFlow.TWO_STEP, /* Alternatively, you can use PaymentFlow.ELICITATION if MCP Client supports it  */
});

server.registerTool(
  "premium_analysis",
  {
    title: "Premium Analysis",
    description: "Advanced data analysis with AI.",
    inputSchema: { data: z.string() },
    price: { amount: 0.50, currency: "USD" }, // $0.50 per call
  },
  async ({ data }, extra) => {
    const result = await performAnalysis(data);
    return { content: [{ type: "text", text: result }] };
  }
);
```

</TabItem>
<TabItem value="python" label="Python">

```python
from mcp.server.fastmcp import FastMCP, Context
from walleot import Walleot, PaymentFlow
import os

mcp = FastMCP("Analysis Server")

Walleot(
    mcp,
    apiKey=os.getenv("WALLEOT_API_KEY"),
    payment_flow=PaymentFlow.TWO_STEP # Alternatively, you can use PaymentFlow.ELICITATION if MCP Client supports it 
)

@Walleot.price(0.50, currency="USD")  # $0.50 per call
@mcp.tool()
def premium_analysis(data: str, ctx: Context) -> dict:
    """Advanced data analysis with AI."""
    result = perform_analysis(data)
    return {"analysis": result, "confidence": 0.95}
```

</TabItem>
</Tabs>


## Error Handling

All API endpoints return standard HTTP status codes. Handle errors appropriately:

<Tabs>
<TabItem value="node" label="Node.js">

```javascript
try {
  const response = await fetch('https://api.walleot.com/v1/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WALLEOT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: 200,
      currency: 'usd',
      description: 'Pro feature unlock'
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const session = await response.json();
  console.log(session.sessionId, session.url);
} catch (error) {
  console.error('Error creating session:', error);
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import requests
import os

try:
    response = requests.post(
        'https://api.walleot.com/v1/sessions',
        headers={
            'Authorization': f'Bearer {os.getenv("WALLEOT_API_KEY")}',
            'Content-Type': 'application/json',
        },
        json={
            'amount': 200,
            'currency': 'usd',
            'description': 'Pro feature unlock'
        }
    )
    
    response.raise_for_status()  # Raises an HTTPError for bad responses
    session = response.json()
    print(session['sessionId'], session['url'])
    
except requests.exceptions.RequestException as e:
    print(f'Error creating session: {e}')
```

</TabItem>
</Tabs>

## Types & enums

- **PaymentFlow**: `TWO_STEP` (default), `ELICITATION`, `PROGRESS`
- **Node price shape**: `{ amount: number, currency: string }` (amount in USD dollars, converted under the hood)
- **Python decorator**: `@walleot.price(amount: float, currency: str)` (dollars)

## Payment Status Values

Common status values returned by the API:

- `pending` - Payment session created, awaiting payment
- `paid` - Payment completed successfully
- `failed` - Payment failed or was declined
- `expired` - Payment session expired
- `cancelled` - Payment was cancelled by user

## Behavior

- **New user**: 2-click registration
- **Under threshold**: auto-approved
- **Above threshold**: one-tap 2FA prompt

## Rate Limits

API requests are rate limited. Current limits:

- **Sessions**: 100 requests per minute per API key
- **Status checks**: 1000 requests per minute per API key

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Next Steps

- [Quickstart Guide](/quickstart) - Get up and running quickly
- [Python SDK](/sdks/python) - Detailed Python SDK documentation
- [TypeScript SDK](/sdks/typescript) - Detailed TypeScript SDK documentation
- [MCP Integration Guide](/integrations/mcp) - Complete MCP server tutorial