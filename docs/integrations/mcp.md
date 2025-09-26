---
id: mcp
title: Building a Paid MCP Server
slug: /integrations/mcp
---

This guide shows how to build a Python MCP server that charges per call using Walleot SDK

## What you need

- Python 3.10+
- OpenAI API key
- Walleot API key
- `uv` to manage Python projects

## Project setup

```bash
uv init mcp-server-demo
cd mcp-server-demo

# Add MCP SDK and CLI
uv add "mcp[cli]"

# Image generation and payments
uv add openai walleot

# Optional: fetch image bytes, env vars, local resize
uv add requests python-dotenv Pillow
```

Create a `.env` for local development:

```env
OPENAI_API_KEY=sk-...
WALLEOT_API_KEY=...
ENV=development
```

## Minimal MCP server

Create `server.py`:

```python
from mcp.server.fastmcp import FastMCP, Context, Image

# Create an MCP server
mcp = FastMCP("Image generator")

# Define your AI tool
@mcp.tool()
async def generate(prompt: str, ctx: Context):  # keep ctx: Context
    """Generates an image and returns it as an MCP resource"""
    return None  # will implement below

if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```

## OpenAI image generation helper

Create `openai_client.py`:

```python
from typing import Optional
import os
import base64
import requests
from openai import AsyncOpenAI

_client: Optional[AsyncOpenAI] = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "Missing OPENAI_API_KEY. Set it before calling generate_image()."
            )
        _client = AsyncOpenAI(api_key=api_key)
    return _client


async def generate_image(prompt: str) -> str:
    """Generate an image and return base64 (PNG by default)."""
    client = _get_client()
    res = await client.images.generate(
        model="dall-e-2",
        prompt=prompt
    )

    b64 = getattr(res.data[0], "b64_json", None) if res.data else None
    if not b64:
        url = getattr(res.data[0], "url", None) if res.data else None
        if not url:
            raise RuntimeError("No image returned (neither b64_json nor url)")
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        b64 = base64.b64encode(resp.content).decode("ascii")
    return b64
```

## Use the helper and return an MCP resource

Update `server.py`:

```python
from mcp.server.fastmcp import FastMCP, Context, Image
from openai_client import generate_image
from io import BytesIO
from PIL import Image as PILImage
import base64

mcp = FastMCP("Image generator")

@mcp.tool()
async def generate(prompt: str, ctx: Context):
    """Generates high quality image and returns it as MCP resource"""
    b64 = await generate_image(prompt)

    # Decode base64 and resize locally (optional)
    raw = base64.b64decode(b64)
    img = PILImage.open(BytesIO(raw))
    img.thumbnail((100, 100))

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return Image(data=buffer.getvalue(), format="png")

if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```

## Run and test

Run with MCP Inspector:

```bash
uv run mcp dev server.py
```

Install for Claude Desktop (optional):

```bash
uv run mcp install server.py --with openai --with requests --with Pillow
```

## Add payments

Initialize Walleot and price your tool in `server.py`:

```python
from walleot import Walleot, PaymentFlow, price
import os

# Payments with Walleot
Walleot(
    mcp,
    apiKey=os.getenv("WALLEOT_API_KEY"),
    payment_flow=PaymentFlow.ELICITATION  # use TWO_STEP for clients without elicitation
)

@mcp.tool()
@price(0.2, "USD")
async def generate(prompt: str, ctx: Context):
    ...
```

Once `WALLEOT_API_KEY` is set, your MCP will request payment before running the tool.

## Run as a server or install in a client

Run as a server:

```bash
uv run server.py
```

Install for Claude Desktop (remember to switch to `PaymentFlow.TWO_STEP` if needed):

```bash
uv run mcp install server.py --with openai --with walleot --with requests --with Pillow
```

## Troubleshooting

- Missing `OPENAI_API_KEY`: check env vars or `.env`.
- No image returned: verify model access or try a different model.
- Payment not triggered: verify `WALLEOT_API_KEY`, `Walleot SDK` init, and the `@price(...)` decorator.



