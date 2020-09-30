var nutrientsList;
var foodsList;
var messagesList;
var userEligibilityList;
var constantsList;

function Process()
{
    var text=document.getElementById("exportText");
    var changeF=document.getElementById("overwriteF").checked;
    var changeM=document.getElementById("overwriteM").checked;
    var changeU=document.getElementById("overwriteU").checked;
    var changeC=document.getElementById("overwriteC").checked;

    // Read the input
    var obj;
    try{
        obj=JSON.parse(text.value);
    }
    catch(err){}
    if(!(obj instanceof Object))
    {
        obj={};
        alert("no valid input found. Generating default values...")
    }
    nutrientsList=obj.nutrientsList;
    foodsList=obj.foodsList;
    messagesList=obj.messagesList;
    userEligibilityList=obj.userEligibilityList;
    constantsList=obj.constantsList;

    // Change values
    if(changeF || !foodsList || !nutrientsList){

        if(checkValidFoodFile()){
            setFoodReader();
        }
        else{
            setDefaultF();
        }
    }

    if(changeM || !messagesList){
        setDefaultM();
    }

    if(changeC || !constantsList){
        setDefaultC();
    }

    if(changeU || !userEligibilityList){
        setDefaultU();
    }

    // Output the result
    updateOutput();
}

function updateOutput()
{
    var text=document.getElementById("exportText");

    text.value=JSON.stringify({
        nutrientsList:nutrientsList,
        foodsList:foodsList,
        messagesList:messagesList,
        constantsList:constantsList,
        userEligibilityList:userEligibilityList
    });
}

function setDefaultC(){
    constantsList={
        "FfqValidity":24,
        "FfqInterval":41,
        "studyDuration":77,
        "defaultWeightUnit":"kg",
        "defaultHeightUnit":"cm"
    }
}

function setDefaultM(){
    messagesList={
        "TEMPLATE": {
            "TYPE": "undefined",
            "DESC": "undefined",
            "en_UK": "undefined"
        },
        "baecke": {
            "TYPE": "web",
            "DESC": "What is the Baecke method?",
            "en_UK": "baecke TEXT"
        },
        "sportsActivity": {
            "TYPE": "web",
            "DESC": "What is sportsActivity?",
            "en_UK": "sportsActivity TEXT"
        },
        "leisureActivity": {
            "TYPE": "web",
            "DESC": "What is leisureActivity?",
            "en_UK": "leisureActivity TEXT"
        },
        "workActivity": {
            "TYPE": "web",
            "DESC": "What is workActivity?",
            "en_UK": "workActivity TEXT"
        },
        "weightRange": {
            "TYPE": "web",
            "DESC": "What is an 'optimal weight range'?",
            "en_UK": "weightRange TEXT"
        },
        "controlWeight": {
            "TYPE": "control",
            "DESC": "Weight Advice for the control group",
            "en_UK": "controlWeight TEXT"
        },
        "sportsControl": {
            "TYPE": "control",
            "DESC": "Sports Advice for the control group",
            "en_UK": "sportsControl TEXT"
        },
        "leisureControl": {
            "TYPE": "control",
            "DESC": "Leisure Advice for the control group",
            "en_UK": "leisureControl TEXT"
        },
        "underWeight": {
            "TYPE": "web",
            "DESC": "shown to underweight participants",
            "en_UK": "underWeight TEXT"
        },
        "underweightName": {
            "TYPE": "web",
            "DESC": "Translation for 'underweight'",
            "en_UK": "underweightName TEXT"
        },
        "healthyWeight": {
            "TYPE": "web",
            "DESC": "shown to healthy weighted participants",
            "en_UK": "healthyWeight TEXT"
        },
        "healthyWeightName": {
            "TYPE": "web",
            "DESC": "Translation for 'healthy weight'",
            "en_UK": "healthyWeightName TEXT"
        },
        "overWeight": {
            "TYPE": "web",
            "DESC": "shown to overweight participants",
            "en_UK": "overWeight TEXT"
        },
        "overweightName": {
            "TYPE": "web",
            "DESC": "Translation for 'overweight'",
            "en_UK": "overweightName TEXT"
        },
        "obese": {
            "TYPE": "web",
            "DESC": "shown to obese participants",
            "en_UK": "obese TEXT"
        },
        "obeseName": {
            "TYPE": "web",
            "DESC": "Translation for 'obese'",
            "en_UK": "obeseName TEXT"
        },
        "sportsGreen": {
            "TYPE": "web",
            "DESC": "Shown on the report if the user's sports activity is good",
            "en_UK": "sportsGreen TEXT"
        },
        "sportsYellow": {
            "TYPE": "web",
            "DESC": "Shown on the report if the user's sports activity could be improved",
            "en_UK": "sportsYellow TEXT"
        },
        "sportsRed": {
            "TYPE": "web",
            "DESC": "Shown on the report if the user's sports activity is critical",
            "en_UK": "sportsRed TEXT"
        },
        "leisureGreen": {
            "TYPE": "web",
            "DESC": "Shown on the report if the user's leisure activity is good",
            "en_UK": "leisureGreen TEXT"
        },
        "leisureYellow": {
            "TYPE": "web",
            "DESC": "Shown on the report if the user's leisure activity could be improved",
            "en_UK": "leisureYellow TEXT"
        },
        "leisureRed": {
            "TYPE": "web",
            "DESC": "Shown on the report if the user's leisure activity is critical",
            "en_UK": "leisureRed TEXT"
        },
        "HOME_ABOUT_DESCRIPTION_1": {
            "TYPE": "general",
            "DESC": "Description of the Study. Shown on the home page and under the i-icon",
            "en_UK": "EatWellUK is a research study being conducted by the University of Reading investigating online personalised nutrition advice. We have developed this web application, which can evaluate the quality of your dietary intake and generate a personalised nutrition report."
        },
        "HOME_ABOUT_DESCRIPTION_2": {
            "TYPE": "general",
            "DESC": "Description of the Study. Shown on the home page and under the i-icon",
            "en_UK": "This is an online study. At the end of the 12-week study, you will receive a personalised nutrition advice report which is based on your dietary intake."
        },
        "HOME_ABOUT_DESCRIPTION_3": {
            "TYPE": "general",
            "DESC": "Description of the Study. Shown on the home page and under the i-icon",
            "en_UK": "Participating in this study involves three online interactions of approximately 20 minutes each.  You will be asked to create an account in this website, provide information about your characteristics (gender, age, height and weight), and complete a physical activity and diet questionnaire. You will need to repeat the physical activity and diet questionnaires after 6 and 12 weeks."
        },
        "HOME_ABOUT_DESCRIPTION_4": {
            "TYPE": "general",
            "DESC": "Description of the Study. Shown on the home page and under the i-icon",
            "en_UK": "We are looking for adults (18+) living in the UK, without any diagnosed health conditions (e.g. diabetes), without any food allergies or intolerances, who are not on a special diet (e.g. pregnancy or vegan) and who are not receiving face-to-face nutritional services at the moment."
        },
        "HOME_ABOUT_DESCRIPTION_5": {
            "TYPE": "general",
            "DESC": "Description of the Study. Shown on the home page and under the i-icon",
            "en_UK": "The University of Reading is internationally recognised for its excellence in research on the relationship between diet and chronic disease. Please visit our website (reading.ac.uk/nutrition) for more information."
        },
        "HELP_TAB_QUESTIONNAIRE_TEXT": {
            "TYPE": "general",
            "DESC": "Describes the FFQ. Shown immediately before the FFQ",
            "en_UK": "The diet questionnaire contains 157 food items. It will take around 20 minutes to complete. Please try to complete all the items in one session. If you need to leave your computer or close your browser during the session, your responses will be saved. Please login within 24 hours to complete the remainder of the questions."
        },
        "HELP_TAB_CONTACT_TEXT": {
            "TYPE": "general",
            "DESC": "How participants can contact you. Shown under the i-icon",
            "en_UK": "If you would like any more information on this study, please feel free to contact us via the e-mail eatwelluk@reading.ac.uk"
        },
        "MESSAGE_WAIT": {
            "TYPE": "general",
            "DESC": "Something like 'Please come back on the '. Will be appended by the date for the next FFQ",
            "en_UK": "Your next questionnaire will be available on the "
        },
        "MESSAGE_TODAY_COMPLETED": {
            "TYPE": "general",
            "DESC": "Shown when accessing the Questionaire page after finishing an FFQ",
            "en_UK": "Thank you. You have completed your FFQ today."
        },
        "MESSAGE_SURVEY_INSTRUCTIONS": {
            "TYPE": "general",
            "DESC": "Shown when the FFQ was completed and the survey is up next",
            "en_UK": "You have completed the diet questionnaire. The following usability survey takes only 1 minute."
        },
        "MESSAGE_FEEDBACK_INSTRUCTIONS": {
            "TYPE": "general",
            "DESC": "Shown when the FFQ was completed and the feedback form is up next",
            "en_UK": "You have completed all food questionnaires. The following feedback questionnaire takes only 1 minute."
        },
        "MESSAGE_FFQ_INSTRUCTIONS_1": {
            "TYPE": "general",
            "DESC": "Shown directly before the FFQ",
            "en_UK": "The diet questionnaire contains 157 food items. It will take around 20 minutes to complete. Please try to complete all the items in one session. If you need to leave your computer or close your browser during the session, your responses will be saved. Please login within 24 hours to complete the remainder of the questions."
        },
        "MESSAGE_FFQ_INSTRUCTIONS_2": {
            "TYPE": "general",
            "DESC": "Shown directly before the FFQ",
            "en_UK": "We are only interested in what you have had in the last month.  For any food items that you have not had in the last month, you can skip that item (press the 'Not in the last month' button). For items that you have had, please indicate how frequently you had that food in the last month along with the portion size. You are allowed to return to the previous food items and change your answers using the back button (bottom left corner)."
        },
        "MESSAGE_SURVEY_COMPLETED": {
            "TYPE": "general",
            "DESC": "Shown after the survey. Has the next FFQ date appended to it",
            "en_UK": "Thank you for submitting the survey! Your next questionnaire will be available on the "
        },
        "MESSAGE_COMPLETED": {
            "TYPE": "general",
            "DESC": "Shown to users who have finished the study",
            "en_UK": "You have completed all questionnaires. We thank you for your participation in this study."
        },
        "MESSAGE_THANKYOU": {
            "TYPE": "general",
            "DESC": "A short 'Thank you'",
            "en_UK": "Thank you!"
        },
        "MESSAGE_SCREENING_WAITING": {
            "TYPE": "general",
            "DESC": "Shown to users who have to wait for a researcher to accept them based on their screening",
            "en_UK": "Your information was received. A researcher will e-mail you once they have assessed your eligibility to participate in this study. If you would like any more information, please feel free to contact us via the e-mail eatwelluk@reading.ac.uk"
        },
        "MESSAGE_SCREENING_REJECTED": {
            "TYPE": "general",
            "DESC": "Shown to rejected users",
            "en_UK": "Based on the information you have provided, we are sorry to tell you that you are not eligible to participate in this particular study. If you would like any more information about this decision, please feel free to contact us via the e-mail eatwelluk@reading.ac.uk. Thank you for your time and collaboration."
        },
        "MESSAGE_REPORT_BUTTON": {
            "TYPE": "general",
            "DESC": "Text on a button linking to the report",
            "en_UK": "View Nutrition Advice"
        },
        "MESSAGE_BAECKE": {
            "TYPE": "general",
            "DESC": "Title for the 'Physical Activity Questionnaire'",
            "en_UK": "Physical Activity Questionnaire"
        },
        "MESSAGE_BAECKE_INSTRUCTIONS": {
            "TYPE": "general",
            "DESC": "Instructions for the 'Physical Activity Questionnaire'",
            "en_UK": "You will be presented with 16 questions regarding your physical activities. This first questionnaire last arounds 3 minutes."
        },
        "CONSENT_1": {
            "TYPE": "general",
            "DESC": "Consent Text",
            "en_UK": "I have received and read the accompanying Information Sheet relating to the project entitled 'Evaluation of the Effectiveness of Online Nutrition Advice in the UK'."
        },
        "CONSENT_2": {
            "TYPE": "general",
            "DESC": "Consent Text",
            "en_UK": "I agree to the arrangements described in the Information Sheet in so far as they relate to my participation."
        },
        "CONSENT_3": {
            "TYPE": "general",
            "DESC": "Consent Text",
            "en_UK": "I understand that participation is entirely voluntary and that I have the right to withdraw from the study at any time without giving reason, and that this will be without detriment to any care or services I may be receiving or may receive in the future."
        },
        "CONSENT_4": {
            "TYPE": "general",
            "DESC": "Consent Text",
            "en_UK": "I agree to receive e-mails from the research team and to the automatic collection of timestamps, browser type and screen size of my computer device during the use of the study website."
        },
        "CONSENT_5": {
            "TYPE": "general",
            "DESC": "Consent Text",
            "en_UK": "This project has been subject to ethical review, according to the procedures specified by the University of Reading Research Ethics Committee, School of Chemistry, Food and Pharmacy, and has been given a favourable ethical opinion for conduct (study 13/17)."
        },
        "CONSENT_6": {
            "TYPE": "general",
            "DESC": "Consent Text",
            "en_UK": "I was able to access downloadable copies of this Consent Form and of the accompanying Information Sheet."
        }
    };
}

function setDefaultU(){
    userEligibilityList=[
        {
            "type":"or",
            "arguments":[
                "lactose",
                "foodallergy",
                "diabetes",
                "livinguk",
                "consultation",
                "pregnant",
                "vegan"
            ],
            "decision":"reject"
        },
        {
            "type":"or",
            "arguments":[
                "notgoodhealth",
                "methabolicdisorder",
                "illnesses",
                "medication",
                "dietaryreq"
            ],
            "decision":"wait"
        },
        {
            "type":"unconditional",
            "arguments":[],
            "decision":"accept"
        }
    ]
}

function setDefaultF(){
    foodsList=[];
    nutrientsList=[];
}

// DISCLAIMER: This code was taken from https://www.aspsnippets.com/Articles/Read-Parse-Excel-File-XLS-and-XLSX-using-JavaScript.aspx

function checkValidFoodFile()
{
    //Reference the FileUpload element.
    var fileUpload = document.getElementById("fileUpload");
    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    return regex.test(fileUpload.value.toLowerCase());

}
function setFoodReader() {
    //Reference the FileUpload element.
    var fileUpload = document.getElementById("fileUpload");

    if (typeof (FileReader) != "undefined") {
        var reader = new FileReader();

        //For Browsers other than IE.
        if (reader.readAsBinaryString) {
            reader.onload = function (e) {
                ProcessExcel(e.target.result);
            };
            reader.readAsBinaryString(fileUpload.files[0]);
        } else {
            //For IE Browser.
            reader.onload = function (e) {
                var data = "";
                var bytes = new Uint8Array(e.target.result);
                for (var i = 0; i < bytes.byteLength; i++) {
                    data += String.fromCharCode(bytes[i]);
                }
                ProcessExcel(data);
            };
            reader.readAsArrayBuffer(fileUpload.files[0]);
        }
    } else {
        alert("ERROR: This browser does not support HTML5.");
    }
};
function ProcessExcel(data) {
    
    var workbook = XLSX.read(data, {
        type: 'binary'
    });

    var firstSheet = workbook.SheetNames[0];
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

    if(excelRows.length<1)
    {
        alert("No rows found.");
        return;
    }

    keys=Object.keys(excelRows[0]);

    ///console.debug(keys);
    foodsList=excelRows.map(obj=>
        {
            var result={};
            result.foodname=obj.ST;
            result.foodexample="";
            result.pSmall=0;
            result.pMedium=0;
            result.pLarge=0;
            return result;
        });
    nutrientsList=excelRows.map(obj=>
        {
            // delete unused keys
            delete obj.SBLS;
            delete obj.ST;
            delete obj.STE;
            for(key of keys)
            {
                if( key==="SBLS" || key==="ST" || key==="STE")
                    continue;
                //console.debug(key);
                obj[key]=parseInt(obj[key]);
            }
            return obj;
        });

        updateOutput();

};