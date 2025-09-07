# Multi-Tenant Account Tracking Guide

This guide explains how to implement account-based usage tracking for multi-tenant SaaS applications using Fastenr Analytics.

## Overview

Account-based tracking allows you to segment usage metrics by customer accounts in your multi-tenant application. Each customer's usage data is tracked separately, providing insights into individual account adoption and engagement.

## Setup Process

### 1. Enable Account-Based Tracking

When creating a new tracking product in the Fastenr dashboard:

1. Create your tracking product
2. Select **"Multi-Tenant Application"** tracking type
3. This will generate embed code with account context examples

### 2. Implementation Methods

You have three ways to identify accounts in your application:

#### Method 1: Account ID (Recommended)
Pass your internal account/customer ID:

```javascript
fastenr('your-tracking-key', {
  account: {
    id: 'customer_123', // Your internal account ID
    name: 'Acme Corp' // Optional: display name
  }
});
```

#### Method 2: Account Domain
Use customer subdomains or domains:

```javascript
fastenr('your-tracking-key', {
  account: {
    domain: window.location.hostname, // e.g., 'customer1.yourapp.com'
    name: 'Customer 1'
  }
});
```

#### Method 3: Custom Identifier
Use any custom identifier:

```javascript
fastenr('your-tracking-key', {
  account: {
    customId: 'custom_account_xyz',
    name: 'Custom Account'
  }
});
```

## Framework-Specific Examples

### React with Context

```jsx
import { useAccount } from './contexts/AccountContext';

function useFastenrAnalytics(trackingKey) {
  const { currentAccount } = useAccount();
  
  useEffect(() => {
    if (typeof window === 'undefined' || !currentAccount) return;
    
    const script = document.createElement('script');
    script.src = 'https://fastenr.co/tracking/fastenr-analytics.js';
    script.onload = () => {
      window.fastenr(trackingKey, {
        apiUrl: 'https://fastenr.co/api/tracking',
        account: {
          id: currentAccount.id,
          name: currentAccount.name
        }
      });
    };
    document.head.appendChild(script);
  }, [trackingKey, currentAccount?.id]);
}
```

### Next.js App Router

```jsx
// app/layout.js
import { useAccount } from '@/contexts/AccountContext';

export default function Layout({ children }) {
  const { currentAccount } = useAccount();
  
  return (
    <>
      {currentAccount && (
        <Script 
          src="https://fastenr.co/tracking/fastenr-analytics.js"
          onLoad={() => {
            fastenr('your-tracking-key', {
              apiUrl: 'https://fastenr.co/api/tracking',
              account: {
                id: currentAccount.id,
                name: currentAccount.name
              }
            });
          }}
        />
      )}
      {children}
    </>
  );
}
```

### Vue.js

```javascript
// main.js or component
export default {
  data() {
    return {
      currentAccount: null // Load from your auth system
    }
  },
  
  watch: {
    currentAccount: {
      handler(newAccount) {
        if (newAccount) {
          this.initializeFastenrAnalytics();
        }
      },
      immediate: true
    }
  },
  
  methods: {
    initializeFastenrAnalytics() {
      const script = document.createElement('script');
      script.src = 'https://fastenr.co/tracking/fastenr-analytics.js';
      script.onload = () => {
        window.fastenr('your-tracking-key', {
          apiUrl: 'https://fastenr.co/api/tracking',
          account: {
            id: this.currentAccount.id,
            name: this.currentAccount.name
          }
        });
      };
      document.head.appendChild(script);
    }
  }
}
```

## Common Implementation Patterns

### Pattern 1: User Context Hook
```javascript
// Custom hook to get current account context
function getCurrentAccountContext() {
  // This should integrate with your authentication/tenant system
  const user = getCurrentUser();
  const account = user?.currentAccount || user?.account;
  
  return {
    id: account?.id,
    name: account?.name,
    domain: account?.domain
  };
}

// Usage
const accountContext = getCurrentAccountContext();
fastenr('tracking-key', { account: accountContext });
```

### Pattern 2: Route-Based Detection
```javascript
// Extract account from URL (e.g., /accounts/123/dashboard)
function getAccountFromRoute() {
  const path = window.location.pathname;
  const accountMatch = path.match(/\/accounts\/([^\/]+)/);
  return accountMatch ? accountMatch[1] : null;
}

// Usage
const accountId = getAccountFromRoute();
if (accountId) {
  fastenr('tracking-key', {
    account: { id: accountId }
  });
}
```

### Pattern 3: Environment Variable
```javascript
// Use environment variables or config for account identification
const accountConfig = {
  id: process.env.NEXT_PUBLIC_ACCOUNT_ID,
  name: process.env.NEXT_PUBLIC_ACCOUNT_NAME
};

fastenr('tracking-key', { account: accountConfig });
```

## Dashboard Features

Once implemented, your Fastenr dashboard will show:

- **Account Filter**: Switch between viewing all accounts or specific accounts
- **Per-Account Metrics**: Unique users, sessions, page views segmented by account
- **Account List**: All tracked accounts with activity timestamps
- **Aggregated Views**: Combined metrics across all accounts

## Data Structure

Each tracked account creates a record with:

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "account_id": "customer_123",
  "account_name": "Acme Corp", 
  "account_domain": "acme.yourapp.com",
  "custom_identifier": null,
  "created_at": "2024-01-01T00:00:00Z",
  "last_activity_at": "2024-01-15T10:30:00Z",
  "is_active": true
}
```

## Best Practices

1. **Consistent Identification**: Use the same account identifier method throughout your application
2. **Account Names**: Provide human-readable account names for easier dashboard navigation
3. **Error Handling**: Handle cases where account context is not available
4. **Privacy**: Only pass necessary account identifiers, avoid sensitive data

## Troubleshooting

### Common Issues

**Account context not available on page load:**
```javascript
// Wait for account context to be available
function waitForAccount(callback) {
  if (window.currentAccount) {
    callback(window.currentAccount);
  } else {
    setTimeout(() => waitForAccount(callback), 100);
  }
}

waitForAccount((account) => {
  fastenr('tracking-key', { account });
});
```

**Multiple account switches in single session:**
```javascript
// Re-initialize when account changes
function switchAccount(newAccount) {
  // Clear existing session
  if (window.FastenrAnalytics?._instance) {
    window.FastenrAnalytics._instance.endSession();
  }
  
  // Initialize with new account
  fastenr('tracking-key', { 
    account: newAccount 
  });
}
```

## Support

For additional support with multi-tenant implementation, please check the Fastenr dashboard setup dialog which provides framework-specific code examples, or contact support through the application.