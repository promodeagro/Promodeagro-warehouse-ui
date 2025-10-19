# 🚀 API Integration Guide

## Current Status: Mock Mode ✅
- All customer lookup uses mock data
- No real API calls
- No backend required
- Works perfectly for development

## When You're Ready for Real API:

### Step 1: Enable Real API Mode
In `AddNewOrder.tsx`, find the customer lookup function and:

1. **Comment out the mock section:**
```javascript
// 🔄 MOCK MODE - Remove this when API is ready
// await new Promise(resolve => setTimeout(resolve, 500));
// const mockCustomers = [...];
// const customerData = mockCustomers.find(...);
```

2. **Uncomment the real API section:**
```javascript
// 🚀 REAL API MODE - Uncomment when backend is ready
const response = await fetch(`/api/customers/lookup?phone=${encodeURIComponent(phoneNumber)}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth if needed
  }
});

if (!response.ok) {
  throw new Error(`API Error: ${response.status} ${response.statusText}`);
}

const customerData = await response.json();
```

### Step 2: Backend Requirements
Your backend API should return data in this format:

```json
{
  "id": "C001",
  "phone": "7097797410",
  "name": "John Doe",
  "flatNo": "123",
  "area": "Downtown",
  "landmark": "Near Mall",
  "pincode": "500001",
  "addresses": [
    {
      "id": "A001",
      "flatNo": "123",
      "area": "Downtown",
      "landmark": "Near Mall",
      "pincode": "500001"
    }
  ]
}
```

### Step 3: API Endpoints Needed
- `GET /api/customers/lookup?phone={phone}` - Customer lookup
- `POST /api/customers` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `POST /api/customers/{id}/addresses` - Add address
- `POST /api/orders` - Create order

### Step 4: Error Handling
The code already handles these errors:
- ✅ Network errors (no internet)
- ✅ API errors (404, 500, etc.)
- ✅ JSON parsing errors
- ✅ Authentication errors

### Step 5: Testing
1. Start with mock data (current state)
2. Test all functionality
3. Switch to real API
4. Test with real backend
5. Handle any data format differences

## Benefits of Current Setup:
- ✅ **No backend needed** for development
- ✅ **Easy to test** all features
- ✅ **Ready for API** when backend is ready
- ✅ **Proper error handling** already implemented
- ✅ **Clear comments** showing what to change

## No Problems Expected! 🎉
The current code is designed to work with both mock and real API. When you're ready, just follow the steps above and everything will work smoothly!
