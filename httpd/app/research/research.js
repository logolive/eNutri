(function (angular) {
    "use strict";

    var app = angular.module('eNutri.research', ['backend.utils', 'ngRoute', 'ngMaterial','md.data.table']);

    app.controller('ResearchCtrl', ['$scope', 'BEutil', '$location',
        function($scope, BEutil, $location) {

            $scope.showContent=false;
            var foodsList = null;
            var refConfig = null;

            BEutil.BEWait(true,false,true).then(() => $scope.$evalAsync(runMenu));

            function runMenu()
            {
                console.debug(BEutil.signed_in);
                if(BEutil.BEAllUsers!=null) $scope.showContent=true;
                else $location.path('/login');

                //console.debug(BEutil.BEAllUsers[0].get("screening").get("education"));
                $scope.loggedIn=true;

                refConfig = BEutil.BEConfig;

                foodsList = refConfig.get('foodsList');

                $scope.nutrients = refConfig.get('nutrientsList');
                $scope.nutrientsList = Object.keys($scope.nutrients[0]);
    
                $scope.users = BEutil.BEAllUsers;

                $scope.reportsList = [];
                $scope.surveyList = [];
                $scope.feedbackList = [];
                for(var user of $scope.users)
                {
                    console.debug(user);
                    var userID = user.get('objectId');
                    $scope.reportsList.push([userID,user.get('report1'),user.get('report2'),user.get('report3')]);
                    if(user.get('state').get('surveyComplete'))
                        $scope.surveyList.push([userID,user.get('survey')]);
                    if(user.get('state').get('feedbackComplete'))
                        $scope.feedbackList.push([userID,user.get('feedback')]);
                }
                console.debug($scope.reportsList[0][1].get('ffqId'));

                $scope.exportFFQInfo = exportFFQInfo;

                generateFFQInfo();
            }

            function generateFFQInfo(){

                var countUsersOneCompletedFFQ = 0;
                var countUsersTwoCompletedFFQ = 0;
                var countUsersThreeCompletedFFQ = 0;
                var countUsersCompletedScreening = 0;
                var countUsersAcceptedScreening = 0;
                var countUsersWaitingEligibility = 0;

                $scope.countUsersOneCompletedFFQ = countUsersOneCompletedFFQ;
                $scope.countUsersTwoCompletedFFQ = countUsersTwoCompletedFFQ;
                $scope.countUsersThreeCompletedFFQ = countUsersThreeCompletedFFQ;
                $scope.countUsersCompletedScreening = countUsersCompletedScreening;
                $scope.countUsersAcceptedScreening = countUsersAcceptedScreening;
                $scope.countUsersWaitingEligibility = countUsersWaitingEligibility;

                var ffqHeader = ["currentWeight","preFFQComplete","preFFQDate","preFFQTimestamp","lastFoodItem","FFQComplete","FFQCompletionDate","FFQStartTimestamp","FFQCompletionTimestamp",
                    "mostLikelyBrowser", "screenWidth","screenAvailWidth","screenHeight","screenAvailHeight","userAgent", "appName", "appCodeName","appVersion","platform","product","language","vendor"];
                var usersFfqCSV = ffqHeader + '\r\n';

                for (var user of $scope.users) {
                    var userID = user.get('objectId');

                    if (user.get('state').get('screeningComplete')){
                        $scope.countUsersCompletedScreening += 1;
                        $scope.countUsersCompletedScreening = countUsersCompletedScreening;
                    }
                    if (user.get('state').get('screeningAccepted')){
                        $scope.countUsersAcceptedScreening += 1;
                        $scope.countUsersAcceptedScreening = countUsersAcceptedScreening;
                    }

                    if (user.get('group') == "waiting"){
                        $scope.countUsersWaitingEligibility += 1;
                        $scope.countUsersWaitingEligibility = countUsersWaitingEligibility;
                    }

                    var countUserCompletedFFQ = 0;
                    var i=0;
                    var j=0;
                    for (i = 1; i <= 3; i++) {
                        var userFfqArray = [userID];
                        for (j=1;j<ffqHeader.length;j++){
                            var item = user.get('ffq'+i).get(ffqHeader[j]);
                            // Replace comma in existing items for not breaking the CSV file
                            if (item != null){
                                item = item.toString().replace(/,/g, " ");
                            }
                            userFfqArray.push(item);
                        }
                        if (user.get('ffq'+i).get('FFQComplete')){
                            countUserCompletedFFQ += 1;
                        }
                        usersFfqCSV += userFfqArray + '\r\n';
                    }

                    switch (countUserCompletedFFQ) {
                        case 1:
                            countUsersOneCompletedFFQ += 1;
                            $scope.countUsersOneCompletedFFQ = countUsersOneCompletedFFQ;
                            break;
                        case 2:
                            countUsersTwoCompletedFFQ += 1;
                            $scope.countUsersTwoCompletedFFQ = countUsersTwoCompletedFFQ;
                            break;
                        case 3:
                            countUsersThreeCompletedFFQ += 1;
                            $scope.countUsersThreeCompletedFFQ = countUsersThreeCompletedFFQ;
                            break;
                    }
                }

                return usersFfqCSV;
            }

            $scope.redefineParticipantGroup = function (user){
                var groups = ["control", "web"];
                var randomizer = Math.floor(Math.random() * groups.length);
                user.set('group',groups[randomizer]);
                user.set('report',groups[randomizer]);
                user.get('state').set('screeningAccepted',true);
                user.save();
            };

            $scope.rejectParticipant = function (user){
                user.set('group','rejected');
                user.get('state').set('screeningAccepted',false);
                user.save();
            };

            function exportFFQInfo () {
                var usersFfqCSV = generateFFQInfo();
                var uri = 'data:text/csv;charset=utf-8,' + escape(usersFfqCSV);
                window.open(uri);
            }

            $scope.exportFFQResults = function() {
                var ffqHeader = ["userID","FfqID","lastFoodItem","FFQCompletionDate"];
                for (var repeat=1; repeat<=3 ;repeat++){
                    for (var j=0;j<foodsList.length;j++){
                        ffqHeader.push(j);
                    }
                }

                var ffqCSV = ffqHeader + '\r\n';

                for(var user of $scope.users){
                    
                    var userID = user.get('objectId');
                    var ffqCount = 3;
                    var i = 0;
                    var j = 0;
                    for (i = 1; i <= ffqCount; i++) {
                        // Only complete FFQs
                        if(!user.get('ffq'+i).get('FFQComplete')) continue;
                        var ffqArray = [userID,  i,user.get('ffq'+i).get('lastFoodItem'),user.get('ffq'+i).get('FFQCompletionDate')];
                        for (j = 0; j < foodsList.length; j++) {
                            var frequency = user.get('ffq'+i).get('results')[j]['freq'];
                            ffqArray.push(frequency);
                        }
                        for (j = 0; j < foodsList.length; j++) {
                            var portion = user.get('ffq'+i).get('results')[j]['portion'];
                            ffqArray.push(portion);
                        }
                        for (j = 0; j < foodsList.length; j++) {
                            var portion = user.get('ffq'+i).get('results')[j]['timestamp'];
                            ffqArray.push(portion);
                        }
                        ffqCSV += ffqArray + '\r\n';
                    }
                }

                var uri = 'data:text/csv;charset=utf-8,' + escape(ffqCSV);
                window.open(uri);
            }

        }
    ]);




    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/research', {
            templateUrl: 'research/research.html',
            controller: 'ResearchCtrl'
        })
    }]);

})(angular);
