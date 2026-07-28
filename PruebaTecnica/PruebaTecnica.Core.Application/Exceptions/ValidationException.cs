using FluentValidation.Results;

namespace PruebaTecnica.Core.Application.Exceptions
{
    public class ValidationException : Exception
    {
        public ValidationException(): base("Validation failed")
        {
            Errors = new();
        }

        public List<string> Errors { get; set; }

        public ValidationException(IEnumerable<ValidationFailure> failures)
            : this()
        {
            Errors = failures.Select(f => f.ErrorMessage).ToList();
        }
    }
}
