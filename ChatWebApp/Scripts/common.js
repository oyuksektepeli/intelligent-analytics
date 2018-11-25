jQuery(function ($) {
    var avatarColors = ['00A600', '55C1E7', 'F2B509', 'FF5300'];
    var uniqueUsers = [];

    com.contoso.concierge.findUniqueSearchUsers = function (searchResults) {
        var results = searchResults.length;
        var flags = [], l = results, i;
        for (i = 0; i < l; i++) {
            if (flags[searchResults[i].Username]) continue;
            flags[searchResults[i].Username] = true;
            uniqueUsers.push(searchResults[i].Username);
        }
    }

    com.contoso.concierge.addUserIfNeeded = function (username) {
        var idx = uniqueUsers.findIndex(function (n) { return n == username; });
        if (idx < 0) {
            uniqueUsers.push(username);
        }
    }

    com.contoso.concierge.getAvatarColor = function (username) {
        var color = '55C1E7';
        var idx = uniqueUsers.findIndex(function (n) { return n == username; });
        return avatarColors[idx % 4];
    }

});