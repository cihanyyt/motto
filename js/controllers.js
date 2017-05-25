
angular.module('myApp')

// Controller

.controller('VideosController', function ($scope, $http, $log, VideosService) {

    init();

    function init() {
      $scope.youtube = VideosService.getYoutube();
      $scope.results = VideosService.getResults();
      $scope.history = VideosService.getHistory();
    }


    $scope.loadd = function () {
        var xmlhttp = new XMLHttpRequest();
        var url = "js/members.json";

        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 ) {
                $scope.myArr = JSON.parse(this.responseText);
                $scope.getAvatars();
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    };

    $scope.getAvatars = function () {
      var i = 0;
        while($scope.myArr.length > i) {

          if($scope.myArr[i].type == 'user')
          {
            $http.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
              key: 'AIzaSyDDheDyEodFf3EPUqMw876deYCoqBIFeoU',
              type: 'channel',
              maxResults: '30',
              part: 'id, snippet, contentDetails',
              forUsername: $scope.myArr[i].id
            }
          })
          .success( function (data) {
            if (data.items.length === 0) {
              $scope.label = 'No results were found!';
            }
            else {
              for (var i = $scope.myArr.length - 1; i >= 0; i--) {
                if($scope.myArr[i].name == data.items[0].snippet.title)
                    $scope.myArr[i].avatar = data.items[0].snippet.thumbnails.medium.url;
              }
            }
        })
        .error( function () {
          $log.info('Search error');
        })
        .finally( function () {
          $scope.loadMoreButton.stopSpin();
          $scope.loadMoreButton.setDisabled(false);
          $scope.loading = false;
        });
        } else {
           $http.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                key: 'AIzaSyDDheDyEodFf3EPUqMw876deYCoqBIFeoU',
                part: 'id,snippet,contentDetails',
                id: $scope.myArr[i].id
            }
        })
        .success( function (data) {
            if (data.items.length === 0) {
              $scope.label = 'No results were found!';
            }
            else {
              for (var k = $scope.myArr.length - 1; k >= 0; k--) {
                if($scope.myArr[k].name == data.items[0].snippet.title)
                    $scope.myArr[k].avatar = data.items[0].snippet.thumbnails.medium.url;
              }
            }
        })
        .error( function () {
            $log.info('Search error');
        })
        .finally( function () {
            $scope.loadMoreButton.stopSpin();
            $scope.loadMoreButton.setDisabled(false);
            $scope.loading = false;
        });
        }
        i++;
      }

    };

    $scope.reload =function() {
      if($scope.lastChannelType == "channel")
        $scope.searchByChannel($scope.lastChannel,false);
      else
        $scope.search($scope.lastChannel,false);
    }

    $scope.launch = function (video, archive) {
      VideosService.launchPlayer(video.id, video.title);
      if (archive) {
      	VideosService.archiveVideo(video);
      }
      $log.info('Launched id:' + video.id + ' and title:' + video.title);
    };

    $scope.nextPageToken = '';
    $scope.label = 'You haven\'t searched for any video yet!';
    $scope.loading = false;
    $scope.lastChannel = "";
    $scope.lastChannelType = "";

    $scope.search = function (channelName,isNewQuery) {
      $scope.loading = true;
      if(isNewQuery) {
        $scope.lastChannel = channelName;
        $scope.lastChannelType = "user";
      }


      $http.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          key: 'AIzaSyDDheDyEodFf3EPUqMw876deYCoqBIFeoU',
          maxResults: '10',
          pageToken: isNewQuery ? '' : $scope.nextPageToken,
          part: 'contentDetails',
          forUsername: $scope.lastChannel
        }
      })
      .success( function (data) {
        if (data.items.length === 0) {
          $scope.label = 'No results were found!';
        }
        else {
            var item = data.items[0];
            var _playListId = item.contentDetails.relatedPlaylists.uploads;
            $http.get('https://www.googleapis.com/youtube/v3/playlistItems', {
                params: {
                    key: 'AIzaSyDDheDyEodFf3EPUqMw876deYCoqBIFeoU',
                    maxResults: '10',
                    pageToken: isNewQuery ? '' : $scope.nextPageToken,
                    part: 'snippet,contentDetails',
                    order: 'date',
                    playlistId: _playListId
                }
            })
            .success( function (data) {
            if (data.items.length === 0) {
                $scope.label = 'No results were found!';
            }
            VideosService.listResults(data, $scope.nextPageToken && !isNewQuery);
            $scope.nextPageToken = data.nextPageToken;
            $log.info(data);
            })
            .error( function () {
                $log.info('Search error');
            })
            .finally( function () {
                $scope.loadMoreButton.stopSpin();
                $scope.loadMoreButton.setDisabled(false);
                $scope.loading = false;
            });
        }
      })
      .error( function () {
        $log.info('Search error');
      })
      .finally( function () {
        $scope.loadMoreButton.stopSpin();
        $scope.loadMoreButton.setDisabled(false);
        $scope.loading = false;
      });
    };

    $scope.searchByChannel = function (channelName,isNewQuery) {
        $scope.loading = true;
        if(isNewQuery) {
          $scope.lastChannel = channelName;
          $scope.lastChannelType = "channel";
        }

        $http.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: 'AIzaSyDDheDyEodFf3EPUqMw876deYCoqBIFeoU',
                maxResults: '10',
                pageToken: isNewQuery ? '' : $scope.nextPageToken,
                part: 'id,snippet',
                order: 'date',
                channelId: $scope.lastChannel
            }
        })
        .success( function (data) {
            if (data.items.length === 0) {
                $scope.label = 'No results were found!';
            }
            else {
                VideosService.listResults(data, $scope.nextPageToken && !isNewQuery);
                $scope.nextPageToken = data.nextPageToken;
                $log.info(data);
            }
        })
        .error( function () {
            $log.info('Search error');
        })
        .finally( function () {
            $scope.loadMoreButton.stopSpin();
            $scope.loadMoreButton.setDisabled(false);
            $scope.loading = false;
        });
    };


    $scope.playlistByChannel = function (channelName,isNewQuery) {
        $scope.loading = true;
        if(isNewQuery) {
            $scope.lastChannel = channelName;
            $scope.lastChannelType = "channel";
        }

        $http.get('https://www.googleapis.com/youtube/v3/playlistItems', {
            params: {
                key: 'AIzaSyDDheDyEodFf3EPUqMw876deYCoqBIFeoU',
                maxResults: '10',
                pageToken: isNewQuery ? '' : $scope.nextPageToken,
                part: 'snippet, contentDetails',
                order: 'date',
                playlistId: $scope.lastChannel
            }
        })
            .success( function (data) {
                if (data.items.length === 0) {
                    $scope.label = 'No results were found!';
                }
                else {
                    VideosService.listResults(data, $scope.nextPageToken && !isNewQuery);
                    $scope.nextPageToken = data.nextPageToken;
                    $log.info(data);
                }
            })
            .error( function () {
                $log.info('Search error');
            })
            .finally( function () {
                $scope.loadMoreButton.stopSpin();
                $scope.loadMoreButton.setDisabled(false);
                $scope.loading = false;
            });
    };

});
