// Standardized error handling utilities for consistent error management

import { NextResponse } from 'next/server'
import { logger } from './logger'

// Standard error types
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  DATABASE = 'DATABASE_ERROR',
  INTERNAL = 'INTERNAL_ERROR'
}

// Standard error interface
export interface AppError {
  type: ErrorType
  message: string
  details?: any
  statusCode: number
  userMessage?: string
}

// Error class for consistent error handling
export class StandardError extends Error implements AppError {
  public readonly type: ErrorType
  public readonly statusCode: number
  public readonly userMessage?: string
  public readonly details?: any

  constructor(
    type: ErrorType,
    message: string,
    statusCode: number,
    userMessage?: string,
    details?: any
  ) {
    super(message)
    this.name = 'StandardError'
    this.type = type
    this.statusCode = statusCode
    this.userMessage = userMessage
    this.details = details
  }
}

// Predefined error creators
export const createError = {
  validation: (message: string, details?: any) =>
    new StandardError(
      ErrorType.VALIDATION,
      message,
      400,
      'Please check your input and try again.',
      details
    ),

  authentication: (message: string = 'Authentication required') =>
    new StandardError(
      ErrorType.AUTHENTICATION,
      message,
      401,
      'Please log in to continue.'
    ),

  authorization: (message: string = 'Insufficient permissions') =>
    new StandardError(
      ErrorType.AUTHORIZATION,
      message,
      403,
      'You do not have permission to perform this action.'
    ),

  notFound: (resource: string = 'Resource') =>
    new StandardError(
      ErrorType.NOT_FOUND,
      `${resource} not found`,
      404,
      `The requested ${resource.toLowerCase()} could not be found.`
    ),

  conflict: (message: string, details?: any) =>
    new StandardError(
      ErrorType.CONFLICT,
      message,
      409,
      'This action conflicts with existing data.',
      details
    ),

  rateLimit: (message: string = 'Too many requests') =>
    new StandardError(
      ErrorType.RATE_LIMIT,
      message,
      429,
      'Too many requests. Please try again later.'
    ),

  externalService: (service: string, message?: string) =>
    new StandardError(
      ErrorType.EXTERNAL_SERVICE,
      `${service} service error: ${message || 'Unknown error'}`,
      502,
      'External service is temporarily unavailable. Please try again later.'
    ),

  database: (message: string, details?: any) =>
    new StandardError(
      ErrorType.DATABASE,
      `Database error: ${message}`,
      500,
      'A database error occurred. Please try again.',
      details
    ),

  internal: (message: string, details?: any) =>
    new StandardError(
      ErrorType.INTERNAL,
      message,
      500,
      'An unexpected error occurred. Please try again.',
      details
    )
}

// API error response handler
export function handleApiError(error: unknown): NextResponse {
  // Log error for debugging
  logger.error('API Error', {}, error)

  // Handle StandardError instances
  if (error instanceof StandardError) {
    return NextResponse.json(
      {
        error: error.userMessage || error.message,
        type: error.type,
        ...(process.env.NODE_ENV === 'development' && {
          details: error.details,
          stack: error.stack
        })
      },
      { status: error.statusCode }
    )
  }

  // Handle known error types
  if (error instanceof Error) {
    // Database/Supabase errors
    if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      return handleApiError(createError.conflict('Resource already exists'))
    }

    // Network/fetch errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return handleApiError(createError.externalService('Network', error.message))
    }

    // Validation errors (from libraries like Zod)
    if (error.name === 'ZodError' || error.message.includes('validation')) {
      return handleApiError(createError.validation(error.message))
    }
  }

  // Fallback for unknown errors
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      type: ErrorType.INTERNAL,
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
    },
    { status: 500 }
  )
}

// Client-side error handler
export function handleClientError(error: unknown): {
  message: string
  type: ErrorType
  shouldRetry: boolean
} {
  if (error instanceof StandardError) {
    return {
      message: error.userMessage || error.message,
      type: error.type,
      shouldRetry: [ErrorType.RATE_LIMIT, ErrorType.EXTERNAL_SERVICE, ErrorType.INTERNAL].includes(error.type)
    }
  }

  if (error instanceof Error) {
    return {
      message: 'An unexpected error occurred',
      type: ErrorType.INTERNAL,
      shouldRetry: true
    }
  }

  return {
    message: 'An unknown error occurred',
    type: ErrorType.INTERNAL,
    shouldRetry: true
  }
}

// Async error wrapper for API routes
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// React hook for error handling
export function useErrorHandler() {
  const handleError = (error: unknown) => {
    const { message, type, shouldRetry } = handleClientError(error)
    
    // You can integrate with your toast system here
    logger.error(`${type}: ${message}`, { shouldRetry, component: 'ErrorHandler' })
    
    return { message, type, shouldRetry }
  }

  return { handleError }
}