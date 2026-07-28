using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using PruebaTecnica.Core.Application.Exceptions;
using PruebaTecnica.Core.Application.Interfaces.Services;
using PruebaTecnica.Core.Domain.Entities;
using System.Net;
using System.Security.Claims;

namespace PruebaTecnica.WebApi.Middlewares
{
    public class GlobalExceptionHandler: IExceptionHandler
    {
        private readonly ILogWriter _logWriter;
        public GlobalExceptionHandler(ILogWriter logWriter) => _logWriter = logWriter;
        
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            string exceptionTitle = "Internal Server Error";
            string details = exception.Message;

            var endpoint = httpContext.Request.Path.Value;
            var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

            var log = new Log()
            {
                Level = "Error",
                Message = exception.Message,
                Detail = exception.ToString(),
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

            switch (exception)
            {
                case ApiException e:
                    switch (e.ErrorCode)
                    {
                        case (int)HttpStatusCode.BadRequest:
                            exceptionTitle = "Bad request";
                            httpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                            break;
                        case (int)HttpStatusCode.NotFound:
                            exceptionTitle = "Not found";
                            httpContext.Response.StatusCode = (int)HttpStatusCode.NotFound;
                            break;
                        case (int)HttpStatusCode.Conflict:
                            exceptionTitle = "Conflict";
                            httpContext.Response.StatusCode = (int)HttpStatusCode.Conflict;
                            break;
                        case (int)HttpStatusCode.Unauthorized:
                            exceptionTitle = "Unauthorized";
                            httpContext.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                            break;
                        default:
                            if (e.ErrorCode >= 400 && e.ErrorCode < 600)
                            {
                                exceptionTitle = ((HttpStatusCode)e.ErrorCode).ToString();
                                httpContext.Response.StatusCode = e.ErrorCode;
                            }
                            else
                            {
                                httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                            }
                            break;
                    }
                break;
                case ValidationException e:
                    exceptionTitle = "Bad Request";
                    details = ((ValidationException)exception).Errors.Aggregate((a, b) => a + ", " + b);
                    httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                break;
                case KeyNotFoundException e:
                    exceptionTitle = "Not Found";
                    httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
                break;
                default:
                    httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
                break;
            }

            var problemDetails = new ProblemDetails
            {
                Title = exceptionTitle,
                Detail = details,
                Status = httpContext.Response.StatusCode,
                Instance = httpContext.Request.Path
            };

            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
            return true;
        }
    }
}
