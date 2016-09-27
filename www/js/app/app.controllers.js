angular.module('your_app_name.app.controllers', [])

.controller('ProfileCtrl', function($scope, $ionicHistory, $state, $ionicScrollDelegate, loggedUser, user, followers, following, posts, pictures) {
  $scope.$on('$ionicView.afterEnter', function() {
    $ionicScrollDelegate.$getByHandle('profile-scroll').resize();
  });

  $scope.currentUserId = user.id;
  $scope.user = user;

  //is this the profile of the logged user?
  $scope.myProfile = loggedUser.id == user.id;

  $scope.user.followers = followers;
  $scope.user.following = following;
  $scope.user.posts = posts;
  $scope.user.pictures = pictures;

  $scope.getUserPics = function(){
    //we need to do this in order to prevent the back to change
    $ionicHistory.currentView($ionicHistory.backView());
    $ionicHistory.nextViewOptions({ disableAnimate: true });
    $state.go('app.profile.pics', {userId: user.id});
  };

  $scope.getUserPosts = function(){
    //we need to do this in order to prevent the back to change
    $ionicHistory.currentView($ionicHistory.backView());
    $ionicHistory.nextViewOptions({ disableAnimate: true });
    $state.go('app.profile.posts', {userId: user.id});
  };
})

.controller('ProfileConnectionsCtrl', function($scope) {

})

.controller('CommentsCtrl', function($scope, $state, $ionicPopup, FeedService) {
  var commentsPopup = {};

  $scope.showComments = function(post) {
    FeedService.getPostComments(post)
    .then(function(data){
      post.comments_list = data;
      commentsPopup = $ionicPopup.show({
        cssClass: 'popup-outer comments-view',
        templateUrl: 'views/app/partials/comments.html',
        scope: angular.extend($scope, {current_post: post}),
        title: post.comments+' Comments',
        buttons: [
          { text: '', type: 'close-popup ion-ios-close-outline' }
        ]
      });
    });
  };

  //CLICK IN USER NAME
  $scope.navigateToUserProfile = function(user){
    commentsPopup.close();
    $state.go('app.profile.posts', {userId: user.id});
  };
})

.controller('NewPostCtrl', function($scope, $ionicModal, $ionicLoading, $timeout, $cordovaImagePicker, $ionicPlatform, GooglePlacesService) {
  $scope.status_post = {
    audience: 'public',
    text: '',
    images: [],
    location: ''
  };

  $ionicModal.fromTemplateUrl('views/app/partials/new_status_post.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.new_status_post_modal = modal;
  });

  $ionicModal.fromTemplateUrl('views/app/partials/checkin_status_post.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.checkin_status_post_modal = modal;
  });

  $scope.newStatusPost = function() {
    $scope.new_status_post_modal.show();
  };

  $scope.newImageStatusPost = function() {
    $scope.new_status_post_modal.show();
    $scope.openImagePicker();
  };

  $scope.openImagePicker = function(){
    //We use image picker plugin: http://ngcordova.com/docs/plugins/imagePicker/
    //implemented for iOS and Android 4.0 and above.

    $ionicPlatform.ready(function() {
      $cordovaImagePicker.getPictures()
       .then(function (results) {
          for (var i = 0; i < results.length; i++) {
            console.log('Image URI: ' + results[i]);
            $scope.status_post.images.push(results[i]);
          }
        }, function(error) {
          // error getting photos
        });
    });
  }

  $scope.removeImage = function(image) {
  	$scope.status_post.images = _.without($scope.status_post.images, image);
  };

  $scope.closeStatusPost = function() {
    $scope.new_status_post_modal.hide();
  };

  $scope.closeCheckInModal = function() {
    $scope.predictions = [];
    $scope.checkin_status_post_modal.hide();
  };

  $scope.checkinStatusPost = function(){
    $scope.new_status_post_modal.hide();
    $scope.checkin_status_post_modal.show();
    $scope.search = { input: '' };
  };

  $scope.getPlacePredictions = function(query){
    if(query !== "")
    {
      GooglePlacesService.getPlacePredictions(query)
      .then(function(predictions){
        $scope.predictions = predictions;
      });
    }else{
      $scope.predictions = [];
    }
  };

  $scope.selectSearchResult = function(result){
    $scope.search.input = result.description;
    $scope.predictions = [];
    $scope.closeCheckInModal();

    $scope.new_status_post_modal.show();
    $scope.status_post.location = result.terms[0].value;

  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.new_status_post_modal.remove();
  });

  $scope.postStatus = function() {
    $ionicLoading.show({
      template: 'Posting ...'
    });
    console.log('Posting status', $scope.status_post);

    // Simulate a posting delay. Remove this and replace with your posting code
    $timeout(function() {
      $ionicLoading.hide();
      $scope.closeStatusPost();
    }, 1000);
  };
})

.controller('CategoryFeedCtrl', function($scope, _, FeedService, $stateParams, loggedUser, feed, category) {
  $scope.loggedUser = loggedUser;
  $scope.cards = feed.posts;
  $scope.current_category = category;

  $scope.page = 1;// Default page is 1
  $scope.totalPages = feed.totalPages;

  // Check if we are loading posts from one category or trend
  var categoryId = $stateParams.categoryId;

  $scope.is_category_feed = true;

  $scope.getNewData = function() {
    // Do something to load your new data here
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.loadMoreData = function(){
    $scope.page += 1;

    console.log("Get categories feed");
    // get category feed
    FeedService.getFeedByCategory($scope.page, categoryId)
    .then(function(data){
      //We will update this value in every request because new posts can be created
      $scope.totalPages = data.totalPages;
      $scope.cards = $scope.cards.concat(data.posts);

      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.moreDataCanBeLoaded = function(){
    return $scope.totalPages > $scope.page;
  };
})

.controller('TrendFeedCtrl', function($scope, _, FeedService, $stateParams, loggedUser, feed, trend) {
  $scope.loggedUser = loggedUser;
  $scope.cards = feed.posts;
  $scope.current_trend = trend;

  $scope.page = 1;// Default page is 1
  $scope.totalPages = feed.totalPages;

  // Check if we are loading posts from one category or trend
  var trendId = $stateParams.trendId;

  $scope.is_trend_feed = true;

  $scope.getNewData = function() {
    // Do something to load your new data here
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.loadMoreData = function(){
    $scope.page += 1;

    console.log("Get trends feed");
    // get trend feed
    FeedService.getFeedByTrend($scope.page, trendId)
    .then(function(data){
      //We will update this value in every request because new posts can be created
      $scope.totalPages = data.totalPages;
      $scope.cards = $scope.cards.concat(data.posts);

      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.moreDataCanBeLoaded = function(){
    return $scope.totalPages > $scope.page;
  };
})

.controller('FeedCtrl', function($scope, _, FeedService, $stateParams, loggedUser, feed) {
  $scope.loggedUser = loggedUser;
  $scope.cards = feed.posts;
  $scope.page = 1;// Default page is 1
  $scope.totalPages = feed.totalPages;

  $scope.is_category_feed = false;
  $scope.is_trend_feed = false;

  $scope.getNewData = function() {
    // Do something to load your new data here
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.loadMoreData = function(){
    $scope.page += 1;

    // get generic feed
    FeedService.getFeed($scope.page)
    .then(function(data){
      //We will update this value in every request because new posts can be created
      $scope.totalPages = data.totalPages;
      $scope.cards = $scope.cards.concat(data.posts);

      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.moreDataCanBeLoaded = function(){
    return $scope.totalPages > $scope.page;
  };
})

.controller('PeopleCtrl', function($scope, people_suggestions, people_you_may_know) {
  $scope.people_suggestions = people_suggestions;
  $scope.people_you_may_know = people_you_may_know;
})

.controller('BrowseCtrl', function($scope, trends, categories) {
  $scope.trends = trends;
  $scope.categories = categories;
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, AuthService) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('views/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('EmailComposerCtrl', function($scope, $cordovaEmailComposer, $ionicPlatform) {
  //we use email composer cordova plugin, see the documentation for mor options: http://ngcordova.com/docs/plugins/emailComposer/
  $scope.sendMail = function(){
    $ionicPlatform.ready(function() {
      $cordovaEmailComposer.isAvailable().then(function() {
        // is available
        console.log("Is available");
        $cordovaEmailComposer.open({
          to: 'hi@startapplabs.com',
          subject: 'Nice Theme!',
          body: 'How are you? Nice greetings from Social App'
        }).then(null, function () {
          // user cancelled email
        });
      }, function () {
        // not available
        console.log("Not available");
      });
    });
  };
})

.controller('SettingsCtrl', function($scope, $ionicModal) {
  $ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.terms_of_service_modal = modal;
  });

  $ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.privacy_policy_modal = modal;
  });

  $scope.showTerms = function() {
    $scope.terms_of_service_modal.show();
  };

  $scope.showPrivacyPolicy = function() {
    $scope.privacy_policy_modal.show();
  };
})

.controller('AppRateCtrl', function($scope) {
	$scope.appRate = function(){
		if(ionic.Platform.isIOS()){
			//you need to set your own ios app id
			AppRate.preferences.storeAppURL.ios = '1234555553>';
			AppRate.promptForRating(true);
		}else if(ionic.Platform.isAndroid()){
			//you need to set your own android app id
			AppRate.preferences.storeAppURL.android = 'market://details?id=ionTheme3';
			AppRate.promptForRating(true);
		}
	};
})

.controller('PostDetailsCtrl', function($scope, post, FeedService, $ionicPopup) {
  $scope.post = post;
})

;
