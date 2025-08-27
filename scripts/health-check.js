#!/usr/bin/env node

/**
 * Simple health check endpoint for testing
 * Creates a basic health check API route if it doesn't exist
 */

const fs = require('fs');
const path = require('path');

const healthCheckContent = `import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health checks
    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected', // TODO: Add actual DB check
      services: {
        supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        email: !!process.env.RESEND_API_KEY,
        stripe: !!process.env.STRIPE_SECRET_KEY
      }
    }

    return NextResponse.json(checks)
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}`;

// Create health check endpoints
const healthPaths = [
  'app/api/health/route.ts',
  'app/api/v1/health/route.ts'
];

for (const healthPath of healthPaths) {
  const fullPath = path.join(process.cwd(), healthPath);
  const dir = path.dirname(fullPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
  
  // Create health check file if it doesn't exist
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, healthCheckContent);
    console.log(`Created health check: ${healthPath}`);
  } else {
    console.log(`Health check already exists: ${healthPath}`);
  }
}

console.log('✅ Health check endpoints ready');