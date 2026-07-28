namespace PruebaTecnica.Core.Application.Exceptions
{
    public class ApiException : Exception
    {
        public int ErrorCode { get; set; } = 500;

        public ApiException() : base("An error has ocurred") { }
        
        public ApiException(string message) : base(message){}
        public ApiException(string message, int errorCode) : base(message)
        {
            ErrorCode = errorCode;
        }
        
    }
}