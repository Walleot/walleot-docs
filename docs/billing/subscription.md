---
id: subscription
title: Subscription pricing
slug: /billing/subscription
---

Charge monthly/annual for ongoing access.

```ts
const plan = await client.subscriptions.createPlan({
  name: "Pro",
  amount: 100, // $1.00
  currency: "USD",
  interval: "month",
});

await client.subscriptions.subscribe({ planId: plan.id, userId: "user_123" });
```

```python
plan = client.subscriptions.create_plan({
    "name": "Pro",
    "amount": 100,
    "currency": "USD",
    "interval": "month",
})

client.subscriptions.subscribe({"planId": plan["id"], "userId": "user_123"})
```

