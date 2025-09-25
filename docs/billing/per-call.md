---
id: per-call
title: Per‑call pricing
slug: /billing/per-call
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Per‑call Pricing

Charge users for each tool call in your MCP server. Users pay only for what they use.

## Quick Start

<Tabs>
<TabItem value="ts" label="Node.js">

```typescript
import { Server } from "@modelcontextprotocol/sdk/server";
import { installWalleot, PaymentFlow } from "walleot";
import { z } from "zod";

const server = new Server({ name: "my-server", version: "0.0.1" });

installWalleot(server, {
  apiKey: process.env.WALLEOT_API_KEY!,
  paymentFlow: PaymentFlow.ELICITATION,
});

server.registerTool(
  "analyze_text",
  {
    title: "Text Analysis",
    description: "Analyze sentiment and extract entities from text.",
    inputSchema: { text: z.string() },
    price: { amount: 0.10, currency: "USD" }, // $0.10 per analysis
  },
  async ({ text }, extra) => {
    const result = await analyzeText(text);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);
```

</TabItem>
<TabItem value="py" label="Python">

```python
from mcp.server.fastmcp import FastMCP, Context
from walleot import Walleot, PaymentFlow
import os

mcp = FastMCP("My Server")

Walleot(
    mcp,
    apiKey=os.getenv("WALLEOT_API_KEY"),
    payment_flow=PaymentFlow.ELICITATION,
)

@Walleot.price(0.10, currency="USD")  # $0.10 per analysis
@mcp.tool()
def analyze_text(text: str, ctx: Context) -> dict:
    """Analyze sentiment and extract entities from text."""
    result = analyze_text_ai(text)
    return {"sentiment": result.sentiment, "entities": result.entities}
```

</TabItem>
</Tabs>

## Examples

### API Wrapper

Charge per external API call:

<Tabs>
<TabItem value="ts" label="Node.js">

```typescript
server.registerTool(
  "get_weather",
  {
    title: "Weather Data",
    description: "Get current weather for any location.",
    inputSchema: { location: z.string() },
    price: { amount: 0.02, currency: "USD" }, // $0.02 per lookup
  },
  async ({ location }, extra) => {
    const weather = await fetchWeather(location);
    return { content: [{ type: "text", text: `${location}: ${weather.temp}°` }] };
  }
);
```

</TabItem>
<TabItem value="py" label="Python">

```python
@Walleot.price(0.02, currency="USD")  # $0.02 per lookup
@mcp.tool()
def get_weather(location: str, ctx: Context) -> dict:
    """Get current weather for any location."""
    weather = fetch_weather(location)
    return {"location": location, "temperature": weather.temp}
```

</TabItem>
</Tabs>

### Data Processing

Charge based on processing complexity:

<Tabs>
<TabItem value="ts" label="Node.js">

```typescript
// Simple processing - low cost
server.registerTool("word_count", {
  price: { amount: 0.01, currency: "USD" }, // $0.01
  // ... rest of tool definition
});

// AI processing - higher cost
server.registerTool("summarize", {
  price: { amount: 0.25, currency: "USD" }, // $0.25
  // ... rest of tool definition
});
```

</TabItem>
<TabItem value="py" label="Python">

```python
# Simple processing - low cost
@Walleot.price(0.01, currency="USD")  # $0.01
@mcp.tool()
def word_count(text: str, ctx: Context) -> int:
    return len(text.split())

# AI processing - higher cost
@Walleot.price(0.25, currency="USD")  # $0.25
@mcp.tool()
def summarize(text: str, ctx: Context) -> str:
    return ai_summarize(text)
```

</TabItem>
</Tabs>

## Payment Flows

Control when users are charged:

- **`ELICITATION`**: Ask user before charging (default, recommended)
- **`TWO_STEP`**: Always require confirmation for higher amounts
- **`PROGRESS`**: Progressive payment for long-running operations

<Tabs>
<TabItem value="ts" label="Node.js">

```typescript
installWalleot(server, {
  apiKey: process.env.WALLEOT_API_KEY!,
  paymentFlow: PaymentFlow.ELICITATION, // Change as needed
});
```

</TabItem>
<TabItem value="py" label="Python">

```python
Walleot(
    mcp,
    apiKey=os.getenv("WALLEOT_API_KEY"),
    payment_flow=PaymentFlow.ELICITATION  # Change as needed
)
```

</TabItem>
</Tabs>

## Best Practices

### Fair Pricing
- Match prices to your actual costs (API fees, compute)
- Start low and adjust based on usage
- Be transparent about what users pay for

### Error Handling
Only charge for successful operations:

<Tabs>
<TabItem value="ts" label="Node.js">

```typescript
server.registerTool(
  "api_call",
  {
    price: { amount: 0.05, currency: "USD" },
    // ... other config
  },
  async ({ query }, extra) => {
    if (!query) {
      throw new Error("Query required"); // No charge for validation errors
    }
    
    try {
      return await externalApiCall(query);
    } catch (error) {
      throw new Error(`API failed: ${error.message}`); // No charge for API errors
    }
  }
);
```

</TabItem>
<TabItem value="py" label="Python">

```python
@Walleot.price(0.05, currency="USD")
@mcp.tool()
def api_call(query: str, ctx: Context) -> dict:
    if not query:
        raise ValueError("Query required")  # No charge for validation errors
    
    try:
        return external_api_call(query)
    except Exception as e:
        raise Exception(f"API failed: {str(e)}")  # No charge for API errors
```

</TabItem>
</Tabs>

## Next Steps

- [API Reference](/api/reference) - Complete API documentation
- [Python SDK](/sdks/python) - SDK reference
- [TypeScript SDK](/sdks/typescript) - SDK reference
- [Security & Controls](/security-and-controls) - Configure payment flows

