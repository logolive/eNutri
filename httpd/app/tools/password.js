var ParseURL="/parse";
var AppId="LpeyqZhVkLf6qUi2xVCwerMyAUMMzS2a";

function Process(){

    var MasterKey=document.getElementById("masterkey").value;
    var username=document.getElementById("username").value;
    var newPass=document.getElementById("password").value;


    //console.debug(MasterKey);
    Parse.initialize(AppId, "hi", MasterKey);
    Parse.serverURL = ParseURL;
    var Query=new Parse.Query(Parse.Object.extend("_User"));
    Query.equalTo("username",username);
    try{
        Query.find().then(result=>{
            switch(result.length){
                case 0:
                    report("No user with this mail found. Is the masterkey correct?");
                    return;
                case 1:
                    // Change password;
                    var user = result[0];
                    user.set("password",newPass);
                    user.save().then(()=>report('Password changed for user '+username),
                        err=>report(err));
                    return;
                default:
                    report("Several users found with this mail.");
                    return;
            }
        });

    }
    catch(err){
        report(err);
    }


}

function report(s)
{
    console.debug(s);
    document.getElementById("resultText").innerHTML=s;
}