# PostgREST Connection Pooling Optimization

## Problem Identified
The application was making **125,870 calls** to the PostgREST configuration query:
```sql
select set_config('search_path', $1, true), set_config($2, $3, true), set_config('role', $4, true), set_config('request.jwt.claims', $5, true), set_config('request.method', $6, true), set_config('request.path', $7, true), set_config('request.headers', $8, true), set_config('request.cookies', $9, true)
```

This indicated poor connection pooling and excessive database connection establishment instead of connection reuse.

## Root Causes
1. **No Connection Reuse**: Multiple Supabase client instances were being created
2. **Poor Singleton Pattern**: Components weren't using the singleton client properly
3. **Missing Connection Monitoring**: No visibility into connection patterns

## Solutions Implemented

### 1. Database-Side Optimizations (`scripts/60_optimize_connection_pooling.sql`)

#### Monitoring Functions
- `get_connection_stats()`: Monitor database connections by application
- `get_query_performance_stats()`: Monitor query performance (requires pg_stat_statements)
- `log_excessive_connections()`: Alert on connection issues

#### Performance Optimizations
- `mv_org_config`: Materialized view to cache frequently accessed organization data
- `refresh_org_config_cache()`: Function to refresh cache periodically

### 2. Application-Side Optimizations

#### Enhanced Singleton Pattern (`lib/supabase/client.ts`)
```typescript
// Global singleton instance to ensure connection reuse
let globalClientInstance: ReturnType<typeof createClientComponentClient> | null = null

export const createClient = () => {
  // Return existing instance if available (connection reuse)
  if (globalClientInstance) {
    return globalClientInstance
  }
  
  // Create new instance only if none exists
  globalClientInstance = createClientComponentClient()
  return globalClientInstance
}
```

#### Centralized Hook (`lib/hooks/useSupabase.ts`)
```typescript
export function useSupabase(): SupabaseClient {
  const [client] = useState(() => {
    // Use the singleton client instance
    return createClient()
  })
  return client
}
```

## Usage Guidelines

### For New Components
Use the centralized hook instead of creating new clients:
```typescript
// ❌ Don't do this
const supabase = createClientComponentClient()

// ✅ Do this
import { useSupabase } from '@/lib/hooks/useSupabase'
const supabase = useSupabase()
```

### For Existing Components
Replace direct client creation with the hook:
```typescript
// Old pattern
const supabase = createClientComponentClient()

// New pattern
const supabase = useSupabase()
```

## Monitoring Connection Health

### Check Current Connections
```sql
SELECT * FROM get_connection_stats();
```

### Monitor PostgREST Configuration Calls
```sql
SELECT 
    calls,
    total_exec_time::numeric(10,2) as total_time_ms,
    mean_exec_time::numeric(6,3) as avg_time_ms
FROM pg_stat_statements 
WHERE query LIKE 'select set_config(%search_path%'
ORDER BY calls DESC;
```

### Refresh Organization Cache (Run every 5-10 minutes)
```sql
SELECT refresh_org_config_cache();
```

## Expected Results
- **Reduced PostgREST Config Calls**: From 125,870+ to under 100 calls
- **Better Connection Reuse**: PostgREST connections should remain stable
- **Improved Performance**: Faster database operations due to connection reuse
- **Better Monitoring**: Visibility into connection patterns and performance

## Next Steps
1. **Deploy Changes**: Update production with the optimized client pattern
2. **Monitor Results**: Check `get_connection_stats()` after deployment
3. **Set Up Cache Refresh**: Schedule periodic refresh of `mv_org_config`
4. **Update Components**: Gradually migrate existing components to use `useSupabase()` hook

## Performance Baseline
- **Before**: 125,870 configuration calls, 11 idle PostgREST connections
- **Target**: <100 configuration calls, 2-3 stable PostgREST connections
- **Database Connections**: Max 60 connections available, typically using 6-8

---
*Created: 2025-09-07*
*Author: Claude Code Assistant*