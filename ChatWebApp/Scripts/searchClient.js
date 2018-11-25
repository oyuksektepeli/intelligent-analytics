
$(document).ready(function () {

    $("#btnSendSearch").click(function () {
        var searchText = encodeURIComponent($("#searchText").val());
        doSearch(searchText);
    });

    $("#searchText").on("keyup", function (event) {
        if (event.keyCode == 13) {
            $("#btnSendSearch").click();
        }
    });

    function doSearch(searchText) {
        $.getJSON(chatSearchApiBase + "/api/search?searchText=" + searchText, function (data) {
            var items = [], searchResultsDiv = $("div.search-results");
            var searchResults = JSON.parse(data);
            if (searchResults && searchResults.length > 0) {
                com.contoso.concierge.findUniqueSearchUsers(searchResults);

                $.each(searchResults, function (key, searchResult) {
                    items.push(createChatEntry(searchResult));
                });

                $("div.search-empty").hide();
                searchResultsDiv.empty();
                searchResultsDiv.html("<p>Found <strong>" + searchResults.length + "</strong> " + (searchResults.length === 1 ? "result" : "results") + "</p><p>&nbsp;</p>")
                $("<ul/>", {
                    "class": "chat",
                    html: items.join("")
                }).appendTo("div.search-results");
            }
            else {
                searchResultsDiv.empty();
                $("div.search-empty").show();
            }
        });
    }

    function createChatEntry(searchResult) {
        var chatEntry = "", createDate, initial;
        createDate = new Date(searchResult.CreateDate);
        initial = searchResult.Username.substring(0, searchResult.Username.length > 1 ? 2 : 1).toUpperCase();

        chatEntry = '<li class="chatBubbleOtherUser left clearfix"><span class="chat-img pull-left">';
        chatEntry += '<img src="https://placehold.it/50/' + com.contoso.concierge.getAvatarColor(searchResult.Username) + '/fff&text=' + initial + '" alt="' + searchResult.Username + '" class="img-circle" /></span>';
        chatEntry += '<div class="chat-body clearfix"><div class="header">';
        chatEntry += '<strong class="primary-font">' + searchResult.Username + '</strong><small class="pull-right search-time text-muted">';
        chatEntry += '<span class="glyphicon glyphicon-time"></span>&nbsp;' + createDate.toLocaleDateString() + ' ' + createDate.toLocaleTimeString() + '</small></div>';
        chatEntry += '<p>' + searchResult.Message + '</p>';
        chatEntry += '</div></li>';

        return chatEntry;
    }

});