---
id: python
title: Python SDK
slug: /sdks/python
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Walleot Python SDK enables you to integrate payment functionality into your MCP (Model Context Protocol) servers. This guide covers installation, initialization, pricing tools, and payment flows.

## Installation

```bash
pip install walleot
```

## Quick Start

Here's how to get started with the Python SDK in an MCP server:

```python
from mcp.server.fastmcp import FastMCP, Context
from walleot import Walleot, PaymentFlow
import os

# Initialize your MCP server
mcp = FastMCP("My AI agent")

# Initialize Walleot with your API key
Walleot(
    mcp,
    apiKey=os.getenv("WALLEOT_API_KEY")
)

# Define a priced tool
@mcp.tool()
@Walleot.price(0.19, currency="USD")  # $0.19 per call
def add_numbers(a: int, b: int, ctx: Context) -> int:
    """Adds two numbers and returns the sum."""
    return a + b
```

## API Reference

### Walleot Class

The main class for integrating Walleot with your MCP server.

#### Constructor

```python
Walleot(
    mcp_server: FastMCP,
    apiKey: str,
    payment_flow: PaymentFlow = PaymentFlow.TWO_STEP # PaymentFlow.ELICITATION PaymentFlow.PROGRESS 
)
```

**Parameters:**
- `mcp_server`: Your FastMCP server instance
- `apiKey`: Your Walleot API key (get from dashboard)
- `payment_flow`: Payment flow behavior (see PaymentFlow enum below)

### PaymentFlow Enum

Controls how your MCP Server and the MCP client coordinate the payment process.

```python
from walleot import PaymentFlow

# Available options:
PaymentFlow.TWO_STEP       # Default
PaymentFlow.ELICITATION   
PaymentFlow.PROGRESS      
```

### Pricing Decorator

Use the `@Walleot.price()` decorator to set per-call pricing on your MCP tools:

```python
@mcp.tool()
@Walleot.price(amount, currency="USD")
def your_tool(param1: str, param2: int, ctx: Context):
    """Your tool description."""
    # Tool implementation
    pass
```

**Parameters:**
- `amount`: Price in dollars (e.g., 0.19 = $0.19)
- `currency`: Currency code (default: "USD")

## Examples

### Basic Math Tool

```python
from mcp.server.fastmcp import FastMCP, Context
from walleot import Walleot, PaymentFlow

mcp = FastMCP("Calculator")

Walleot(mcp, apiKey=os.getenv("WALLEOT_API_KEY"))

@mcp.tool()
@Walleot.price(0.10, currency="USD")  # $0.10 per calculation
def calculate(a: float, b: float, operation: str, ctx: Context) -> float:
    """Performs basic math operations."""
    if operation == "add":
        return a + b
    elif operation == "subtract":
        return a - b
    elif operation == "multiply":
        return a * b
    elif operation == "divide":
        return a / b if b != 0 else 0
    else:
        raise ValueError("Invalid operation")
```

### Image Generation Tool

```python
from mcp.server.fastmcp import FastMCP, Image, Context
from walleot import Walleot, PaymentFlow
import base64
from io import BytesIO
from PIL import Image as PILImage

mcp = FastMCP("Image Generator")

Walleot(mcp, apiKey=os.getenv("WALLEOT_API_KEY"))

@mcp.tool()
@Walleot.price(0.50, currency="USD")  # $0.50 per image
async def generate_image(prompt: str, ctx: Context) -> Image:
    """Generates an image from a text prompt."""
    # Your image generation logic here
    # Return as MCP Image resource
    pass
```

## Environment Setup

### Required Environment Variables

```bash
# .env file
WALLEOT_API_KEY=your_api_key_here
```

### Loading Environment Variables

```python
import os
from dotenv import load_dotenv

# Load .env file in development
load_dotenv()

# Access API key
api_key = os.getenv("WALLEOT_API_KEY")
```

## Best Practices

1. **Always use the Context parameter**: Include `ctx: Context` in your tool signatures
2. **Set appropriate prices**: Consider the computational cost and value of your tools
3. **Handle errors gracefully**: Implement proper error handling in your tools
4. **Use environment variables**: Never hardcode API keys
5. **Test payment flows**: Verify your payment flows work as expected

## Next Steps

- [Quickstart Guide](/quickstart) - Get up and running quickly
- [MCP Integration Guide](/integrations/mcp) - Detailed integration tutorial
- [Security and Controls](/security-and-controls) - Payment flow configuration
- [API Reference](/api/reference) - Complete API documentation
