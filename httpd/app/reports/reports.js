(function (angular) {
    "use strict";

    var app = angular.module('eNutri.reports', ['backend.utils', 'ngRoute', 'ngMaterial','md.data.table','nvd3','nvd3ChartDirectives']);

    app.controller('ReportsCtrl', ['$scope', 'BEutil', '$location', '$mdSidenav', '$mdBottomSheet','$mdToast','$mdDialog',
        function($scope, BEutil, $location, $mdSidenav, $mdBottomSheet, $mdToast, $mdDialog) {
            
            $scope.MessagesList;
            $scope.FoodsList;
            $scope.refConfig;

            var refUser;
            
            // Hide everything until the user profile is loaded
            $scope.showContent=false;
            BEutil.BEWait(true,true,false).then(() => $scope.$evalAsync(runMenu));

            function runMenu(){
                if(BEutil.signed_in) $scope.showContent=true;
                else $location.path('/home');
                refUser = BEutil.BEUser;
                $scope.refConfig=BEutil.BEConfig;

                $scope.MessagesList = BEutil.BEConfig.get('messagesList');
                $scope.FoodsList = BEutil.BEConfig.get('foodsList');


                $scope.user = refUser;
                $scope.height = refUser.get('screening').get('height');
                $scope.minWeight = ($scope.height/100)*($scope.height/100)*18.5;
                $scope.maxWeight = ($scope.height/100)*($scope.height/100)*25;
                $scope.minWeightStones = kgToStonesLbs($scope.minWeight);
                $scope.maxWeightStones = kgToStonesLbs($scope.maxWeight);

                if (refUser.get('userid')){//TODO
                    $scope.feedbackComplete = true;
                } else{
                    $scope.feedbackComplete = false;
                }

                $scope.numReports = refUser.get('state').get('FFQCompleteCount');
                var i;
                $scope.reports=[];
                for(i=1; i<=$scope.numReports;i++)
                {
                    $scope.reports.push(refUser.get('report'+i));
                }
                $scope.report = refUser.get('report'+$scope.numReports);
                console.debug($scope.report);
                $scope.currentWeight = $scope.report.get('currentWeight');
                $scope.weightUnit = $scope.report.get('weightUnit');
                $scope.currentWeightStones = kgToStonesLbs($scope.currentWeight);
                $scope.baeckeOverall = $scope.report.get('baecke').get('overall')/15*100;
                $scope.baeckeSports = $scope.report.get('baecke').get('sports')/5*100;
                $scope.baeckeLeisure = $scope.report.get('baecke').get('leisure')/5*100;
                $scope.currentBMI =
                    $scope.currentWeight/($scope.height/100*$scope.height/100);
                $scope.weightData = {
                    "title": "kg",
                    "subtitle": "",
                    "ranges": [$scope.minWeight, $scope.maxWeight,$scope.maxWeight*1.5],
                    "measures": [$scope.currentWeight],
                    "markers": [$scope.currentWeight]
                };
                $scope.activityData = {
                    "title": "overall",
                    "subtitle": "score",
                    "ranges": [33,66,100],
                    "measures": [$scope.baeckeOverall],
                    "markers": [$scope.baeckeOverall]
                };
            }

            function kgToStonesLbs(kilos) {
                var kilos = kilos;
                var exact = kilos/6.35029;
                var stones = Math.floor(exact);
                var lbs = Math.floor((exact - stones) * 14);
                stones=stones.toString();
                lbs=lbs.toString();
                var weightStonesString = stones + "st "+ lbs+ "lbs";
                return weightStonesString;

            }


            $scope.getWeightClass = function (currentWeight,language){

                if (currentWeight < $scope.minWeight ){
                    $scope.weightClass = "Underweight";
                    $scope.weightMessage = $scope.MessagesList.underWeight[language];
                    return $scope.MessagesList.underweightName[language];
                } else{
                    if (currentWeight < $scope.maxWeight ){
                        $scope.weightClass = "Healthy Weight";
                        $scope.weightMessage = $scope.MessagesList.healthyWeight[language];
                        return $scope.MessagesList.healthyWeightName[language];
                    } else{
                        if (currentWeight < $scope.maxWeight*30/25 ){
                            $scope.weightClass = "Overweight";
                            $scope.weightMessage = $scope.MessagesList.overWeight[language];
                            return $scope.MessagesList.overweightName[language];
                        } else{
                            if (currentWeight > $scope.maxWeight*30/25 ){
                                $scope.weightClass = "Obese";
                                $scope.weightMessage = $scope.MessagesList.obese[language];
                                return $scope.MessagesList.obeseName[language];
                            }
                        }
                    }
                }
            };

            $scope.arrowUpDown = function(slopeType){
                var slopeType = slopeType;
                if (slopeType=="positive"){
                    return "arrow_upward";
                } else{
                    return "arrow_downward";
                }
            };

            $scope.getSubHeadline = function(slopeType, score, language){
                // Recommended Foods
                if (slopeType == "positive"){
                    if (score<33){
                        return $scope.MessagesList.consumptionVeryLow[language]
                    } else{
                        if(score<66){
                            return $scope.MessagesList.consumptionMedium[language]
                        } else{
                            return $scope.MessagesList.consumptionAdequate[language]
                        }
                    }
                } else{
                    if (score<33){
                        return $scope.MessagesList.consumptionVeryHigh[language]
                    } else{
                        if(score<66){
                            return $scope.MessagesList.consumptionModerate[language]
                        } else{
                            return $scope.MessagesList.consumptionLow[language]
                        }
                    }
                }
            };

            $scope.getSportsMessage = function(sportsScore, language){
                if (sportsScore<33){
                    return $scope.MessagesList.sportsRed[language];
                } else{
                    if(sportsScore<66){
                        return $scope.MessagesList.sportsYellow[language];
                    } else{
                        return $scope.MessagesList.sportsGreen[language];
                    }
                }
            };

            $scope.getLeisureMessage = function(leisureScore, language){
                if (leisureScore<33){
                    return $scope.MessagesList.leisureRed[language];
                } else{
                    if(leisureScore<66){
                        return $scope.MessagesList.leisureYellow[language];
                    } else{
                        return $scope.MessagesList.leisureGreen[language];
                    }
                }
            };

            $scope.showHelp = function(ev,title,content) {
                // Appending dialog to document.body to cover sidenav in docs app
                // Modal dialogs should fully cover application
                // to prevent interaction outside of dialog
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title(title)
                        .textContent(content)
                        .ariaLabel('Alert Dialog')
                        .ok('OK')
                        .targetEvent(ev)
                );
            };

            $scope.showComponentExplanation = function (ev, componentName, componentDescription, componentContributors, FoodsList) {
                $scope.componentName= componentName;
                $scope.componentDescription= componentDescription;
                $scope.componentContributors= componentContributors;
                $scope.foods = FoodsList;
                if (componentContributors){
                    $scope.contributorsExist=true;
                } else{
                    $scope.contributorsExist=false;
                }

                $scope.cancel = function() {
                    $mdDialog.cancel();
                };

                $mdDialog.show({
                    controller: function () { this.parent = $scope; },
                    locals: {parent: $scope},
                    bindToController: true,
                    controllerAs: 'ctrl',
                    templateUrl: 'menu/componentDialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true
                })
            }

            $scope.mostLikelyBrowser = "null";
            if (navigator.userAgent.search("Opera") >= 0) {
                $scope.mostLikelyBrowser = "Opera";
            }
            else if (navigator.userAgent.search("Firefox") >= 0) {
                $scope.mostLikelyBrowser = "Firefox";
            }
            else if (navigator.userAgent.search("Edge") >= 0) {
                $scope.mostLikelyBrowser = "Edge";
            }
            else if (navigator.userAgent.search("MSIE") >= 0) {
                $scope.mostLikelyBrowser = "MSIE";
            }
            else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
                $scope.mostLikelyBrowser = "Safari";
            }
            else if (navigator.userAgent.search("Chrome") >= 0) {
                $scope.mostLikelyBrowser = "Chrome";
            }

        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/reports', {
            templateUrl: 'reports/reports.html',
            controller: 'ReportsCtrl'
        })
    }]);

})(angular);



