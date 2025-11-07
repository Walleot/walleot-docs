---
id: prompt-tool
title: Prompt-based tool (per-call)
slug: /examples/prompt-tool
---

Charge per request for a prompt-driven MCP tool.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="ts" label="Node.js">

```ts
import { Server } from "@modelcontextprotocol/sdk/server";
import { installWalleot, Mode } from "walleot";
import { z } from "zod";

const server = new Server({ name: "my-server", version: "0.0.1" });

installWalleot(server, {
  apiKey: "YOUR WALLEOT API KEY"
});

server.registerTool(
  "prompt_tool",
  {
    title: "Prompt Tool",
    description: "Echoes back your prompt.",
    inputSchema: { prompt: z.string() },
    price: { amount: 0.19, currency: "USD" },
  },
  async ({ prompt }, extra) => {
    return { content: [{ type: "text", text: `You said: ${prompt}` }] };
  }
);
```

</TabItem>
<TabItem value="py" label="Python">

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
def prompt_tool(prompt: str, ctx: Context) -> dict:
    return {
        "content": [{"type": "text", "text": f"You said: {prompt}"}],
    }
```

</TabItem>
</Tabs>

