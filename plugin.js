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

            function AceCtrl($scope) {
                // The modes
                  $scope.modes = ['Scheme', 'XML', 'Javascript'];
                  $scope.mode = $scope.modes[0];
                 
                 
                  // The ui-ace option
                  $scope.aceOption = {
                    mode: $scope.mode.toLowerCase(),
                    onLoad: function (_ace) {
                 
                      // HACK to have the ace instance in the scope...
                      $scope.modeChanged = function () {
                        _ace.getSession().setMode("ace/mode/" + $scope.mode.toLowerCase());
                      };
                 
                    }
                  };
                 
                  // Initial code content...
                  $scope.aceModel = ';; Scheme code in here.\n' +
                    '(define (double x)\n\t(* x x))\n\n\n' +
                    '<!-- XML code in here. -->\n' +
                    '<root>\n\t<foo>\n\t</foo>\n\t<bar/>\n</root>\n\n\n' +
                    '// Javascript code in here.\n' +
                    'function foo(msg) {\n\tvar r = Math.random();\n\treturn "" + r + " : " + msg;\n}';
                 
                }

            $scope.options = {
                queryStatus: '',
                message: null,
                executing: false,
                resultQuery: '',
                projectMessage: '',
                projectStatus: '',
                projectQuery: '',
                gitStatusMessage: '',
                gitStatusStatus: '',
                gitStatusQuery: '',
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


            $scope.pullPlanOptions = {
                Branch: "master",
                Force: true,
                Username: "",
                Password: "",
                ExecutionMode: "SingleCommit"
            }

            $scope.pushPlanID = null;
            $scope.hasPushPlanID = false;
            $scope.pullPlanID = null;
            $scope.hasPullPlanID = false;
            $scope.gitInitialized = false;
            $scope.tm1project = "";


            $http.get(encodeURIComponent($scope.instance) + "/Configuration/ProductVersion/$value?$format=text/plain").then(function (value) {
                $scope.productVersion = value.data;
            });

            $http.get(encodeURIComponent($scope.instance) + "/ActiveUser/FriendlyName/$value?$format=text/plain").then(function (value) {
                $scope.activeUser = value.data;
                $scope.activeUserEmail = $scope.activeUser + "@amazon.com"
            });

            $http.get(encodeURIComponent($scope.instance) + "/!tm1project").then(function (value) {
                $scope.tm1Project = JSON.stringify(value.data, null, '\t');
                console.log($scope.tm1Project);
            });

			// $scope.getTm1Project = function (tm1project) {
            //     $http.get(encodeURIComponent($scope.instance) + "/!tm1project").then(function (value) {
            //         $scope.tm1Project = JSON.stringify(value.data, null, '\t');
            //         console.log($scope.tm1Project);
            //     });
            // }
    
            $scope.getTm1Project = function (tm1project) {
                var restApiQuery = "/!tm1project";
                var sendDate = (new Date()).getTime();
                $tm1.get($scope.instance, restApiQuery).then(function (result) {
                    $scope.currentTabIndex = 1;
                    if (result.status == 200 || result.status == 201 || result.status == 204) {
                        $scope.options.projectStatus = 'success';
                        $scope.options.projectQuery =JSON.stringify(result.data, null, '\t');
                    } else {
                        $scope.options.projectStatus = 'failed';
                        $scope.options.projectQuery = result.data.error;
                        $scope.options.projectMessage = result.data.error.message;
                    }
                    var receiveDate = (new Date()).getTime();
                    $scope.options.responseTimeMs = receiveDate - sendDate;                    
                    $scope.options.executing = false;
                });
            }

            $scope.putTm1Project = function () {
                var restApiQuery = "/!tm1project";
                var sendDate = (new Date()).getTime();
                var editor = ace.edit("editor");
                var code = editor.getValue();
                $scope.options.executing = true;
                $tm1.put($scope.instance, restApiQuery, code).then(function (result) {
                    $scope.currentTabIndex = 1;
                    if (result.status == 200 || result.status == 201 || result.status == 204) {
                        $scope.options.queryStatus = 'success';
                        $scope.options.resultQuery = result.data;
                    } else {
                        $scope.options.queryStatus = 'failed';
                        $scope.options.resultQuery = result.data.error;
                        $scope.options.message = result.data.error.message;
                    }
                    var receiveDate = (new Date()).getTime();
                    $scope.options.responseTimeMs = receiveDate - sendDate;
                    console.log($scope.options.responseTimeMs);
                    $scope.options.executing = false;
                });
            }
			
            $scope.gitStatus = function (user, pw) {
                var restApiQuery = "/GitStatus";
                var sendDate = (new Date()).getTime();
                $tm1.post($scope.instance, restApiQuery, {Username: user, Password: pw}).then(function (result) {                
                    $scope.currentTabIndex = 1;
                    if (result.status == 200 || result.status == 201 || result.status == 204) {
                        $scope.options.gitStatusStatus = 'success';
                        $scope.options.gitStatusQuery = result.data;
                        $scope.options.gitStatusMessage = '';
                    } else {
                        $scope.options.gitStatusStatus = 'failed';
                        $scope.options.gitStatusQuery = result.data.error;
                        $scope.options.gitStatusMessage = result.data.error.message;
                    }
                    var receiveDate = (new Date()).getTime();
                    $scope.options.responseTimeMs = receiveDate - sendDate;
                    console.log($scope.options.responseTimeMs);
                    $scope.options.executing = false;
                });
            }

            $scope.gitInit = function (url, user, pw, dep, force) {
                $scope.initOptions.URL = url;
                $scope.initOptions.Password = pw;
                $scope.initOptions.Username = user;
                $scope.initOptions.Deployment = dep;
                $scope.initOptions.Force = (force == true);
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
                $scope.pushPlanOptions.Password = password;
                $scope.pushPlanOptions.Username = username;
                $scope.pushPlanOptions.Author = $scope.activeUser;
                $scope.pushPlanOptions.Email = $scope.activeUserEmail;
                $scope.pushPlanOptions.Branch = branch;
                $scope.pushPlanOptions.Message = message;
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

            $scope.gitPullPlan = function (branch, username, password, executionMode, force) {
                $scope.pullPlanOptions.Password = password;
                $scope.pullPlanOptions.Username = username;
                $scope.pullPlanOptions.Branch = branch;
                $scope.pullPlanOptions.ExecutionMode = executionMode;
                $scope.pullPlanOptions.Force = (force == true);
                console.log($scope.pullPlanOptions);
                $scope.options.executing = true;
                var restApiQuery = "/GitPull";
                var sendDate = (new Date()).getTime();
                $tm1.post($scope.instance, restApiQuery, $scope.pullPlanOptions).then(function (result) {
                    $scope.currentTabIndex = 0;
                    if (result.status == 200 || result.status == 201 || result.status == 204) {
                        $scope.options.queryStatus = 'success';
                        $scope.options.resultQuery = result.data;
                        $scope.pullPlanID = $scope.options.resultQuery.ID;
                        $scope.hasPullPlanID = true;
                        $scope.options.message = null;
                    } else {
                        $scope.options.queryStatus = 'failed';
                        $scope.options.resultQuery = result.data.error;
                        $scope.options.message = result.data.error.message;
                        $scope.hasPullPlanID = false;
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

            $scope.gitExPullPlan = function () {
                $scope.options.executing = true;
                var restApiQuery = "/GitPlans('" + $scope.pullPlanID + "')/tm1.Execute";
                var sendDate = (new Date()).getTime();
                $tm1.post($scope.instance, restApiQuery, "{}").then(function (result) {
                    $scope.currentTabIndex = 0;
                    if (result.status == 200 || result.status == 201 || result.status == 204) {
                        $scope.options.queryStatus = 'success';
                        $scope.options.resultQuery = result.data;
                        $scope.pushPlanID = $scope.options.resultQuery.ID;
                        $scope.options.message = null;
                        $scope.hasPullPlanID = false;
                    } else {
                        $scope.options.queryStatus = 'failed';
                        $scope.options.resultQuery = result.data.error;
                        $scope.options.message = result.data.error.message;
                        $scope.hasPullPlanID = false;
                    }
                    var receiveDate = (new Date()).getTime();
                    $scope.options.responseTimeMs = receiveDate - sendDate;
                    $scope.options.executing = false;
                    $scope.hasPullPlanID = false;
                });
            }

            $scope.$on("login-reload", function (event, args) {

            });

            $scope.$on("close-tab", function (event, args) {
                // Event to capture when a user has clicked close on the tab
                if (args.page == "arcGit" && args.instance == $scope.instance && args.name == null) {
                    // The page matches this one so close it
                    $rootScope.close(args.page, {instance: $scope.instance});
                }
            });

            $scope.$on("$destroy", function (event) {

            });


        }]
    };
});