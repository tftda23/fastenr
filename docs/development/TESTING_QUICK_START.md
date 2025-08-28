# 🚀 Quick Testing Guide

## TL;DR - Run Tests Now

```bash
# Quick test (no server needed) - Tests environment, files, build
npm run test:production:no-server

# Full test (requires server) - Tests everything including API routes
npm run test:with-server

# Test + Build for deployment
npm run test:build
```

## Common Test Scenarios

### 1. **Pre-Deployment Check** (Recommended)
```bash
npm run test:production:no-server
```
✅ Tests environment variables, file structure, security config  
✅ No server required  
✅ Fast execution (~10 seconds)  

### 2. **Full System Test** (Complete validation)
```bash
npm run test:with-server
```
✅ Starts dev server automatically  
✅ Tests all API routes and functionality  
✅ Complete production readiness validation  

### 3. **Build Validation** (Before deployment)
```bash
npm run test:build
```
✅ Runs all tests + Next.js build  
✅ Validates deployment readiness  
✅ Perfect for CI/CD pipelines  

## Test Results

Results are saved in `.test-logs/` directory:
- `test-summary-{id}.txt` - Human readable summary
- `test-report-{id}.json` - Detailed JSON report

## Environment Setup

The tests use `.env.test` file with safe mock values. No real credentials needed for basic testing.

For production testing, copy `.env.production.example` to `.env.production` and configure real values.

## Troubleshooting

**"Server not running" warnings?**
- Use `npm run test:production:no-server` for tests without server
- Or use `npm run test:with-server` to auto-start server

**Environment variable failures?**
- Check `.env.test` file exists
- For production: configure `.env.production` with real values

**Build failures?**
- Run `npm install` to ensure dependencies
- Check TypeScript errors with `npm run lint`

## What Gets Tested

✅ **Environment Variables** - Required/optional configuration  
✅ **File System** - Critical files and directories  
✅ **Database** - Connection and basic queries  
✅ **API Routes** - All endpoints (when server running)  
✅ **Security** - Headers and data exposure  
✅ **Build Process** - Next.js compilation  

## Success Criteria

- **90%+ pass rate** = Production ready ✅
- **Critical failures** = Fix before deploying ❌
- **Warnings** = Optional improvements ⚠️