import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP Exception Filter
 *
 * Security rules applied:
 * - Never expose stack traces, internal error messages, file paths,
 *   or server infrastructure details in API responses.
 * - Return HTTP 429 with Retry-After header when rate limit is exceeded.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Extract user-facing message only — never expose stack/internals
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, any>;
        message = resp['message'] ?? 'Đã xảy ra lỗi';
      } else {
        message = 'Đã xảy ra lỗi';
      }
    } else {
      // Unknown / unhandled errors — log internally, never expose to client
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Lỗi hệ thống nội bộ. Vui lòng thử lại sau.';

      // Log internally (without exposing to client)
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // Add Retry-After header for rate limit responses
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      response.setHeader('Retry-After', '60');
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
