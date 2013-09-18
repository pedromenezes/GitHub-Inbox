var GitHubNotifications = (function(){

  var settings = new Store("settings", {
    "show-badge-even-with-zero-messages": true,
    "interval": 90000
  });

  function extractUnreadNotifications(response) {
    var unreadMessages = parseInt(response.match(/<span class="count">([^<]+)</)[1]);
    
    return unreadMessages;
  }

  return {
    YELLOW: [255, 223, 1, 255],
    BLUE: [0, 128, 255, 255],
    NOTIFICATION_URL: 'https://github.com/notifications',

    init: function(){
      GitHubNotifications.checkNotifications();
      GitHubNotifications.checkNotificationsAfterTimeout();

      chrome.browserAction.onClicked.addListener(function() {
        window.open(GitHubNotifications.NOTIFICATION_URL);
      });
    },

    checkNotificationsAfterTimeout: function(){
      GitHubNotifications.INTERVAL_BETWEEN_CHECK_NOTIFICATIONS = settings.get("interval");

      window.setTimeout(
        function(){
          GitHubNotifications.checkNotifications();
          GitHubNotifications.checkNotificationsAfterTimeout();
        },
        GitHubNotifications.INTERVAL_BETWEEN_CHECK_NOTIFICATIONS
      );
    },

    checkNotifications: function() {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", GitHubNotifications.NOTIFICATION_URL, true);

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          var response = xhr.response;

          // not logged in
          if (response.match(/<body class="logged_out/)) {
            chrome.browserAction.setBadgeBackgroundColor({color: GitHubNotifications.YELLOW});
            chrome.browserAction.setBadgeText({text: '!'});
            chrome.browserAction.setTitle({title: "You should login on GitHub :)"});
            return;
          }

          // logged in
          var unreadNotifications = extractUnreadNotifications(response) + "";

          chrome.browserAction.setBadgeBackgroundColor({color: GitHubNotifications.BLUE});

          if (settings.get("show-badge-even-with-zero-messages")) {
            chrome.browserAction.setBadgeText({text: unreadNotifications});
          } else {
            if (unreadNotifications) {
              chrome.browserAction.setBadgeText({text: unreadNotifications});
            } else {
              chrome.browserAction.setBadgeText({text: ''});
            }
          }

          var notificationsInflection = (unreadNotifications == 1 ?
              'notification' : 'notifications');

          var title = unreadNotifications + " unread " + notificationsInflection;
          chrome.browserAction.setTitle({title: title});
        }
      }
      xhr.send(null);
    }
  };

})();

GitHubNotifications.init();