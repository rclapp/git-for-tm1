
arc.run(['$rootScope', function ($rootScope) {

    $rootScope.plugin("arcGit", "Git for TM1", "page", {
        menu: "tools",
        icon: "fa-github",
        description: "Git for TM1",
        author: "Ryan Clapp",
        url: "https://github.com/cubewise-code/arc-plugins",
        version: "1.0.0"
    });

}]);


arc.directive("arcGit", function () {
   return {
      restrict: "EA",
      replace: true,
      scope: {
         instance: "=tm1Instance"
      },
      templateUrl: "__/plugins/git-for-tm1/template.html",
      link: function ($scope, element, attrs) {

      },
      controller: ["$scope", "$rootScope", "$http", "$tm1", "$translate", "$timeout", function ($scope, $rootScope, $http, $tm1, $translate, $timeout) {

         // Store the active tab index
         $scope.selections = {
            activeTab: 1,
            queryCounter: 0
         };

         $scope.options = {
             queryStatus: '',
             message: null,
             executing: false,
             resultQuery: '',
             resultStatus: '',
             responseTimeMs: 0,
             resultType: "json-tree"
            };


         $scope.initOptions = {
             URL: "https://github.com/tm1models/model.git",
             Deployment: "dev",
             Username: "username",
             Password: "password",
             Force: true
         }

         $scope.pushPlanOptions = {
              Branch: "",
              Force: true,
              Message: "",
              Author: "",
              Email: "",
              Username: "",
              Password: ""
            }

         $scope.pushPlanID = null;
         $scope.hasPushPlanID = false;
         $scope.gitInitialized = false;

         $http.get(encodeURIComponent($scope.instance) + "/Configuration/ProductVersion/$value?$format=text/plain").then(function (value) {
            $scope.productVersion = value.data;
         });

         $http.get(encodeURIComponent($scope.instance) + "/ActiveUser/FriendlyName/$value?$format=text/plain").then(function (value) {
            $scope.activeUser = value.data;
            $scope.activeUserEmail = $scope.activeUser + "@amazon.com"
         });


        $scope.gitInit = function (url,user, pw, dep, force) {
           $scope.initOptions.URL=url;
           $scope.initOptions.Password=pw;
           $scope.initOptions.Username=user;
           $scope.initOptions.Deployment=dep;
           $scope.initOptions.Force = (force == true);
           console.log($scope.initOptions);
           $scope.options.executing = true;
            var restApiQuery = "/GitInit";
            var sendDate = (new Date()).getTime();
            $tm1.post($scope.instance, restApiQuery, $scope.initOptions).then(function (result) {
               $scope.currentTabIndex = 1;
                if (result.status == 200 || result.status == 201 || result.status == 204) {
                    $scope.options.queryStatus = 'success';
                    $scope.options.resultQuery = result.data;
                    $scope.options.message = null;
                    $scope.gitInitialized = true;
                } else {
                    $scope.options.queryStatus = 'failed';
                    $scope.options.resultQuery = result.data.error;
                    $scope.options.message = result.data.error.message;
                    $scope.gitInitialized = false;
                }
                var receiveDate = (new Date()).getTime();
                $scope.options.responseTimeMs = receiveDate - sendDate;
                $scope.options.executing = false;
            });
        }

        $scope.gitUninit = function () {
           $scope.options.executing = true;
            var restApiQuery = "/GitUninit";
            var sendDate = (new Date()).getTime();
            var method = "POST";
            $tm1.async($scope.instance, method, restApiQuery, "{}").then(function (result) {
               $scope.currentTabIndex = 1;
                if (result.status == 200 || result.status == 201 || result.status == 204) {
                    $scope.options.queryStatus = 'success';
                    $scope.options.resultQuery = result.data;
                    $scope.options.message = null;
                    $scope.gitInitialized = false;
                } else {
                    $scope.options.queryStatus = 'failed';
                    $scope.options.resultQuery = result.data.error;
                    $scope.options.message = result.data.error.message;
                }
                var receiveDate = (new Date()).getTime();
                $scope.options.responseTimeMs = receiveDate - sendDate;
                $scope.options.executing = false;
            });
        }

        $scope.gitPushPlan = function (branch, username, password, message, force) {
           $scope.pushPlanOptions.Password=password;
           $scope.pushPlanOptions.Username=username;
           $scope.pushPlanOptions.Author=$scope.activeUser;
           $scope.pushPlanOptions.Email=$scope.activeUserEmail;
           $scope.pushPlanOptions.Branch=branch;
           $scope.pushPlanOptions.Message=message;
           $scope.pushPlanOptions.Force = (force == true);
           console.log($scope.pushPlanOptions);
           $scope.options.executing = true;
            var restApiQuery = "/GitPush";
            var sendDate = (new Date()).getTime();
            $tm1.post($scope.instance, restApiQuery, $scope.pushPlanOptions).then(function (result) {
               $scope.currentTabIndex = 0;
                if (result.status == 200 || result.status == 201 || result.status == 204) {
                    $scope.options.queryStatus = 'success';
                    $scope.options.resultQuery = result.data;
                    $scope.pushPlanID = $scope.options.resultQuery.ID;
                    $scope.hasPushPlanID = true;
                    $scope.options.message = null;
                } else {
                    $scope.options.queryStatus = 'failed';
                    $scope.options.resultQuery = result.data.error;
                    $scope.options.message = result.data.error.message;
                    $scope.hasPushPlanID = false;
                }
                var receiveDate = (new Date()).getTime();
                $scope.options.responseTimeMs = receiveDate - sendDate;
                $scope.options.executing = false;
            });
        }

        $scope.gitExPushPlan = function () {
           $scope.options.executing = true;
            var restApiQuery = "/GitPlans('" + $scope.pushPlanID + "')/tm1.Execute";
            var sendDate = (new Date()).getTime();
            $tm1.post($scope.instance, restApiQuery, "{}").then(function (result) {
               $scope.currentTabIndex = 0;
                if (result.status == 200 || result.status == 201 || result.status == 204) {
                    $scope.options.queryStatus = 'success';
                    $scope.options.resultQuery = result.data;
                    $scope.pushPlanID = $scope.options.resultQuery.ID;
                    $scope.options.message = null;
                    $scope.hasPushPlanID = false;
                } else {
                    $scope.options.queryStatus = 'failed';
                    $scope.options.resultQuery = result.data.error;
                    $scope.options.message = result.data.error.message;
                    $scope.hasPushPlanID = false;
                }
                var receiveDate = (new Date()).getTime();
                $scope.options.responseTimeMs = receiveDate - sendDate;
                $scope.options.executing = false;
                $scope.hasPushPlanID = false;
            });
        }

        $scope.$on("login-reload", function (event, args) {

         });

         $scope.$on("close-tab", function (event, args) {
            // Event to capture when a user has clicked close on the tab
            if (args.page == "arcGit" && args.instance == $scope.instance && args.name == null) {
               // The page matches this one so close it
               $rootScope.close(args.page, { instance: $scope.instance });
            }
         });

         $scope.$on("$destroy", function (event) {

         });


      }]
   };
});