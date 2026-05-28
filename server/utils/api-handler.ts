import type { H3Event, EventHandlerRequest } from 'h3'
import { defineEventHandler, createError } from 'h3'
import { ZodError } from 'zod'
import { recordSystemError } from './system-console'

type ApiHandler<T> = (event: H3Event<EventHandlerRequest>) => Promise<T>

export function apiHandler<T>(handler: (event: H3Event) => (T | Promise<T>)): ApiHandler<T> {
  return defineEventHandler(async (event) => {
    try {
      return await handler(event)
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        recordSystemError(error, 'API validation')
        throw createError({
          statusCode: 400,
          statusMessage: 'Błąd walidacji',
          data: error.flatten()
        })
      }
      if (error instanceof Error && 'statusCode' in error) {
        recordSystemError(error, 'API error')
        throw error
      }
      recordSystemError(error, 'API unhandled')
      console.error('[API] Unhandled error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Wewnętrzny błąd serwera'
      })
    }
  })
}
