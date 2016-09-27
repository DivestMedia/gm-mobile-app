angular.module('underscore', [])
.factory('_', function() {
  return window._; // assumes underscore has already been loaded on the page
});

angular.module('your_app_name', [
  'ionic',
  'your_app_name.common.directives',
  'your_app_name.app.services',
  'your_app_name.app.filters',
  'your_app_name.app.controllers',
  'your_app_name.auth.controllers',
  'your_app_name.views',
  'underscore',
  'angularMoment',
  'ngCordova',
  'monospaced.elastic'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  //SIDE MENU ROUTES
  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "views/app/side-menu.html"
    // controller: 'AppCtrl'
  })

  .state('app.feed', {
    url: "/feed",
    views: {
      'menuContent': {
        templateUrl: "views/app/feed.html",
        controller: "FeedCtrl"
      }
    },
    resolve: {
      loggedUser: function(AuthService){
        return AuthService.getLoggedUser();
      },
      feed: function(FeedService){
        // Default page is 1
        var page = 1;

        return FeedService.getFeed(page);
      }
    }
  })

  .state('app.category_feed', {
    url: "/category_feed/:categoryId",
    views: {
      'menuContent': {
        templateUrl: "views/app/feed.html",
        controller: "CategoryFeedCtrl"
      }
    },
    resolve: {
      loggedUser: function(AuthService){
        return AuthService.getLoggedUser();
      },
      feed: function(FeedService, $stateParams){
        // Default page is 1
        var page = 1;
        return FeedService.getFeedByCategory(page, $stateParams.categoryId);
      },
      category: function(CategoryService, $stateParams){
        return CategoryService.getCategory($stateParams.categoryId);
      }
    }
  })

  .state('app.trend_feed', {
    url: "/trend_feed/:trendId",
    views: {
      'menuContent': {
        templateUrl: "views/app/feed.html",
        controller: "TrendFeedCtrl"
      }
    },
    resolve: {
      loggedUser: function(AuthService){
        return AuthService.getLoggedUser();
      },
      feed: function(FeedService, $stateParams){
        // Default page is 1
        var page = 1;
        return FeedService.getFeedByTrend(page, $stateParams.trendId);
      },
      trend: function(TrendsService, $stateParams){
        return TrendsService.getTrend($stateParams.trendId);
      }
    }
  })

  .state('app.post', {
    url: "/post/:postId",
    views: {
      'menuContent': {
        templateUrl: "views/app/post/details.html",
        controller: 'PostDetailsCtrl'
      }
    },
    resolve: {
      post: function(FeedService, $stateParams){
        return FeedService.getPost($stateParams.postId);
      }
    }
  })

  .state('app.profile', {
    abstract: true,
    url: '/profile/:userId',
    views: {
      'menuContent': {
        templateUrl: "views/app/profile/profile.html",
        controller: 'ProfileCtrl'
      }
    },
    resolve: {
      loggedUser: function(AuthService){
        return AuthService.getLoggedUser();
      },
      user: function(ProfileService, $stateParams){
        var profileUserId = $stateParams.userId;
        return ProfileService.getUserData(profileUserId);
      },
      followers: function(ProfileService, $stateParams){
        var profileUserId = $stateParams.userId;
        return ProfileService.getUserFollowers(profileUserId);
      },
      following: function(ProfileService, $stateParams){
        var profileUserId = $stateParams.userId;
        return ProfileService.getUserFollowing(profileUserId);
      },
      posts: function(ProfileService, $stateParams){
        var profileUserId = $stateParams.userId;
        return ProfileService.getUserPosts(profileUserId);
      },
      pictures: function(ProfileService, $stateParams){
        var profileUserId = $stateParams.userId;
        return ProfileService.getUserPictures(profileUserId);
      }
    }
  })

  .state('app.profile.posts', {
    url: '/posts',
    views: {
      'profileContent': {
        templateUrl: 'views/app/profile/profile.details.html'
      },
      'profileSubContent@app.profile.posts': {
        templateUrl: 'views/app/profile/profile.posts.html'
      }
    }
  })

  .state('app.profile.pics', {
    url: '/pics',
    views: {
      'profileContent': {
        templateUrl: 'views/app/profile/profile.details.html'
      },
      'profileSubContent@app.profile.pics': {
        templateUrl: 'views/app/profile/profile.pics.html'
      }
    }
  })

  .state('app.profile.followers', {
    url: "/followers",
    views: {
      'profileContent': {
        templateUrl: 'views/app/profile/profile.followers.html',
        controller: 'ProfileConnectionsCtrl'
      }
    }
  })

  .state('app.profile.following', {
    url: "/following",
    views: {
      'profileContent': {
        templateUrl: 'views/app/profile/profile.following.html',
        controller: 'ProfileConnectionsCtrl'
      }
    }
  })

  .state('app.browse', {
    url: "/browse",
    views: {
      'menuContent': {
        templateUrl: "views/app/browse.html",
        controller: "BrowseCtrl"
      }
    },
    resolve: {
      trends: function(TrendsService){
        return TrendsService.getTrends();
      },
      categories: function(CategoryService){
        return CategoryService.getCategories();
      }
    }
  })

  .state('app.people', {
    url: "/people",
    views: {
      'menuContent': {
        templateUrl: "views/app/people.html",
        controller: "PeopleCtrl"
      }
    },
    resolve: {
      people_suggestions: function(PeopleService){
        return PeopleService.getPeopleSuggestions();
      },
      people_you_may_know: function(PeopleService){
        return PeopleService.getPeopleYouMayKnow();
      }
    }
  })

  .state('app.settings', {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "views/app/profile/settings.html",
        controller: 'SettingsCtrl'
      }
    }
  })



  //AUTH ROUTES
  .state('facebook-sign-in', {
    url: "/facebook-sign-in",
    templateUrl: "views/auth/facebook-sign-in.html",
    controller: 'WelcomeCtrl'
  })

  .state('dont-have-facebook', {
    url: "/dont-have-facebook",
    templateUrl: "views/auth/dont-have-facebook.html",
    controller: 'WelcomeCtrl'
  })

  .state('create-account', {
    url: "/create-account",
    templateUrl: "views/auth/create-account.html",
    controller: 'CreateAccountCtrl'
  })

  .state('welcome-back', {
    url: "/welcome-back",
    templateUrl: "views/auth/welcome-back.html",
    controller: 'WelcomeBackCtrl'
  })
;



  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/facebook-sign-in');
});
