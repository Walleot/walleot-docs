---
id: typescript
title: TypeScript SDK
slug: /sdks/typescript
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Walleot TypeScript SDK enables you to integrate payment functionality into your MCP (Model Context Protocol) servers. This guide covers installation, initialization, pricing tools, and payment flows.

## Installation

```bash
npm install walleot
```

## Quick Start

Here's how to get started with the TypeScript SDK in an MCP server:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server";
import { installWalleot, PaymentFlow } from "walleot";
import { z } from "zod";

// Initialize your MCP server
const server = new Server({ name: "my-server", version: "0.0.1" });

// Install Walleot with your API key
installWalleot(server, {
  apiKey: "YOUR WALLEOT API KEY",
  paymentFlow: PaymentFlow.ELICITATION,
});

// Register a priced tool
server.registerTool(
  "add_numbers",
  {
    title: "Add two numbers",
    description: "Adds two numbers and returns the sum.",
    inputSchema: { a: z.number(), b: z.number() },
    price: { amount: 19, currency: "USD" }, // $0.19 per call
  },
  async ({ a, b }, extra) => {
    return { content: [{ type: "text", text: String(a + b) }] };
  }
);
```

## API Reference

### installWalleot Function

The main function for integrating Walleot with your MCP server.

#### Function Signature

```typescript
installWalleot(
  server: Server,
  options: {
    apiKey: string;
    paymentFlow?: PaymentFlow;
  }
): void
```

**Parameters:**
- `server`: Your MCP Server instance
- `options.apiKey`: Your Walleot API key (get from dashboard)
- `options.paymentFlow`: Payment flow behavior (see PaymentFlow enum below)

### PaymentFlow Enum

Controls how payments are handled in your MCP server:

```typescript
import { PaymentFlow } from "walleot";

// Available options:
PaymentFlow.ELICITATION    // Default: Ask user before charging
PaymentFlow.TWO_STEP       // Two-step verification process
PaymentFlow.PROGRESS       // Progressive payment collection
```

### Tool Registration with Pricing

Use the `price` property in your tool definition to set per-call pricing:

```typescript
server.registerTool(
  "your_tool",
  {
    title: "Your Tool Title",
    description: "Your tool description.",
    inputSchema: { /* your schema */ },
    price: { amount: 25, currency: "USD" }, // $0.25 per call
  },
  async (args, extra) => {
    // Tool implementation
    return { content: [{ type: "text", text: "result" }] };
  }
);
```

**Price Object:**
- `amount`: Price in cents (e.g., 25 = $0.25)
- `currency`: Currency code (default: "USD")

## Examples

### Basic Math Tool

```typescript
import { Server } from "@modelcontextprotocol/sdk/server";
import { installWalleot, PaymentFlow } from "walleot";
import { z } from "zod";

const server = new Server({ name: "calculator", version: "1.0.0" });

installWalleot(server, {
  apiKey: process.env.WALLEOT_API_KEY!,
  paymentFlow: PaymentFlow.ELICITATION,
});

server.registerTool(
  "calculate",
  {
    title: "Basic Calculator",
    description: "Performs basic math operations.",
    inputSchema: {
      a: z.number(),
      b: z.number(),
      operation: z.enum(["add", "subtract", "multiply", "divide"]),
    },
    price: { amount: 10, currency: "USD" }, // $0.10 per calculation
  },
  async ({ a, b, operation }, extra) => {
    let result: number;
    
    switch (operation) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        result = b !== 0 ? a / b : 0;
        break;
      default:
        throw new Error("Invalid operation");
    }
    
    return { content: [{ type: "text", text: String(result) }] };
  }
);
```

### Text Processing Tool

```typescript
server.registerTool(
  "process_text",
  {
    title: "Text Processor",
    description: "Processes text with various operations.",
    inputSchema: {
      text: z.string(),
      operation: z.enum(["uppercase", "lowercase", "reverse", "word_count"]),
    },
    price: { amount: 5, currency: "USD" }, // $0.05 per operation
  },
  async ({ text, operation }, extra) => {
    let result: string;
    
    switch (operation) {
      case "uppercase":
        result = text.toUpperCase();
        break;
      case "lowercase":
        result = text.toLowerCase();
        break;
      case "reverse":
        result = text.split("").reverse().join("");
        break;
      case "word_count":
        result = String(text.split(/\s+/).length);
        break;
      default:
        throw new Error("Invalid operation");
    }
    
    return { content: [{ type: "text", text: result }] };
  }
);
```

## Environment Setup

### Required Environment Variables

```bash
# .env file
WALLEOT_API_KEY=your_api_key_here
```

### Loading Environment Variables

```typescript
import dotenv from "dotenv";

// Load .env file in development
dotenv.config();

// Access API key
const apiKey = process.env.WALLEOT_API_KEY;
```

### TypeScript Configuration

Ensure your `tsconfig.json` includes proper module resolution:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Error Handling

The SDK handles common errors gracefully:

```typescript
try {
  server.registerTool(
    "risky_operation",
    {
      title: "Risky Operation",
      description: "An operation that might fail.",
      inputSchema: { data: z.string() },
      price: { amount: 25, currency: "USD" },
    },
    async ({ data }, extra) => {
      if (!data) {
        throw new Error("Data cannot be empty");
      }
      
      // Your risky operation here
      const result = await processData(data);
      
      return { content: [{ type: "text", text: result }] };
    }
  );
} catch (error) {
  console.error("Tool registration failed:", error);
}
```

## Best Practices

1. **Use proper TypeScript types**: Leverage Zod schemas for input validation
2. **Set appropriate prices**: Consider the computational cost and value of your tools
3. **Handle errors gracefully**: Implement proper error handling in your tools
4. **Use environment variables**: Never hardcode API keys
5. **Test payment flows**: Verify your payment flows work as expected
6. **Type your responses**: Always return properly typed MCP responses

## Next Steps

- [Quickstart Guide](/quickstart) - Get up and running quickly
- [MCP Integration Guide](/integrations/mcp) - Detailed integration tutorial
- [Security and Controls](/security-and-controls) - Payment flow configuration
- [API Reference](/api/reference) - Complete API documentation
