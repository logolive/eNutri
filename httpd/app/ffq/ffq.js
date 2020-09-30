(function (angular) {
    "use strict";

    var app = angular.module('eNutri.questionnaire', ['pascalprecht.translate','ngCookies', 'backend.utils', 'ngRoute', 'ngMaterial']);

    app.controller('FfqCtrl', ['$scope','$cookies', 'BEutil', '$route', '$location', '$mdSidenav', '$mdBottomSheet','$mdToast','$mdDialog','$translate','$q', 
        function($scope, $cookies, BEutil, $route, $location, $mdSidenav, $mdBottomSheet, $mdToast, $mdDialog,$translate) {

            $scope.showContent = false
            $scope.heightUnit = 'cm';
            $scope.heightFeet = 5;
            $scope.heightInches = 5;
            $scope.height = 170;
            $scope.weightUnit = 'kg';
            $scope.showScreening = false;
            $scope.showScreeningWaiting = false;
            $scope.showScreeningRejected = false;
            $scope.showMessage = false;
            $scope.addEvent = false;

            $scope.showPersonalInfo = true;
            $scope.showOtherInfo = false;
            $scope.showPreFFQ = false;
            $scope.showBaecke = false;
            $scope.showBottomLeft = false;
            $scope.showBottomRight = false;

            var userEligibilityList= [];

            // SUS Survey
            $scope.showsurvey = false;
            $scope.currentQuestionId = 0;
            $scope.showSurveyInstructions = true;
            var SUSComponents = [];
            SUSComponents[0] = 0;

            $scope.surveyAnswers=[];

            // Feedback Questionnaire
            $scope.showFeedback = false;
            $scope.currentFeedbackId = 0;
            $scope.showFeedbackInstructions = true;
            $scope.showFeedbackQuestions = false;
            $scope.showFirstFeedbackQuestions = false;

            $scope.feedbackAnswers=[];


            $scope.currentDate = new Date();
            $scope.currentDateFormatted = $scope.currentDate.getFullYear() +"-"+ ($scope.currentDate.getMonth()+1) +"-"+ $scope.currentDate.getDate();
            $scope.currentDateFormattedDDMMYYYY = $scope.currentDate.getDate() +"/"+ ($scope.currentDate.getMonth()+1) +"/"+ $scope.currentDate.getFullYear();

            var refUser;
            var refConfig;
            $scope.refConfig;
            var FFQCount;
            var FFQCompleteCount;

            $scope.foodsList = null;
            $scope.nutrientsList = null;

            // CONFIG
            var FfqValidity = 24;//hours
            var FfqInterval = 41;//days
            var studyDuration = 77;//days

            var maxNumFFQs = 3;

            var baeckeWork = [];
            var baeckeSports = [];
            var baeckeLeisure = [];
            var baeckeSports9a = [];
            var baeckeSports9b = [];

            $scope.currentBaeckeQuestionId = 0;



            // ---------- CONTROL FLOW ----------

            // Main function to be called once all resources have arrived
            function runFfq(){

                refUser=BEutil.BEUser;
                refConfig=BEutil.BEConfig;
                $scope.refConfig=refConfig;
                console.debug("User:   ",refUser);
                console.debug("Config: ",refConfig);
                if(refUser==null)
                {
                    // Not logged in
                    $location.path('/login');
                    return;
                }
                $scope.showContent=true;
                userEligibilityList=refConfig.get('userEligibilityList');

                FFQCount = refUser.get('state').get('ffqStartedCount');
                FFQCompleteCount = refUser.get('state').get('FFQCompleteCount');
                $scope.FFQId = FFQCount+1;
                $scope.FFQCompleteCount = FFQCompleteCount;
                $scope.reportID = FFQCompleteCount+1;
                $scope.foodsList = refConfig.get('foodsList');
                $scope.nutrientsList = refConfig.get('nutrientsList');

                // Determine the contents to show.
                // This is the main part controlling the flow of actions for the user

                // 1. Give consent
                control_consent() &&
                // 2. Complete the screening
                control_screening() &&
                // 3. Get accepted (possibly wait for a researcher to accept you)
                control_accepted() &&
                // 4. Do the Ffq 3 times
                control_ffq() &&
                // 5. Do the Survey and give Feedback
                control_survey_feedback() &&
                // 6. Done
                control_done();

                

            }
            // Wait until everything has arrived, then execute it
            BEutil.BEWait(true,true,false).then(() => $scope.$evalAsync(runFfq));


            // These return true if the user already completed the task
            // and set up the shown content otherwise
            function control_consent() {
                if (refUser.get('state').get('consentResponse') == 'agree'){
                    // The user already gave his consent
                    return true;
                } else{
                    // Get user's consent or remind him that we need it
                    if (refUser.get('state').get('consentResponse') == 'disagree'){
                        $scope.showConsent = true;
                    } else{
                        $scope.showConsentForm();
                    }
                    return false;
                }

            }
            function control_screening() {
                if (refUser.get('state').get('screeningComplete')){
                    // Screening already completed
                    return true;
                } else{
                    // Screening is up next
                    $scope.showScreening = true;
                    return false;
                }
            }
            function control_accepted() {
                if (refUser.get('state').get('screeningAccepted')){
                    // The user was accepted
                    return true;
                } else{
                    if (refUser.get('group') == 'rejected'){
                        // The user was rejected
                        $scope.showScreening = false;
                        $scope.showScreeningWaiting = false;
                        $scope.showScreeningRejected = true;
                    } else{
                        // The user has to wait for confirmation
                        $scope.showScreening = false;
                        $scope.showScreeningWaiting = true;
                    }
                    return false;
                }
            }
            function control_ffq() {
                if($scope.FFQCompleteCount >= maxNumFFQs)
                {
                    // All FFQs are done
                    return true;
                }

                if($scope.FFQCompleteCount > 0 &&
                    refUser.get('state').get('lastFFQCompletionTimestamp') - refUser.get('state').get('firstFFQCompletionTimestamp')> (1000*60*60*24*studyDuration))
                {
                    // Time is up. Proceed to the survey and feedback.
                    // The corresponding users have less FFQs
                    return true;
                }



                // Try to restore an FFQ
                var ffqRestored = false;
                for (var i=1;i<=FFQCount;i++){
                    if(tryRestoreFfq(i)) {
                        ffqRestored=true;
                        break;
                    }
                }
                // If that was not possible, try to start a new one
                if(!ffqRestored){
                    tryStartNewFfq();
                }
                // In any case, we should not proceed to the survey yet.
                return false;
            }
            function control_survey_feedback() {
                if (!refUser.get('state').get('surveyComplete')){
                    // Present the survey
                    $scope.showSurvey = true;
                    return false;
                }
                if (!refUser.get('state').get('feedbackComplete')){
                    // Present the Feedback form
                    $scope.showFeedback = true;
                    return false;
                }
                // Survey and Feedback completed
                return true;
            }
            function control_done() {
                // We are done. Show the final message
                refUser.get('state').set('nextFFQDueDate',undefined);
                $scope.ffqMessage = BEutil.BEConfig.get('messagesList')['MESSAGE_COMPLETED'];
                $scope.showMessage = true;
                return true;
            }

            // ---------- CONSENT ----------

            $scope.showConsentForm = function (ev) {
                // Show the consent
                $mdDialog.show({
                    controller: ConsentController,
                    controllerAs: 'ctrl',
                    bindToController: true,
                    locals: {selectedLanguage:$translate.use()},
                    templateUrl: 'menu/consentDialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:false
                })
                // Save the answer
                .then(function(answer) {
                    var state = refUser.get('state');
                    state.set("consentResponse",answer);
                    state.set("consentTimestamp",new Date().getTime());
                    state.save().then(nextStep); // Done, moving on
                }, function() {
                    nextStep(); // Something went wrong. Reload and try again
                });
            }

            function ConsentController($scope, $mdDialog, BEutil) {
                $scope.refConfig=BEutil.BEConfig;
                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
                $scope.answer = function(answer) {
                    $mdDialog.hide(answer);
                };
            }

            // ---------- SCREENING ----------

            $scope.savePersonalInformation = function() {

                var screening= refUser.get("screening");

                screening.set("firstname",$scope.user.firstname);
                screening.set("surname",$scope.user.surname);
                screening.set("age",$scope.user.age);
                screening.set("education",$scope.user.education.label);
                screening.set("recruitment",$scope.user.recruitment.label);
                screening.set("gender",$scope.user.gender);

                if($scope.heightUnit == 'feetInches'){
                    screening.set("height",$scope.heightFeet*30.48 + $scope.heightInches*2.54);
                }
                else if($scope.heightUnit == 'cm'){
                    screening.set("height",$scope.height);
                }

                screening.set("notgoodhealthDesc","");
                screening.set("foodallergyDesc","");
                screening.set("illnessesDesc","");
                screening.set("medicationDesc","");
                screening.set("methabolicdisorderDesc","");
                screening.set("medicalinformationDesc","");
                screening.set("dietaryreqDesc","");
                $scope.user.breakfast = false;
                $scope.user.notgoodhealth = false;
                $scope.user.lactose = false;
                $scope.user.foodallergy = false;
                $scope.user.diabetes = false;
                $scope.user.vegan = false;
                $scope.user.pregnant = false;
                $scope.user.methabolicdisorder = false;
                $scope.user.illnesses = false;
                $scope.user.medication = false;
                $scope.user.medicalinformation = false;
                $scope.user.livinguk = false;
                $scope.user.consultation = false;
                $scope.user.dietaryreq = false;

                // Switch to second form. We save both forms after that
                $scope.showPersonalInfo = false;
                $scope.showOtherInfo = true;
                
            };

            $scope.saveOtherInformation = function() {

                var utm =       refUser.get("utm");
                var screening = refUser.get("screening");
                var state =     refUser.get("state");

                utm.set("source","null");
                utm.set("medium","null");
                utm.set("campaign","null");
                utm.set("term","null");
                utm.set("content","null");
                if ($cookies.get('utm_source')){
                    utm.set("source",$cookies.get('utm_source'));
                }
                if ($cookies.get('utm_medium')){
                    utm.set("medium",$cookies.get('utm_medium'));
                }
                if ($cookies.get('utm_campaign')){
                    utm.set("campaign",$cookies.get('utm_campaign'));
                }
                if ($cookies.get('utm_term')){
                    utm.set("term",$cookies.get('utm_term'));
                }
                if ($cookies.get('utm_source')){
                    utm.set("content",$cookies.get('utm_content'));
                }

                screening.set("notgoodhealth",$scope.user.notgoodhealth);
                screening.set("lactose",$scope.user.lactose);
                screening.set("foodallergy",$scope.user.foodallergy);
                screening.set("diabetes",$scope.user.diabetes);
                screening.set("vegan",$scope.user.vegan);
                screening.set("pregnant",$scope.user.pregnant);
                screening.set("methabolicdisorder",$scope.user.methabolicdisorder);
                screening.set("illnesses",$scope.user.illnesses);
                screening.set("medication",$scope.user.medication);
                screening.set("medicalinformation",$scope.user.medicalinformation);
                screening.set("livinguk",$scope.user.livinguk);
                screening.set("consultation",$scope.user.consultation);
                screening.set("dietaryreq",$scope.user.dietaryreq);

                screening.set("screeningDate",$scope.currentDateFormatted);
                screening.set("screeningTimestamp",new Date().getTime());

                state.set("screeningComplete",true);
                state.set("FFQCompleteCount",0);

                // Add the user to one group
                defineParticipantGroup();
                
                // Save and move on.
                refUser.save().then(nextStep);
            };

            function decideEligibility(){
                for(var rule of userEligibilityList){
                    switch(rule.type){
                        case "unconditional":
                            return rule.decision;
                        case "and":
                            var matching=true;
                            for(var arg of rule.arguments){
                                if(!$scope.user[arg]) matching=false;
                            }
                            if(matching) return rule.decision;
                            break;
                        case "or":
                            var matching=false;
                            for(var arg of rule.arguments){
                                if($scope.user[arg]) matching=true;
                            }
                            if(matching) return rule.decision;
                            break;
                    }
                }
                // Accept everyone if no conditions are specified
                return "accept";
            }

            function defineParticipantGroup (){

                // randomly choose between report groups
                var groups = ["control", "web"];
                var randomizer = Math.floor(Math.random() * groups.length);

                var decision=decideEligibility();
                switch(decision){
                    case "reject":
                        // reject the user
                        refUser.set('group',"rejected");
                        refUser.set('report',groups[randomizer]);
                        refUser.get('state').set('screeningAccepted',false);
                        break;
                    case "wait":
                        // make the user wait for confirmation
                        refUser.set('group',"waiting");
                        refUser.set('report',groups[randomizer]);
                        refUser.get('state').set('screeningAccepted',false);
                        break;
                    case "accept":
                    default:
                        // accept the user
                        refUser.set('group',groups[randomizer]);
                        refUser.set('report',groups[randomizer]);
                        refUser.get('state').set('screeningAccepted',true);
                        break;
                }
            }

            $scope.savePromptScreening = function(ref1, value) {
                this.ref1 = ref1;
                this.value = value;
                if (value == true){
                    var confirm = $mdDialog.prompt()
                        .title('Please describe')
                        .placeholder('Enter text there')
                        .ok('OK')
                    $mdDialog.show(confirm).then(function(answer) {
                        refUser.get('screening').set(ref1,answer);
                    });
                } else {
                    refUser.get('screening').set(ref1,"");
                }

            };


            // ---------- FOOD FREQUENCY QUESTIONAIRE ----------

            function tryRestoreFfq(i)
            {
                // Has this FFQ started during the last FfqValidity hours? If not, reject it
                if (!(new Date().getTime() - refUser.get('ffq'+i).get('preFFQTimestamp') < (1000*60*60*FfqValidity))){
                    return false;
                }

                // Is it complete?
                if (refUser.get('ffq'+i).get('FFQComplete')){
                    // Technically we didn't restore anything, but we don't want to load another one
                    $scope.ffqMessage = BEutil.BEConfig.get('messagesList')['MESSAGE_TODAY_COMPLETED'];
                    $scope.showMessage = true;
                    return true;
                }

                // We found an FFQ to restore
                $scope.FFQId = i;
                $scope.currentFoodItem = refUser.get('ffq'+i).get('lastFoodItem')+1;
                $scope.freqSelected = "Not in the last month";
                $scope.portionSelected = "None";
                $scope.freqDay = 0;
                $scope.showPortionSelection = false;
                $scope.showFFQ = true;
                $scope.showBottomRight = true;
                if (refUser.get('ffq'+i).get('lastFoodItem') != -1){
                    $scope.showBottomLeft = true;
                }
                return true;
            }

            function tryStartNewFfq(){
                // Do we have to wait for the next FFQ, because we recently finished one?
                var needToWait=false;
                if(FFQCompleteCount > 0)
                {
                    // After finishing the first FFQ we need to wait for FfqInterval Days for the second one
                    if((FFQCompleteCount == 1
                        && (new Date().getTime() - refUser.get('state').get('firstFFQCompletionTimestamp') < (1000*60*60*24*FfqInterval))))
                        needToWait=true;

                    // After finishing the first FFQ we need to wait for studyDuration Days for the third one
                    if((FFQCompleteCount == 2
                        && (new Date().getTime() - refUser.get('state').get('firstFFQCompletionTimestamp') < (1000*60*60*24*studyDuration))))
                        needToWait=true;

                }
                if(needToWait)
                {
                    // Schedule next FFQ via AddEvent
                    var nextFfqDate = new Date();
                    if(FFQCompleteCount == 1){
                        nextFfqDate.setTime(refUser.get('state').get('firstFFQCompletionTimestamp')+(1000*60*60*24*FfqInterval));
                    }
                    if(FFQCompleteCount == 2){
                        nextFfqDate.setTime(refUser.get('state').get('firstFFQCompletionTimestamp')+(1000*60*60*24*studyDuration));
                    }
                    $scope.nextFfqDateFormatted = nextFfqDate.getDate() +"/"+ (nextFfqDate.getMonth()+1) +"/"+ nextFfqDate.getFullYear();
                    $scope.nextFfqDateEvent = (nextFfqDate.getDate()+1) +"/"+ (nextFfqDate.getMonth()+1) +"/"+ nextFfqDate.getFullYear();
                    refUser.get('state').set('nextFFQDueDate',$scope.nextFfqDateFormatted);
                    $scope.ffqMessage = BEutil.BEConfig.get('messagesList')['MESSAGE_WAIT'];
                    $scope.showMessage = true;
                    $scope.addEvent = true;
                    addeventatc.refresh();
                    return false;
                }
                else
                {
                    // Start a new FFQ
                    $scope.FFQId = FFQCount+1;
                    $scope.currentFoodItem = 0;
                    $scope.freqSelected = "Not in the last month";
                    $scope.portionSelected = "None";
                    $scope.freqDay = 0;
                    $scope.showPortionSelection = false;
                    $scope.showBaecke = false;
                    $scope.showFFQ = false;
                    $scope.showPreFFQ = true;
                    $scope.showWeight = true;
                    return true;
                }
            }

            // Weight
            $scope.saveWeight = function(){

                if ($scope.weightUnit=='stones'){
                    $scope.currentWeight = $scope.currentWeightStones*6.35029+$scope.currentWeightPounds*6.35029/14;
                }
                if ($scope.currentWeight >= 40 && $scope.currentWeight <= 200){
                $scope.showWeight = false;
                $scope.showBaeckeBottomLeft = false;
                $scope.showBaeckeInstructions = true;
                }
            };

            // Baecke
            $scope.startBaecke = function () {
                $scope.showBaecke = true;
                $scope.showBaeckeInstructions = false;
                $scope.showBaeckeQuestions = true;
                $scope.showBaeckeQuestion1 = true;
            };

            $scope.previousBaeckeQuestion = function (currentQuestionID) {

                $scope.currentBaeckeQuestionId = currentQuestionID-1;
                $scope.answerSelected = null;

                if (currentQuestionID == 1){
                    $scope.showBaeckeBottomLeft = false;
                    $scope.showBaeckeQuestion1 = true;
                    $scope.showBaeckeQuestions2to4 = false;
                }
                if (currentQuestionID == 4){
                    $scope.showBaeckeQuestions2to4 = true;
                    $scope.showBaeckeQuestion5 = false;
                }
                if (currentQuestionID == 5){
                    $scope.showBaeckeQuestion5 = true;
                    $scope.showBaeckeQuestions6to7 = false;
                }
                if (currentQuestionID == 7){
                    $scope.showBaeckeQuestions6to7 = true;
                    $scope.showBaeckeQuestion8 = false;
                }
                if (currentQuestionID == 8){
                    $scope.showBaeckeQuestion8 = true;
                    $scope.showBaeckeQuestion9 = false;
                }
                if (currentQuestionID == 9){
                    $scope.showBaeckeQuestions = true;
                    $scope.showBaeckeQuestion9 = true;
                    $scope.showBaeckeQuestion9a = true;
                    $scope.showBaeckeQuestion9a1 = false;
                    $scope.showBaeckeQuestion9a2 = false;
                    $scope.showBaeckeQuestion9a3 = false;
                    $scope.showBaeckeQuestion9b = false;
                    $scope.showBaeckeQuestion9b1 = false;
                    $scope.showBaeckeQuestion9b2 = false;
                    $scope.showBaeckeQuestion9b3 = false;
                    $scope.showBaeckeQuestion10 = false;
                }
                if (currentQuestionID == 10){
                    $scope.showBaeckeQuestion10 = true;
                    $scope.showBaeckeQuestion11 = false;
                }
                if (currentQuestionID == 11){
                    $scope.showBaeckeQuestion11 = true;
                    $scope.showBaeckeQuestions12to15 = false;
                }
                if (currentQuestionID == 15){
                    $scope.showBaeckeQuestions12to15 = true;
                    $scope.showBaeckeQuestion16 = false;
                }
            };

            $scope.saveBaecke = function (answerSelectedID, currentQuestionID, FFQId, factor) {

                var factor = factor;
                // Excluding 9a - 9b
                if (currentQuestionID == 0
                    || currentQuestionID == 1
                    || currentQuestionID == 2
                    || currentQuestionID == 3
                    || currentQuestionID == 4
                    || currentQuestionID == 5
                    || currentQuestionID == 6
                    || currentQuestionID == 7
                    || currentQuestionID == 8
                    || currentQuestionID == 9
                    || currentQuestionID == 10
                    || currentQuestionID == 11
                    || currentQuestionID == 12
                    || currentQuestionID == 13
                    || currentQuestionID == 14
                    || currentQuestionID == 15
                    || currentQuestionID == 16
                    || currentQuestionID == 17){
                    // Adjusting the array which started with 0
                    currentQuestionID = currentQuestionID+1;
                    $scope.currentBaeckeQuestionId = currentQuestionID;
                    $scope.answerSelected = null;
                    $scope.showBaeckeBottomLeft = true;
                }
                // Work Index
                if (currentQuestionID == 1){

                    $scope.showBaeckeQuestion1 = false;
                    $scope.showBaeckeQuestions2to4 = true;
                    if (answerSelectedID == 1){
                        baeckeWork[currentQuestionID] = 1;
                    } else{
                        if (answerSelectedID == 2){
                            baeckeWork[currentQuestionID] = 3;
                        } else{
                            baeckeWork[currentQuestionID] = 5;
                        }
                    }
                }
                if (currentQuestionID == 3 || currentQuestionID == 4 ||currentQuestionID == 5){
                    baeckeWork[currentQuestionID] =  answerSelectedID;
                }
                if (currentQuestionID == 2 || currentQuestionID == 6 || currentQuestionID == 7 || currentQuestionID == 8){
                    baeckeWork[currentQuestionID] = 6 - answerSelectedID;
                }
                if (currentQuestionID == 4){
                    $scope.showBaeckeQuestions2to4 = false;
                    $scope.showBaeckeQuestion5 = true;
                }
                if (currentQuestionID == 5){
                    $scope.showBaeckeQuestion5 = false;
                    $scope.showBaeckeQuestions6to7 = true;
                }
                if (currentQuestionID == 7){
                    $scope.showBaeckeQuestions6to7 = false;
                    $scope.showBaeckeQuestion8 = true;
                }
                if (currentQuestionID == 8){

                    $scope.sumBaeckeWork = 0;
                    for (var i=1; i<9; i++){
                        $scope.sumBaeckeWork = $scope.sumBaeckeWork + baeckeWork[i];
                    }
                    refUser.get('ffq'+FFQId).get('baecke').set('work',$scope.sumBaeckeWork/8);
                    $scope.showBaeckeQuestion8 = false;
                    $scope.showBaeckeQuestion9 = true;
                    $scope.showBaeckeQuestion9a = true;
                }
                // Sports Index
                if (currentQuestionID == 9){
                    $scope.multBaeckeSports9a = 0;
                    $scope.multBaeckeSports9b = 0;
                    if (answerSelectedID == 1){
                        baeckeSports[currentQuestionID] = 0;
                        $scope.showBaeckeQuestion9 = false;
                        $scope.showBaeckeQuestion10 = true;
                    } else{
                        $scope.showBaeckeQuestions = false;
                        $scope.showBaeckeQuestion9a = false;
                        $scope.showBaeckeQuestion9a1 = true;
                    }
                }
                if (currentQuestionID == '9a1'){
                    $scope.showBaeckeQuestion9a =  false;
                    $scope.showBaeckeQuestion9a1 =  false;
                    $scope.showBaeckeQuestion9a2 =  true;
                    baeckeSports9a[1] = factor;
                }
                if (currentQuestionID == '9a2'){
                    $scope.showBaeckeQuestion9a2 =  false;
                    $scope.showBaeckeQuestion9a3 =  true;
                    baeckeSports9a[2] = factor;
                }
                if (currentQuestionID == '9a3'){
                    $scope.showBaeckeQuestion9a3 =  false;
                    $scope.showBaeckeQuestion9b =  true;
                    baeckeSports9a[3] = factor;
                    $scope.multBaeckeSports9a = baeckeSports9a[1]*baeckeSports9a[2]*baeckeSports9a[3];
                }
                if (currentQuestionID == '9b'){
                    if (answerSelectedID == 1){

                        if ($scope.multBaeckeSports9a  < 4){
                            baeckeSports[9] = 2;
                        } else{
                            if ($scope.multBaeckeSports9a < 8){
                                baeckeSports[9] = 3;
                            } else{
                                if ($scope.multBaeckeSports9a < 12){
                                    baeckeSports[9] = 4;
                                } else{
                                    baeckeSports[9] = 5;
                                }
                            }
                        }
                        $scope.showBaeckeQuestion9b =  false;
                        $scope.showBaeckeQuestion10 =  true;
                        $scope.showBaeckeQuestions = true;
                    } else{
                        $scope.showBaeckeQuestion9b =  false;
                        $scope.showBaeckeQuestion9b1 =  true;
                    }
                }
                if (currentQuestionID == '9b1'){
                    $scope.showBaeckeQuestion9b1 =  false;
                    $scope.showBaeckeQuestion9b2 =  true;
                    baeckeSports9b[1] = factor;
                }
                if (currentQuestionID == '9b2'){
                    $scope.showBaeckeQuestion9b2 =  false;
                    $scope.showBaeckeQuestion9b3 =  true;
                    baeckeSports9b[2] = factor;
                }
                if (currentQuestionID == '9b3'){
                    $scope.showBaeckeQuestion9b3 =  false;
                    $scope.showBaeckeQuestions = true;
                    $scope.showBaeckeQuestion10 =  true;
                    baeckeSports9b[3] = factor;
                    $scope.multBaeckeSports9b = baeckeSports9b[1]*baeckeSports9b[2]*baeckeSports9b[3];
                    if ($scope.multBaeckeSports9a + $scope.multBaeckeSports9b  < 4){
                        baeckeSports[9] = 2;
                    } else{
                        if ($scope.multBaeckeSports9a + $scope.multBaeckeSports9b < 8){
                            baeckeSports[9] = 3;
                        } else{
                            if ($scope.multBaeckeSports9a + $scope.multBaeckeSports9b < 12){
                                baeckeSports[9] = 4;
                            } else{
                                baeckeSports[9] = 5;
                            }
                        }
                    }
                }
                if (currentQuestionID == 10){
                    $scope.showBaeckeQuestion10 = false;
                    $scope.showBaeckeQuestion11 = true;
                }
                if (currentQuestionID == 11){
                    $scope.showBaeckeQuestion11 = false;
                    $scope.showBaeckeQuestions12to15 = true;
                }
                if (currentQuestionID == 10 || currentQuestionID == 11){
                    baeckeSports[currentQuestionID] = 6 - answerSelectedID;
                }
                if (currentQuestionID == 12){
                    baeckeSports[currentQuestionID] = answerSelectedID;
                    $scope.sumBaeckeSports = 0;
                    for (var i=9; i<13; i++){
                        $scope.sumBaeckeSports = $scope.sumBaeckeSports + baeckeSports[i];
                    }
                    refUser.get('ffq'+FFQId).get('baecke').set('sports',$scope.sumBaeckeSports/4);
                }
                // Leisure Index
                if (currentQuestionID == 13){
                    baeckeLeisure[currentQuestionID] = 6 - answerSelectedID;
                }
                if (currentQuestionID == 14 || currentQuestionID == 15 ||currentQuestionID == 16){
                    baeckeLeisure[currentQuestionID] = answerSelectedID;
                }
                if (currentQuestionID == 15){
                    $scope.showBaeckeQuestions12to15 = false;
                    $scope.showBaeckeQuestion16 = true;
                }
                if (currentQuestionID == 16){
                    $scope.sumBaeckeLeisure = 0;
                    for (var i=13; i<17; i++){
                        $scope.sumBaeckeLeisure = $scope.sumBaeckeLeisure + baeckeLeisure[i];
                    }
                    refUser.get('ffq'+FFQId).get('baecke').set('leisure',$scope.sumBaeckeLeisure/4);
                    refUser.get('ffq'+FFQId).get('baecke').set('overall',$scope.sumBaeckeLeisure/4+$scope.sumBaeckeSports/4+$scope.sumBaeckeWork/8);
                    refUser.get('ffq'+FFQId).save();
                    savePreFFQ(FFQId);
                    $scope.showFFQ = true;
                    $scope.showBottomLeft = false;
                }

                var answers=refUser.get('ffq'+FFQId).get('baecke').get('answers');
                answers['answer'+currentQuestionID] = answerSelectedID;
                refUser.get('ffq'+FFQId).get('baecke').set('answers',answers);
            };

            var savePreFFQ = function(FFQId){
                var FFQId = FFQId;
                var ffqResults=[];
                //initialize the database
                var ffqResult = {};
                for (var i=0;i<$scope.foodsList.length;i++){
                    var ffqResult = {};
                    ffqResult[ 'portion' ] = "None";
                    ffqResult[ 'freq' ] = "Not in the last month";
                    ffqResult[ 'freqDay' ] = 0;
                    ffqResults.push(ffqResult);
                }

                refUser.get('ffq'+FFQId).set('results',ffqResults);

                refUser.get('ffq'+FFQId).set('id',FFQId);
                refUser.get('ffq'+FFQId).set('lastFoodItem',-1);
                refUser.get('ffq'+FFQId).set('id',FFQId);
                refUser.get('ffq'+FFQId).set('FFQStartTimestamp',new Date().getTime());

                // Save Personal result and navigator info

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

                refUser.get('ffq'+FFQId).set('currentWeight',$scope.currentWeight);
                refUser.get('ffq'+FFQId).set('weightUnit',$scope.weightUnit);
                refUser.get('ffq'+FFQId).set('preFFQComplete',true);
                refUser.get('ffq'+FFQId).set('preFFQDate',$scope.currentDateFormatted);
                refUser.get('ffq'+FFQId).set('preFFQTimestamp',new Date().getTime());
                refUser.get('ffq'+FFQId).set('appName',navigator.appName);
                refUser.get('ffq'+FFQId).set('appCodeName',navigator.appCodeName);
                refUser.get('ffq'+FFQId).set('appVersion',navigator.appVersion);
                refUser.get('ffq'+FFQId).set('userAgent',navigator.userAgent);
                refUser.get('ffq'+FFQId).set('platform',navigator.platform);
                refUser.get('ffq'+FFQId).set('product',navigator.product);
                refUser.get('ffq'+FFQId).set('language',navigator.language);
                refUser.get('ffq'+FFQId).set('vendor',navigator.vendor);
                refUser.get('ffq'+FFQId).set('mostLikelyBrowser',$scope.mostLikelyBrowser);
                refUser.get('ffq'+FFQId).set('screenWidth',screen.width);
                refUser.get('ffq'+FFQId).set('screenAvailWidth',screen.availWidth);
                refUser.get('ffq'+FFQId).set('screenHeight',screen.height);
                refUser.get('ffq'+FFQId).set('screenAvailHeight',screen.availHeight);
                refUser.get('ffq'+FFQId).save();
                $scope.showWeight = false;
                $scope.showBaecke = false;
                $scope.showBaeckeBottomLeft = false;
                $scope.showFFQInstructions = true;
                $scope.showFFQ = true;
                $scope.showBottomRight = false;

            };

            // FFQ
            $scope.startFFQ = function () {
                $scope.showFFQInstructions = false;
                $scope.showBottomRight = true;
                refUser.get('state').set('ffqStartedCount',$scope.FFQId);
                refUser.get('state').save();
            };

            $scope.nextFoodItem = function(reportID, FFQId, currentFoodItem){

                // Next one
                changeFoodItem(FFQId,currentFoodItem,false);
                
                // Have we finished the FFQ?
                if (currentFoodItem == $scope.foodsList.length - 1) {
                    saveFFQ(FFQId,reportID);
                }
            };

            $scope.previousFoodItem = function(FFQId, currentFoodItem){
                changeFoodItem(FFQId,currentFoodItem,true);
            };

            function changeFoodItem(FFQId,currentFoodItem,backwards) {
                // Validate input
                if ($scope.portionSelected == "Not Selected"){
                    $scope.showSimpleToast('Select Portion Size!');
                    $scope.showPortionSelection = true;
                    return;
                }

                var ffqResult = {};
                ffqResult['portion'] = $scope.portionSelected;
                ffqResult['freq'] = $scope.freqSelected;
                ffqResult['freqDay'] = $scope.freqDay;
                ffqResult['timestamp'] = new Date().getTime();

                switch ($scope.portionSelected) {
                    case "None":
                        ffqResult['gDay'] = 0;
                        break;
                    case "A":
                        ffqResult['gDay'] = $scope.foodsList[currentFoodItem].pSmall * $scope.freqDay;
                        break;
                    case "B":
                        ffqResult['gDay'] = $scope.foodsList[currentFoodItem].pMedium * $scope.freqDay;
                        break;
                    case "C":
                        ffqResult['gDay'] = $scope.foodsList[currentFoodItem].pLarge * $scope.freqDay;
                        break;
                }

                // Set nextItem
                var nextItem = currentFoodItem+(!backwards?1:(currentFoodItem==0)?0:-1);

                // Save the current one
                var refFfq = refUser.get('ffq'+FFQId);
                var results = refFfq.get('results');
                results[currentFoodItem]=ffqResult;
                refFfq.set('results',results);
                refFfq.set('lastFoodItem',nextItem-1);

                // Set showBottomLeft
                $scope.showBottomLeft = nextItem!=0;

                // Show the next item
                updateFoodItem(FFQId, nextItem);
                refFfq.save();
            }

            var updateFoodItem = function(FFQId, nextItem){
                $scope.currentFoodItem = nextItem;

                // Make sure we don't go out of bounds
                if (nextItem < $scope.foodsList.length){
                    $scope.portionSelected = refUser.get('ffq'+FFQId).get('results')[nextItem]['portion'];
                    $scope.freqSelected = refUser.get('ffq'+FFQId).get('results')[nextItem]['freq'];
                    $scope.freqDay = refUser.get('ffq'+FFQId).get('results')[nextItem]['freqDay'];

                    if ($scope.portionSelected == "None"){
                        $scope.showPortionSelection = false;
                    } else{
                        $scope.showPortionSelection = true;
                    }
                }


            };

            $scope.selectFrequency = function (freqSelected, freqDay, currentFoodItem) {
                $scope.freqSelected = freqSelected;
                $scope.currentFoodItem= currentFoodItem;
                $scope.freqDay= freqDay;

                if ($scope.freqSelected =="Not in the last month"){
                    $scope.showPortionSelection = false;
                    $scope.portionSelected = "None";
                    $scope.freqDay = 0;
                    $scope.nextFoodItem($scope.reportID, $scope.FFQId, $scope.currentFoodItem);
                } else{
                    $mdBottomSheet.show({
                        controllerAs  : "cp",
                        templateUrl   : 'ffq/BottomSheetTemplate.html',
                        controller    : [ '$mdBottomSheet', BottomSheetController],
                        parent        : angular.element(document.getElementById('content'))
                    }).then(function(clickedItem) {
                        $scope.portionSelected = clickedItem.name;
                        $scope.nextFoodItem($scope.reportID, $scope.FFQId, $scope.currentFoodItem);
                    });
                    if($scope.portionSelected = "None"){
                        $scope.portionSelected = "Not Selected";
                    }
                    // $scope.showPortionSelection = true;

                }


                function BottomSheetController( $mdBottomSheet ) {
                    this.freqSelected = freqSelected;
                    this.freqDay = freqDay;
                    this.currentFoodItem = currentFoodItem;
                    this.portions = [
                        { name: 'A', image_url: "assets/images/foods/food-small-"},
                        { name: 'B', image_url: "assets/images/foods/food-medium-"},
                        { name: 'C', image_url: "assets/images/foods/food-large-"},
                    ];

                    this.selectPortion = function(portion) {

                        // so just hide the bottomSheet
                        $mdBottomSheet.hide(portion);
                    };
                }
            }

            // Save and report

            var saveFFQ = function(FFQId,reportID){
                refUser.get('ffq'+FFQId).set('FFQComplete',true);
                refUser.get('ffq'+FFQId).set('FFQCompletionTimestamp',new Date().getTime());
                refUser.get('ffq'+FFQId).set('FFQCompletionDate',$scope.currentDateFormatted);

                if ($scope.FFQCompleteCount == 0) {
                    refUser.get('state').set('firstFFQCompletionTimestamp',new Date().getTime());
                    refUser.get('state').set('firstFFQCompletionDate',$scope.currentDateFormatted);
                }

                refUser.get('state').set('lastFFQCompleteId',FFQId);
                refUser.get('state').set('lastFFQCompletionTimestamp',new Date().getTime());
                refUser.get('state').set('lastFFQCompletionDate',$scope.currentDateFormatted);

                refUser.get('state').set('FFQCompleteCount',$scope.FFQCompleteCount+1);
                if ($scope.FFQCompleteCount == 2){
                    refUser.get('state').set('nextFFQDueDate',"Finished");
                } else{
                    // refUser.get('state').get('nextFFQDueDate').set($scope.nextFfqDateFormatted);
                }

                refUser.get('ffq'+FFQId).set('FFQComplete',true);
                refUser.get('ffq'+FFQId).set('FFQCompletionDate',$scope.currentDateFormatted);
                makeReport(FFQId,reportID);

                // Done. Continue to the next Step
                refUser.save().then(nextStep);
            }

            var makeReport = function(FFQId, reportID)
            {
                calculateNutrients(FFQId, reportID);

                // Report Baecke
                refUser.get('report'+reportID).get('baecke').set('overall',     refUser.get('ffq'+FFQId).get('baecke').get('overall'));
                refUser.get('report'+reportID).get('baecke').set('sports',      refUser.get('ffq'+FFQId).get('baecke').get('sports'));
                refUser.get('report'+reportID).get('baecke').set('leisure',     refUser.get('ffq'+FFQId).get('baecke').get('leisure'));
                refUser.get('report'+reportID).get('baecke').set('work',        refUser.get('ffq'+FFQId).get('baecke').get('work'));
                refUser.get('report'+reportID).get('baecke').set('answers',     refUser.get('ffq'+FFQId).get('baecke').get('answers'));

                var currentWeight = refUser.get('ffq'+FFQId).get('currentWeight');
                var weightUnit = refUser.get('ffq'+FFQId).get('weightUnit');
                var nutrients = refUser.get('ffq'+FFQId).get('nutrients').get('results');
                var answers = refUser.get('ffq'+FFQId).get('results');

                refUser.get('report'+reportID).set('id',reportID);
                refUser.get('report'+reportID).set('ffqId',FFQId);
                refUser.get('report'+reportID).set('currentWeight',currentWeight);
                refUser.get('report'+reportID).set('weightUnit',weightUnit);
                refUser.get('report'+reportID).set('reportDate',$scope.currentDateFormattedDDMMYYYY);
                refUser.get('report'+reportID).get('nutrients').set('results',nutrients);
                refUser.get('report'+reportID).set('results',answers);
            }

            var calculateNutrients = function(FFQId){
                var nutrientArray=Object.keys($scope.nutrientsList[0]);
                for (var j=0;j<nutrientArray.length;j++){
                    var nutri=nutrientArray[j];
                    var sumNutrient = 0;
                    for (var i=0;i<$scope.foodsList.length;i++){
                        sumNutrient = sumNutrient + $scope.nutrientsList[i][nutri] * refUser.get('ffq'+FFQId).get('results')[i].gDay;
                    }
                    var nutrients=refUser.get('ffq'+FFQId).get('nutrients');
                    var results = nutrients.get('results');
                    results[nutri]=sumNutrient;
                    nutrients.set('results',results)
                }
            };


            // ---------- SURVEY ----------

            $scope.startSurvey = function () {
                $scope.surveyAnswers=new Array(13);
                $scope.showSurveyInstructions = false;
                $scope.showSurveyQuestions = true;
                $scope.showFirstQuestions = true;

            };

            $scope.saveSurvey = function (answerSelectedID, currentQuestionID) {
                // Adjusting the array which started with 0
                currentQuestionID = currentQuestionID+1;
                $scope.currentQuestionId = currentQuestionID;
                $scope.answerSelected = null;
                $scope.showBottomLeft = true;
                SUSComponents[currentQuestionID]= answerSelectedID;

                if (currentQuestionID == 10){
                    $scope.showFirstQuestions = false;
                    $scope.showOverallQuestion = true;
                }
                if (currentQuestionID == 11){
                    $scope.showOverallQuestion = false;
                    $scope.showDifficultiesQuestion = true;
                }
                if (currentQuestionID == 12){
                    $scope.showSurvey = false;
                    var surveySUS = 0;
                    for (var i=0; i<10; i++){
                        if (i % 2){
                            surveySUS  = (surveySUS + SUSComponents[i] - 1);
                        } else{
                            surveySUS = (surveySUS + 5 - SUSComponents[i]);
                        }
                    }
                    surveySUS = surveySUS * 2.5;
                    refUser.get('state').set('surveyComplete',true);
                    refUser.get('state').set('surveySUS',surveySUS);
                    refUser.get('survey').set('surveySUS',surveySUS);
                    // If difficulties were reported
                    if(answerSelectedID == 2){
                        $scope.savePrompt(12, 'answer');
                    } else{
                        $scope.surveyAnswers[12]=1;
                    }
                    refUser.get('survey').set('answers',$scope.surveyAnswers);
                    refUser.save();
                    $scope.ffqMessage = BEutil.BEConfig.get('messagesList')['MESSAGE_SURVEY_COMPLETED'];
                    $scope.showMessage = true;
                }

                $scope.surveyAnswers[currentQuestionID-1]=answerSelectedID;
                refUser.get('survey').set('reportDate',$scope.currentDateFormattedDDMMYYYY);
            };

            $scope.previousSurveyQuestion = function (currentQuestionID) {
                $scope.currentQuestionId = currentQuestionID-1;
                $scope.answerSelected = null;

                if (currentQuestionID == 1){
                    $scope.showBottomLeft = false;
                }

            };

            $scope.savePrompt = function(ref1, ref2) {
                this.ref1 = ref1;
                this.ref2 = ref2;
                var confirm = $mdDialog.prompt()
                    .title('Please describe')
                    .placeholder('Enter text there')
                    .ok('OK')
                $mdDialog.show(confirm).then(function(answer) {
                    refUser.get('survey').set('problems',answer);
                    $scope.surveyAnswers[ref1]=2;
                    refUser.get('survey').set('answers',$scope.surveyAnswers);
                    refUser.save();
                    $scope.status = answer;
                });
            };

            // ---------- FEEDBACK ----------

            $scope.startFeedback = function () {
                $scope.feedbackAnswers=new Array(9);
                $scope.showFeedbackInstructions = false;
                $scope.showFeedbackQuestions = true;
                $scope.showFirstFeedbackQuestions = true;

            };

            $scope.saveFeedback = function (answerSelectedID, currentFeedbackID) {
                // Adjusting the array which started with 0
                currentFeedbackID = currentFeedbackID+1;
                $scope.currentFeedbackId = currentFeedbackID;
                $scope.answerSelected = null;
                $scope.showBottomLeft = true;

                if (currentFeedbackID == 6){
                    $scope.showFirstFeedbackQuestions = false;
                    $scope.showFinalFeedbackQuestions = true;
                }

                if (currentFeedbackID == 7 || currentFeedbackID == 8 || currentFeedbackID == 9 ){
                    if(answerSelectedID == 2){
                        $scope.savePromptFeedback(currentFeedbackID-1, 'answer');
                    } else{
                        $scope.feedbackAnswers[currentFeedbackID-1]=1;
                    }
                }

                if (currentFeedbackID == 9){
                    $scope.showFeedback = false;
                    $scope.showFinalFeedbackQuestions = false;
                    $scope.ffqMessage = {};
                    $scope.showMessage = true;
                    refUser.get('state').set('feedbackComplete',true);
                    refUser.save();
                }
                $scope.feedbackAnswers[currentFeedbackID-1]=answerSelectedID;
                refUser.get('feedback').set('answers',$scope.feedbackAnswers);
                refUser.save();
                refUser.get('feedback').set('reportDate',$scope.currentDateFormattedDDMMYYYY);
            };

            $scope.previousFeedbackQuestion = function (currentFeedbackID) {
                $scope.currentFeedbackId = currentFeedbackID-1;
                $scope.answerSelected = null;

                if (currentFeedbackID == 1){
                    $scope.showBottomLeft = false;
                }

                if (currentFeedbackID == 6){
                    $scope.showFirstFeedbackQuestions = true;
                    $scope.showFinalFeedbackQuestions = false;
                }

            };

            $scope.savePromptFeedback = function(ref1, ref2) {
                this.ref1 = ref1;
                this.ref2 = ref2;
                var confirm = $mdDialog.prompt()
                    .title('Please describe')
                    .placeholder('Enter text there')
                    .ok('OK')
                $mdDialog.show(confirm).then(function(answer) {
                    $scope.feedbackAnswers[ref1]=2;
                    refUser.get('feedback').set('user'+ref1+1,answer);
                    refUser.get('feedback').set('answers',$scope.feedbackAnswers);
                    refUser.save();
                    $scope.status = answer;
                });
            };

            // ---------- HELPER ----------

            $scope.showSimpleToast = function(message) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(message)
                        .position("bottom right")
                        .hideDelay(1000)
                );
            };


            // reloads the page to progress to the next step.
            // This is more error prone than just calling the next step.
            // And it makes the code more readable
            function nextStep() {
                $scope.$evalAsync(() =>{
                    $scope.$emit('menu_update_needed');
                    $route.reload();
                });
            }

        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/questionnaire', {
            templateUrl: 'ffq/ffq.html',
            controller: 'FfqCtrl'
        })
    }]);

})(angular);
