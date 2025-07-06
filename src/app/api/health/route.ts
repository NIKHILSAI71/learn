import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if the application is running properly
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Learn Platform',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
