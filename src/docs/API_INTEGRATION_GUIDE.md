# API Integration Guide

CharityHub provides a REST API for integrating with your systems.

## Authentication

All API requests require an API Key. Get your key from Settings → API Keys.

```
Authorization: Bearer YOUR_API_KEY
```

## Base URL

```
https://api.charityhub.com/v1
```

## Endpoints

### List Donors

```
GET /charities/{charity_id}/donors
```

**Response:**
```json
{
  "data": [
    {
      "id": "donor_123",
      "name": "John Doe",
      "email": "john@example.com",
      "total_donated": 5000,
      "donation_count": 12
    }
  ],
  "total": 1,
  "page": 1
}
```

### Create Campaign

```
POST /charities/{charity_id}/campaigns
```

**Request:**
```json
{
  "name": "Annual Appeal 2026",
  "description": "Help us reach £10,000",
  "target_amount": 10000,
  "end_date": "2026-12-31"
}
```

### Get Usage Metrics

```
GET /charities/{charity_id}/usage
```

**Response:**
```json
{
  "api_calls": 1250,
  "api_limit": 10000,
  "exports": 42,
  "export_limit": 100,
  "ai_generations": 15,
  "ai_limit": 50
}
```

## Rate Limiting

Rate limits depend on your subscription tier:

| Tier | API Calls/Month | Exports | AI Generations |
|------|-----------------|---------|----------------|
| Starter | 10,000 | 100 | 50 |
| Professional | 100,000 | 1,000 | 500 |
| Enterprise | Unlimited | Unlimited | Unlimited |

Exceeding limits returns `429 Too Many Requests`.

## Error Codes

| Code | Meaning |
|------|---------|
| 401 | Invalid API key |
| 403 | Feature not available on your tier |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Server error |

## Webhooks

Configure webhooks in Settings → Webhooks to receive real-time notifications.

**Example payload:**
```json
{
  "event": "invoice.paid",
  "timestamp": "2026-05-02T10:30:00Z",
  "data": {
    "invoice_id": "inv_123",
    "amount": 299,
    "charity_id": "char_456"
  }
}
```

**Signature verification:**
```javascript
const crypto = require('crypto');
const signature = req.headers['x-charityhub-signature'];
const body = req.body;
const secret = 'whsec_your_webhook_secret';

const hash = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

if (hash !== signature) {
  throw new Error('Invalid signature');
}
```

## Examples

### JavaScript

```javascript
const charityId = 'char_123';
const apiKey = 'ch_live_abc123';

// List donors
const response = await fetch(
  `https://api.charityhub.com/v1/charities/${charityId}/donors`,
  {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  }
);

const { data } = await response.json();
console.log(data);
```

### Python

```python
import requests

api_key = 'ch_live_abc123'
charity_id = 'char_123'

response = requests.get(
  f'https://api.charityhub.com/v1/charities/{charity_id}/donors',
  headers={'Authorization': f'Bearer {api_key}'}
)

donors = response.json()['data']
print(donors)
```

### cURL

```bash
curl https://api.charityhub.com/v1/charities/char_123/donors \
  -H "Authorization: Bearer ch_live_abc123"
```

## Support

- Email: api@charityhub.com
- Docs: https://charityhub.com/api-docs
- Status: https://status.charityhub.com