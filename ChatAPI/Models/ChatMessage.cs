using Microsoft.Azure.Search.Models;
using System;

namespace ChatAPI
{
    [SerializePropertyNamesAsCamelCase]
    public partial class ChatMessage
    {
        public string Id { get; set; }

        public string Message { get; set; }

        public DateTime CreateDate { get; set; }

        public string Username { get; set; }

    }
}