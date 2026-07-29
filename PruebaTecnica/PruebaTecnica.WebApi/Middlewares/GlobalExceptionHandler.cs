using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Entities;
using System.Diagnostics;
using System.Net;
using System.Security.Claims;

namespace PruebaTecnica.WebApi.Middlewares
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogWriter _logWriter;
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogWriter logWriter, ILogger<GlobalExceptionHandler> logger)
        {
            _logWriter = logWriter;
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            var endpoint = httpContext.Request.Path.Value;
            var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;

            // Mapea el tipo de excepcion -> (status, nivel de log, titulo/detalle para el cliente).
            int statusCode;
            LogLevel logLevel;
            string title;
            string? detail;

            switch (exception)
            {
                case ValidationException validation:
                    statusCode = StatusCodes.Status400BadRequest;
                    logLevel = LogLevel.Information;
                    title = "Bad Request";
                    detail = validation.Errors.Count > 0
                        ? string.Join(", ", validation.Errors)
                        : validation.Message;
                    break;

                case UnauthorizedException:
                    statusCode = StatusCodes.Status401Unauthorized;
                    logLevel = LogLevel.Information;
                    title = "Unauthorized";
                    detail = exception.Message;
                    break;

                case NotFoundException:
                    statusCode = StatusCodes.Status404NotFound;
                    logLevel = LogLevel.Information;
                    title = "Not Found";
                    detail = exception.Message;
                    break;

                case KeyNotFoundException:
                    statusCode = StatusCodes.Status404NotFound;
                    logLevel = LogLevel.Information;
                    title = "Not Found";
                    detail = exception.Message;
                    break;

                // ApiException base: respeta su ErrorCode (401/403/500/...); default 400.
                case ApiException api:
                    statusCode = (api.ErrorCode >= 400 && api.ErrorCode < 600)
                        ? api.ErrorCode
                        : StatusCodes.Status400BadRequest;
                    logLevel = statusCode >= 500 ? LogLevel.Error : LogLevel.Warning;
                    title = ((HttpStatusCode)statusCode).ToString();
                    detail = exception.Message;
                    break;

                default:
                    statusCode = StatusCodes.Status500InternalServerError;
                    logLevel = LogLevel.Error;
                    title = "Internal Server Error";
                    detail = exception.Message;
                    break;
            }

            bool isServerError = statusCode >= 500;

            // Solo los 500 se loguean con el objeto Exception (stack trace).
            // Los esperados: mensaje estructurado, sin trace.
            if (isServerError)
            {
                _logger.LogError(exception,
                    "Unhandled exception on {Endpoint} (traceId {TraceId}): {Message}",
                    endpoint, traceId, exception.Message);
            }
            else
            {
                _logger.Log(logLevel,
                    "Handled {ExceptionType} on {Endpoint} -> {StatusCode} (traceId {TraceId}): {Message}",
                    exception.GetType().Name, endpoint, statusCode, traceId, exception.Message);
            }

            // Persistencia en la tabla [Logs] (sink existente, ILogWriter). Se conserva.
            var log = new Log
            {
                Level = logLevel.ToString(),
                Message = exception.Message,
                Detail = isServerError ? exception.ToString() : exception.Message,
                User = userId,
                Endpoint = endpoint
            };

            try
            {
                await _logWriter.WriteAsync(log, cancellationToken);
            }
            catch
            {
                // si el log falla (BD caida), la respuesta de error debe llegar igual al cliente
            }

            // Solo los 500 devuelven titulo/detalle generico; los demas devuelven el mensaje real.
            var problemDetails = new ProblemDetails
            {
                Title = isServerError ? "Error interno" : title,
                Detail = isServerError ? "Ocurrió un error interno procesando la solicitud." : detail,
                Status = statusCode,
                Instance = httpContext.Request.Path
            };
            problemDetails.Extensions["traceId"] = traceId;

            httpContext.Response.StatusCode = statusCode;
            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
            return true;
        }
    }
}
