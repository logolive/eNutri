
// a simple wrapper on Calls to Parse Server, to have everything in one place.
angular.module('backend.utils', ['eNutri.config'])

    // Build our API
    .factory('BEutil', ['PARSE_URL', 'PARSE_APPID', function() {
      "use strict";

      // All includes for a user object
      var userIncludes= [
        'state',
        'utm',
        'screening',
        'feedback',
        'survey',
        'ffq1',
        'ffq1.nutrients',
        'ffq1.baecke',
        'ffq2',
        'ffq2.nutrients',
        'ffq2.baecke',
        'ffq3',
        'ffq3.nutrients',
        'ffq3.baecke',
        'report1',
        'report1.nutrients',
        'report1.baecke',
        'report2',
        'report2.nutrients',
        'report2.baecke',
        'report3',
        'report3.nutrients',
        'report3.baecke'];

      // helper function to implement the object interface on ParseObjects
      // ParseObjects returned have a get/set option per parameter and global save option
      function objectify(thing)
      {
        if(thing instanceof Parse.Object)
          return {
            object: thing,
            get(key){
              // Object IDs are apparently special in Parse
              if(key=="objectId") return this.object._getId();
              return objectify(this.object.get(key));
            },
            set(key,value) {this.object.set(key,value);},
            save() {return this.object.save();},
          }
        if(thing instanceof Parse.Config)
          return {
            object: thing,
            changes: {},
            get(key){return objectify(this.changes.key) || objectify(this.object.get(key));},
            set(key,value) {this.changes[key]=value;},
            save(masterkey=undefined) {return saveConfig(this.changes,masterkey);},
          }
        if(thing instanceof Array) return thing.map(objectify);
        return thing;
      }


      // Parse does not allow us to save the config using the JS API, unless
      // a) We have the masterkey (We do have that), and
      // b) We are running on NodeJS (Which we are not).
      // So we use the REST API directly instead.
      // NOTE: The fetch API is unavailable on IE11 and mobile browsers
      // Something to look out for
      function saveConfig(object,masterkey)
      {
        return fetch(Parse.serverURL + '/config',{
          method: 'PUT',
          headers: new Headers({
            'X-Parse-Application-Id': Parse.applicationId,
            'X-Parse-Master-Key': masterkey,
            'Content-Type': 'text/plain;charset=UTF-8'
          }),
          body: angular.toJson({params: object})
        })
      }

      // Build the user DB-Structure
      function makeState()
      {
        var state=new Parse.Object("State");
        state.set('consentResponse',"");
        state.set('screeningComplete',false);
        state.set('screeningAccepted',false);
        state.set('surveyComplete',false);
        state.set('FFQCompleteCount',0);
        state.set('firstFfqCompletionDate',undefined);
        state.set('lastFfqCompletionDate',undefined);
        state.set('nextFfqDueDate',undefined);
        state.set('feedbackComplete',false);
        state.set('ffqStartedCount',0);
        return state;
      }
      function makeUtm()
      {
        var utm=new Parse.Object("Utm");
        utm.set('source',"");
        utm.set('medium',"");
        utm.set('campaign',"");
        utm.set('term',"");
        utm.set('content',"");
        return utm;
      }
      function makeScreening()
      {
        var screening=new Parse.Object("Screening");
        screening.set("firstname","");
        screening.set("surname","");
        screening.set("gender","");
        screening.set("age",0);
        screening.set("height",0);
        screening.set("education","");
        screening.set("notgoodhealth",false);
        screening.set("notgoodhealthDesc","");
        screening.set("lactose",false);
        screening.set("foodallergy",false);
        screening.set("foodallergyDesc","");
        screening.set("diabetes",false);
        screening.set("methabolicdisorder",false);
        screening.set("illnesses",false);
        screening.set("illnessesDesc","");
        screening.set("medication",false);
        screening.set("medicationDesc","");
        screening.set("medicalinformation",false);
        screening.set("medicalinformationDesc","");
        screening.set("vegan",false);
        screening.set("dietaryreq",false);
        screening.set("dietaryreqDesc","");
        screening.set("recruitment","");
        return screening;
      }
      function makeFeedback()
      {
        var feedback=new Parse.Object("Feedback");
        feedback.set('reportDate',undefined);
        feedback.set('answers',[]);
        return feedback;
      }
      function makeSurvey()
      {
        var survey=new Parse.Object("Survey");
        survey.set('surveySUS',0);
        survey.set('answers',[]);
        return survey;
      }
      function makeBaecke()
      {
        var baecke = new Parse.Object("Baecke");
        baecke.set('answers',{});
        return baecke;
      }
      function makeNutrients()
      {
        var nutrients = new Parse.Object("Nutrients");
        nutrients.set('results',{});
        return nutrients;
      }
      function makeFfq()
      {
        var ffq = new Parse.Object("Ffq");
        ffq.set('baecke', makeBaecke());
        ffq.set('nutrients',makeNutrients());
        ffq.set('results',[]);
        return ffq;
      }
      function makeReport()
      {
        var report = new Parse.Object("Report");
        report.set('ffqId',-1);
        report.set('baecke',makeBaecke());
        report.set('nutrients',makeNutrients());
        report.set('results',[]);
        return report;
      }

      // Initializes all values associated with a new user
      function setDefaultValues(user)
      {
        user.set('group',undefined);
        user.set('report',undefined);
        var state=makeState();
        user.set('state',state);
        var utm=makeUtm();
        user.set('utm',utm);
        var screening=makeScreening();
        user.set('screening',screening);
        var feedback=makeFeedback();
        user.set('feedback',feedback);
        var survey=makeSurvey();
        user.set('survey',survey);
        var ffq1=makeFfq();
        user.set('ffq1',ffq1);
        var ffq2=makeFfq();
        user.set('ffq2',ffq2);
        var ffq3=makeFfq();
        user.set('ffq3',ffq3);
        var report1=makeReport();
        user.set('report1',report1);
        var report2=makeReport();
        user.set('report2',report2);
        var report3=makeReport();
        user.set('report3',report3);

        // Parse is weird. We have to save objects connected to the user,
        // before we save the user, but do not have to do that for objects
        // connected to any of these
        return Parse.Object.saveAll([
          state,
          utm,
          screening,
          feedback,
          survey,
          ffq1,
          ffq2,
          ffq3,
          report1,
          report2,
          report3],
          { cascadeSave: true });
      }

      // Sets the Access Control Lists, so only researchers and the
      // user itself can read or modify data
      function setACL(user){
        var acl = new Parse.ACL(user);
        acl.setPublicReadAccess(false);
        acl.setPublicWriteAccess(false);
        acl.setRoleReadAccess("researcher",true);
        acl.setRoleWriteAccess("researcher",true);

        user.setACL(acl);
        user.get('state').setACL(acl);
        user.get('utm').setACL(acl);
        user.get('screening').setACL(acl);
        user.get('feedback').setACL(acl);
        user.get('survey').setACL(acl);
        user.get('ffq1').setACL(acl);
        user.get('ffq1').get('nutrients').setACL(acl);
        user.get('ffq1').get('baecke').setACL(acl);
        user.get('ffq2').setACL(acl);
        user.get('ffq2').get('nutrients').setACL(acl);
        user.get('ffq2').get('baecke').setACL(acl);
        user.get('ffq3').setACL(acl);
        user.get('ffq3').get('nutrients').setACL(acl);
        user.get('ffq3').get('baecke').setACL(acl);
        user.get('report1').setACL(acl);
        user.get('report1').get('nutrients').setACL(acl);
        user.get('report1').get('baecke').setACL(acl);
        user.get('report2').setACL(acl);
        user.get('report2').get('nutrients').setACL(acl);
        user.get('report2').get('baecke').setACL(acl);
        user.get('report3').setACL(acl);
        user.get('report3').get('nutrients').setACL(acl);
        user.get('report3').get('baecke').setACL(acl);
        return user.save();
      }

      // Taken from the official Parse js guide
      function handleParseError(err) {
        console.debug("An error occured. Handling it...");
        console.debug(err);
        switch (err.code) {
          // This happens when reinstalling parse
          case Parse.Error.INVALID_SESSION_TOKEN:
            console.debug("LOGGING OUT")
            Parse.User.logOut();
            // The user will be redirected later
            break;
        }
      }



      var utils = {

        //------------------------------------API--------------------------------------------------

        // The Config Object. It is only retrieved once per visit to the site
        BEConfig: null,

        // The User Object. It will only be updated when userDirty is set
        BEUser: null,

        // An Array of all users. Can be aquired by researchers.
        BEAllUsers: null,

        // Returns a promise to be resolved once every set parameter is aquired
        BEWait: function(conf,user,all)
        {
          var promiseconf = new Promise((a,b) => {a();});
          var promiseuser = new Promise((a,b) => {a();});
          var promiseall = new Promise((a,b) => {a();});
          if(conf) promiseconf = utils.getConfigAsync();
          if(user) promiseuser = utils.getAccountAsync();
          if(all) promiseall = utils.getAllUserData();
          return new Promise(async function(resolve,reject){
            try {
              await promiseconf;
              await promiseuser;
              await promiseall;
              resolve()}
            catch(err) {handleParseError(err); resolve();}})
        },

        // Whether the user is currently logged in
        get signed_in() {return null != utils.BEUser;},

        // Returns a promise to be resolved once the user is signed up; Calls BEWait
        sign_up: function(username,password){
          return new Promise(async function(resolve, reject) {
          var user= new Parse.User();
          user.set("username",username);
          user.set("password",password);
          try{
            await setDefaultValues(user);
            await user.signUp(null, { cascadeSave: true });
            await setACL(user);
          }
          catch (error) { handleParseError(error); }
          // Force reload of user object
          utils.userDirty=true;
          await utils.BEWait(false,true,false);
          resolve(utils.BEUser);
        });
        },

        // Returns a promise to be resolved once the user is signed in; Calls BEWait
        sign_in: function(username,password){
          return new Promise(async function(resolve, reject) {
            try {
              await Parse.User.logIn(username,password);
              // Force reload of user object
              utils.userDirty=true;
              await utils.BEWait(false,true,false);
            }
            catch(err) { handleParseError(err);}
            resolve(utils.BEUser);
          });
        },

        // Returns a promise to be resolved once the user is signed out; Calls BEWait
        sign_out: function(){
          return new Promise(async function(resolve, reject) {
            try{
              await Parse.User.logOut();
              // Force reload of user object
              utils.userDirty=true;
              await utils.BEWait(false,true,false);
            }
            catch(err) {handleParseError(err);}
            resolve(utils.BEUser);
          });
        },

        //------------------------------------HELPER-----------------------------------------------

        // Indicates whether we need to reaquire the current user's data
        userDirty: true,

        //returns a promise to be resolved once BEAllUsers is set
        getAllUserData: function()
        {
          if(utils.BEAllUsers==null) // We only need to aquire this once
          {
            var query=new Parse.Query(Parse.Object.extend("User"));
            return new Promise(async function(resolve, reject) {
              try{
                var tmp = await query.find();
                console.debug("TEST");
                tmp = await Parse.Object.fetchAllWithInclude(tmp,userIncludes);
                console.debug(Parse.isLocalDatastoreEnabled());
                console.debug(tmp);
                utils.BEAllUsers = objectify(tmp);
              }
              catch(err){ handleParseError(err);}
              resolve();
            });
          }
          return new Promise((a,b) => {a();});
        },

        //returns a promise to be resolved once BEConfig is set
        getConfigAsync: function()
        {
          if(utils.BEConfig==null) // We only need to aquire utils once
          {
            var query=new Parse.Config.get();
            return new Promise(async function(resolve, reject) {
              try{
                var tmp = await query;
                utils.BEConfig = objectify(tmp);
              }
              catch(err)
              {
                handleParseError(err);
              }
              resolve();
            });
          }
          return new Promise((a,b) => {a();});
        },

        //returns a promise to be resolved once BEUser is set and current
        getAccountAsync: function() {
          if(!utils.userDirty) return new Promise((a,b) => {a();});
          utils.userDirty=false;
          return new Promise(async function(resolve,reject){
            try{
              var user=Parse.User.current();
              if(user != null) user= await user.fetchWithInclude(userIncludes);
              utils.BEUser = objectify(user);
            }
            catch(err)
            {
              handleParseError(err);
            }
            resolve();
          })
        }

      }
      return utils;
    }])

    // Initialize Parse when the app loads. Constants are defined in /config.js
    .config(['PARSE_URL', 'PARSE_APPID',function(PARSE_URL,PARSE_APPID){
      Parse.initialize(PARSE_APPID);
      Parse.serverURL = PARSE_URL;
    }]);
