---
id: pay-per-use-api
title: "Example: Pay‑per‑use API"
slug: /examples/pay-per-use-api
---

Charge users per request to an MCP tool by attaching a price.

**Node (MCP server):**

```ts
import { Server } from "@modelcontextprotocol/sdk/server";
import { installWalleot, Mode } from "walleot";
import { z } from "zod";

const server = new Server({ name: "my-server", version: "0.0.1" });

installWalleot(server, {
  apiKey: "YOUR WALLEOT API KEY"
});

server.registerTool(
  "add",
  {
    title: "Add",
    description: "Add two numbers.",
    inputSchema: { a: z.number(), b: z.number() },
    price: { amount: 0.19, currency: "USD" }, // $0.19
  },
  async ({ a, b }, extra) => {
    return { content: [{ type: "text", text: String(a + b) }] };
  }
);
```

**Python (MCP server):**

```python
from mcp.server.fastmcp import FastMCP, Context
from walleot import Walleot, Mode
import os

mcp = FastMCP("My Server")

walleot = Walleot(
    mcp,
    apiKey=os.getenv("WALLEOT_API_KEY")
)

@walleot.price(0.19, currency="USD")
@mcp.tool()
def add(a: int, b: int, ctx: Context) -> int:
    return a + b
```
