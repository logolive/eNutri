(function (angular) {
    "use strict";

    var app = angular.module('eNutri.admin', ['backend.utils', 'ngRoute', 'ngMaterial','md.data.table']);

    app.controller('AdminCtrl', ['$scope', 'BEutil', '$location', '$timeout',
        function($scope, BEutil, $location, $timeout) {

            $scope.showContent=false;
            $scope.refConfig;

            $scope.errors=[];
            $scope.messages=[];

            $scope.messagesList;
            $scope.foodsList;
            $scope.nutrientsList;
            $scope.userEligibilityList;
            $scope.constantsList;

            $scope.nutrientsPage;
            $scope.nutrientKeys;
            $scope.foodsPage;

            $scope.selectors=[
                "lactose",
                "foodallergy",
                "diabetes",
                "livinguk",
                "consultation",
                "pregnant",
                "vegan",
                "notgoodhealth",
                "methabolicdisorder",
                "illnesses",
                "medication",
                "dietaryreq"
            ];

            $scope.itemsPerPage=10;
            $scope.NutrientsPerPage=10;
            $scope.currentFoodPage=0;
            $scope.nutrientKeyPage=0;
            $scope.numFoodPages=0;
            $scope.numNutrientPages=0;

            BEutil.BEWait(true,false,false).then(() => $scope.$evalAsync(runMenu));

            function runMenu()
            {
                $scope.showContent=true;
                $scope.refConfig = BEutil.BEConfig;
                $scope.resetValues();
            }

            // ---------- ADD/REMOVE ----------

            // To add a food item, we add a new page and repaginate
            $scope.addFood = function() {
                $scope.foodsList.push([{
                    foodname:"",
                    foodexample:"",
                    pSmall:0,
                    pMedium:0,
                    pLarge:0
                }]);
                var nutrientsObj={};
                for(var nutrient of $scope.getNutrients(-1))
                {
                    nutrientsObj[nutrient]=0;
                }
                $scope.nutrientsList.push([nutrientsObj]);
                $scope.foodsList=repaginate($scope.foodsList);
                $scope.nutrientsList=repaginate($scope.nutrientsList);
                recalculatePageNumbers(false);
                $scope.setFoodPage($scope.numFoodPages-1);
            }
            $scope.removeFood = function(index) {
                spliceFix($scope.foodsPage,index);
                spliceFix($scope.nutrientsPage,index);
                $scope.foodsList=repaginate($scope.foodsList);
                $scope.nutrientsList=repaginate($scope.nutrientsList);
                recalculatePageNumbers(false);
                $scope.setFoodPage($scope.currentFoodPage);
            }

            // To add a nutrient, we simply add it to every food item and then update the nutrient keys for the page
            $scope.addNutrient = function(name) {
                for(var page of $scope.nutrientsList)
                {
                    for(var food of page) food[name]=0;
                }
                recalculatePageNumbers(false);
                $scope.setNutrientPage($scope.numNutrientPages-1);
            }
            $scope.removeNutrient = function(name) {
                for(var page of $scope.nutrientsList)
                {
                    for(var food of page) delete food[name];
                }
                recalculatePageNumbers(false);
            }

            $scope.addRule = function() {
                $scope.userEligibilityList.push({
                    type:"unconditional",
                    arguments:[],
                    decision:"accept"
                });
            }
            $scope.removeRule = function(index) {
                spliceFix($scope.userEligibilityList,index);
            }

            $scope.changeRuleCondition = function(index) {
                var rule= $scope.userEligibilityList[index];
                if(rule.type=="unconditional")
                    rule.arguments=[];
                else if(rule.arguments.length==0)
                {
                    rule.arguments=[$scope.selectors[0]];
                }
            }
            $scope.addRuleArgument = function(index) {
                $scope.userEligibilityList[index].arguments.push($scope.selectors[0]);
            }
            $scope.removeRuleArgument = function(ruleIdx,argIdx) {
                spliceFix($scope.userEligibilityList[ruleIdx].arguments,argIdx);
            }

            // ---------- LOAD ----------
            $scope.resetValues = function()
            {
                var refConfig = $scope.refConfig;

                // We need deep copies here to allow for later resets
                $scope.messagesList=deepCopy(refConfig.get('messagesList'));
                $scope.nutrientsList=paginate(deepCopy(refConfig.get('nutrientsList')));
                $scope.foodsList=paginate(deepCopy(refConfig.get('foodsList')));
                $scope.userEligibilityList=deepCopy(refConfig.get('userEligibilityList'));
                $scope.constantsList=deepCopy(refConfig.get('constantsList'));
                recalculatePageNumbers(false);
                //console.debug($scope.numNutrientPages);

            }

            // ---------- SAVE ----------
            $scope.saveValues = async function()
            {
                var refConfig=$scope.refConfig;

                // Again, deep copies
                refConfig.set('messagesList',deepCopy($scope.messagesList));
                refConfig.set('nutrientsList',depaginate(deepCopy($scope.nutrientsList)));
                refConfig.set('foodsList',depaginate(deepCopy($scope.foodsList)));
                refConfig.set('userEligibilityList',deepCopy($scope.userEligibilityList));
                refConfig.set('constantsList',deepCopy($scope.constantsList));

                // Save
                refConfig.save($scope.masterKey).then(
                    result=>result.json().then(
                        js=>(js.result)?$scope.showMessage("Saved successfully",3)
                            :$scope.showError("An error occured while saving: "+angular.toJson(js)),
                        err=>$scope.showError("An error occured while saving: "+angular.toJson(err))),
                    err=>$scope.showError("An error occured while saving: "+angular.toJson(err)));
            }

            // Exports all necessary values to JSON
            $scope.exportValues = function()
            {
                var obj = {
                    messagesList:$scope.messagesList,
                    nutrientsList:depaginate($scope.nutrientsList),
                    foodsList:depaginate($scope.foodsList),
                    userEligibilityList:$scope.userEligibilityList,
                    constantsList:$scope.constantsList
                }
                $scope.exportText=angular.toJson(obj);
            }

            // Imports values from JSON
            $scope.importValues = function()
            {
                try{
                    var obj = JSON.parse($scope.exportText)
                    $scope.messagesList=obj.messagesList;
                    $scope.nutrientsList=paginate(obj.nutrientsList);
                    $scope.userEligibilityList=obj.userEligibilityList;
                    $scope.foodsList=paginate(obj.foodsList);
                    $scope.constantsList=obj.constantsList;
                    recalculatePageNumbers(true);
                    $scope.showMessage("Import sucessful. Do not forget to save",3);
                }
                catch(err) {
                    $scope.showError("Error while parsing import settings: "+err);
                }
            }

            // ---------- HELPER ----------

            function recalculatePageNumbers(reset)
            {
                $scope.setFoodPage(reset?0:$scope.currentFoodPage);
                $scope.setNutrientPage(reset?0:$scope.nutrientKeyPage);
                $scope.numFoodPages=$scope.foodsList.length;
                $scope.numNutrientPages=Math.ceil($scope.getNutrients(-1).length*1.0/$scope.NutrientsPerPage);
            }

            // When splicing arrays, angular gets confused and does not display data correctly.
            // Solution: Force a re-index by removing all the $$hashKey attributes
            // Possible alternative: Track objects by $index instead
            function spliceFix(arr,index) {
                deleteHashKeys(arr);
                arr.splice(index,1);
            }

            function deleteHashKeys(o) {
                if(o instanceof Array) o.map(obj=> {delete obj.$$hashKey});
                else if(o instanceof Object) delete o.$$hashKey;
            }

            // retrieves a list of nutrients, paginated.
            // page==-1 returns all nutrients
            $scope.getNutrients = function(page) {
                var result=($scope.nutrientsList)?Object.keys($scope.nutrientsList[0][0]):[];
                if(result.length==0) result=['kcal'];
                if(page<0) return result;
                return result.slice($scope.NutrientsPerPage*page,$scope.NutrientsPerPage*(page+1));
            }

            // paginates an Array
            function paginate(a) {
                var result=[];
                var page=[];
                var i=0;
                for(var item of a){
                    page.push(item);
                    i++;
                    if(i>=$scope.itemsPerPage){
                        result.push(page);
                        page=[];
                        i=0;
                    }
                }
                if(i>0) result.push(page);
                return result;
            }
            // depaginates an Array
            function depaginate(a) {
                var result=[];
                for(var page of a){
                    result=result.concat(page)
                }
                return result;
            }
            function repaginate(a) {
                var result = paginate(depaginate(a));
                deleteHashKeys(result);
                return result;
            }

            $scope.setFoodPage = function(page) {
                $scope.currentFoodPage=page;
                // shallow references are good enough
                deleteHashKeys($scope.foodsList[page]);
                //console.debug($scope.foodsPage);
                //console.debug("setFoodPage");
                //console.debug($scope.foodsList);
                $scope.foodsPage=$scope.foodsList[page];
                //console.debug($scope.foodsPage);
                $scope.nutrientsPage=$scope.nutrientsList[page];
            }
            $scope.setNutrientPage = function(page) {
                $scope.nutrientKeyPage=page;
                $scope.nutrientKeys=$scope.getNutrients(page);
            }

            $scope.showMessage = function(text,duration) {
                var obj ={
                    text: text
                };
                $scope.$evalAsync($scope.messages.push(obj));
                setTimeout(()=>$scope.$evalAsync(()=>{
                    var index = $scope.messages.indexOf(obj);
                    $scope.messages.splice(index,1);
                }), duration*1000)
            }
            $scope.showError = function(text) {
                var obj ={
                    text: text
                };
                $scope.$evalAsync($scope.errors.push(obj));
            }
            $scope.closeError = function(index) {
                $scope.errors.splice(index,1);
            }

            // Creates a deep copy of an object or array
            // This is necessary to have the reset button working
            function deepCopy(o)
            {
                // Ugly and slow, but it gets the job done
                //return JSON.parse(angular.toJson(o));

                //TODO implement fast deep copy
                return o;
            }

        }


    ]);




    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/admin', {
            templateUrl: 'admin/admin.html',
            controller: 'AdminCtrl'
        })
    }]);

})(angular);
