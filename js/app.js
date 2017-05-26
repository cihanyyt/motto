
var app = angular.module('myApp', ['onsen']);

// Run

app.run(function () {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

// Config

app.config( function ($httpProvider) {
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

// Service

app.service('VideosService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {

  var service = this;

  var youtube = {
    ready: false,
    player: null,
    playerId: null,
    videoId: null,
    videoTitle: null,
    playerHeight: '100%',
    playerWidth: '100%',
    state: 'stopped'
  };
  var results = [];
  var history = [];

  $window.onYouTubeIframeAPIReady = function () {
    $log.info('Youtube API is ready');
    youtube.ready = true;
    service.bindPlayer('placeholder');
    service.loadPlayer();
    $rootScope.$apply();
  };

  this.getElapsed = function(publishedAt){

      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();

      if(dd < 10) {
          dd='0'+ dd
      }
      if(mm < 10) {
          mm='0'+ mm
      }

      //today = mm+'/'+dd+'/'+yyyy;

      var publishedYear = publishedAt.toString().slice(0,4);
      var publishedMonth = publishedAt.toString().slice(5,7);
      var publishedDay = publishedAt.toString().slice(8,10);

      var asd = publishedYear.toString() + " " + publishedMonth.toString() + " " + publishedDay.toString();

      var elapsedYear = yyyy - publishedYear;
      var elapsedMonth = mm - publishedMonth;
      var elapsedDay = dd - publishedDay;


      if (elapsedYear > 0)
      {
          if (elapsedYear == 1)
              asd = "last year";
          else
              asd = elapsedYear + " years ago"
      }
      else if (mm - publishedMonth>0)
      {
          if (elapsedMonth == 1)
              asd = "last month";
          else
              asd = elapsedMonth + " months ago"
      }
      else if (dd - publishedDay > 0)
      {
          if (elapsedDay == 1)
              asd = "yesterday";
          else
              asd = elapsedDay + " days ago"
      }
      else
      {
          asd = "some hours ago"
      }

      return asd;
  }

  this.bindPlayer = function (elementId) {
    $log.info('Binding to ' + elementId);
    youtube.playerId = elementId;
  };

  this.createPlayer = function () {
    $log.info('Creating a new Youtube player for DOM id ' + youtube.playerId + ' and video ' + youtube.videoId);
    return new YT.Player(youtube.playerId, {
      height: youtube.playerHeight,
      width: youtube.playerWidth,
      playerVars: {
        rel: 0,
        showinfo: 0
      }
    });
  };

  this.loadPlayer = function () {
    if (youtube.ready && youtube.playerId) {
      if (youtube.player) {
        youtube.player.destroy();
      }
      youtube.player = service.createPlayer();
    }
  };

  this.launchPlayer = function (id, title) {
    youtube.player.loadVideoById(id);
    youtube.videoId = id;
    youtube.videoTitle = title;
    return youtube;
  }

  this.listResults = function (data, append) {
    if (!append) {
      results.length = 0;
    }
    for (var i = 0 ; i < data.items.length; i++) {
        if(data.items[i].kind == "youtube#searchResult" ) {
            if(data.items[i].id.kind == "youtube#video" ) {

                results.push({
                    id: data.items[i].id.videoId,
                    title: data.items[i].snippet.title,
                    description: data.items[i].snippet.description,
                    publishedAt: this.getElapsed(data.items[i].snippet.publishedAt),
                    thumbnail: data.items[i].snippet.thumbnails.medium.url,
                    author: data.items[i].snippet.channelTitle
                });
            }
        }
        else if(data.items[i].kind == "youtube#playlistItem"){
            results.push({
                id: data.items[i].contentDetails.videoId,
                title: data.items[i].snippet.title,
                description: data.items[i].snippet.description,
                publishedAt: this.getElapsed(data.items[i].snippet.publishedAt),
                thumbnail: data.items[i].snippet.thumbnails.medium.url,
                author: data.items[i].snippet.channelTitle
            });
        }
        else if(data.items[i].kind == "youtube#playlist"){
            results.push({
                id: data.items[i].contentDetails.videoId,
                title: data.items[i].snippet.title,
                description: data.items[i].snippet.description,
                publishedAt: this.getElapsed(data.items[i].snippet.publishedAt),
                thumbnail: data.items[i].snippet.thumbnails.medium.url,
                author: data.items[i].snippet.channelTitle
            });
        }

    }
    return results;
  }

  this.archiveVideo = function (video) {
    history.unshift(video);
    return history;
  };

  this.getYoutube = function () {
    return youtube;
  };

  this.getResults = function () {
    return results;
  };

  this.getHistory = function () {
    return history;
  };
}]);
