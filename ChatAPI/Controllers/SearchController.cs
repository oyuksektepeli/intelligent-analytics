using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using Microsoft.Azure.Search;
using System.Configuration;
using Newtonsoft.Json;
using Microsoft.Azure.Search.Models;

namespace ChatAPI.Controllers
{
    public class SearchController : ApiController
    {
        private readonly string _searchServiceName = ConfigurationManager.AppSettings["SearchServiceName"];
        private readonly string _queryApiKey = ConfigurationManager.AppSettings["SearchServiceQueryApiKey"];
        private readonly string _indexName = ConfigurationManager.AppSettings["SearchIndexName"];

        public string Get(string searchText)
        {
            // Perform search
            var searchIndexClient = new SearchIndexClient(_searchServiceName, _indexName, new SearchCredentials(_queryApiKey));

            var sp = new SearchParameters()
            {
                HighlightFields = new List<string>() { "message" },
                HighlightPreTag = "<span class='hit'>",
                HighlightPostTag = "</span>"
            };

            var result = searchIndexClient.Documents.Search<ChatMessage>(searchText, sp);

            var matchedMessages = new List<ChatMessage>();
            foreach (var searchResult in result.Results)
            {
                // Replace the message with the hit highlighted version
                searchResult.Document.Message = searchResult.Highlights["message"].First();
                matchedMessages.Add(searchResult.Document);
            }

            var jsonResult = JsonConvert.SerializeObject(matchedMessages);

            return jsonResult;
        }

    }
}
