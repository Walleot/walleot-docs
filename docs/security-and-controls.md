---
id: security-and-controls
title: Security & Controls
slug: /security-and-controls
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Walleot manages approvals and authentication as part of the MCP payment flow.

## Approval behavior

- Under‑threshold charges may be auto‑approved for a seamless experience.
- Over‑threshold charges trigger a one‑tap approval (2FA prompt) to the user.
- New users are onboarded via a 2‑click registration flow.

These behaviors are handled by Walleot. Your MCP server only needs to set a price on each tool (see Quickstart and MCP Integration).

## Payment flows

Both SDKs support multiple flows via an enum:

- `TWO_STEP` (shown in examples)
- `ELICITATION`
- `PROGRESS`

Pick the flow that best matches the MCP Clients who will use your MCP Server. For most cases, `PaymentFlow.TWO_STEP` is a sensible default.

The current list of client capabilities can be found here: https://modelcontextprotocol.io/clients


### Example: set flow and price

<Tabs>
<TabItem value="ts" label="Node.js">

```ts
import { Server } from "@modelcontextprotocol/sdk/server";
import { installWalleot, PaymentFlow } from "walleot";
import { z } from "zod";

const server = new Server({ name: "my-server", version: "0.0.1" });

installWalleot(server, {
  apiKey: process.env.WALLEOT_API_KEY!,
  paymentFlow: PaymentFlow.TWO_STEP, 
});

server.registerTool(
  "add",
  {
    title: "Add",
    description: "Add two numbers.",
    inputSchema: { a: z.number(), b: z.number() },
    price: { amount: 0.19, currency: "USD" },
  },
  async ({ a, b }, extra) => {
    return { content: [{ type: "text", text: String(a + b) }] };
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

walleot = Walleot(
    mcp,
    apiKey=os.getenv("WALLEOT_API_KEY"),
    payment_flow=PaymentFlow.TWO_STEP,
)

@walleot.price(0.19, currency="USD")
@mcp.tool()
def add(a: int, b: int, ctx: Context) -> int:
    return a + b
```

</TabItem>
</Tabs>


## Note

- Add per‑tool prices: see [Quickstart](/quickstart) and [MCP Integration](/integrations/mcp).
- Walleot automatically includes pricing in your tool description, ensuring users are not surprised.

