
angular.module('myApp')

// Controller

.controller('VideosController', function ($scope, $http, $log, VideosService) {

    init();

    function init() {
      $scope.youtube = VideosService.getYoutube();
      $scope.results = VideosService.getResults();
      $scope.history = VideosService.getHistory();
    }


    $scope.load = function () {
        var xmlhttp = new XMLHttpRequest();
        var url = "js/members.json";

        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 ) {
                $scope.myArr = JSON.parse(this.responseText);
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
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

    $scope.search = function (channelName,isNewQuery) {
      $scope.loading = true;

      $http.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          key: 'AIzaSyDDheDyEodFf3EPUqMw876deYCoqBIFeoU',
          type: 'channel',
          maxResults: '50',
          pageToken: isNewQuery ? '' : $scope.nextPageToken,
          part: 'id, snippet, contentDetails',
          forUsername: channelName
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
                    maxResults: '50',
                    part: 'id,snippet,contentDetails',
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

        $http.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: 'AIzaSyDDheDyEodFf3EPUqMw876deYCoqBIFeoU',
                maxResults: '50',
                pageToken: isNewQuery ? '' : $scope.nextPageToken,
                part: 'id,snippet',
                order: 'date',
                channelId: channelName
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
