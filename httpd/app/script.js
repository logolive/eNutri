angular
    .module('eNutri', ['ngMaterial','pascalprecht.translate', 'eNutri.menus',
        'eNutri.config',
        'eNutri.home',
        'eNutri.login',
        'eNutri.questionnaire',
        'eNutri.reports',
        'eNutri.research',
        'eNutri.admin',
        'eNutri.account'
    ])

    .config(function($mdThemingProvider, $mdIconProvider,$translateProvider){

        $mdIconProvider
            .defaultIconSet("./assets/svg/icons.svg", 128)
            .icon("menu"       , "./assets/svg/menu.svg"        , 24)
            .icon('build', './assets/svg/build.svg');



        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('pink')
            .warnPalette('red')
            .backgroundPalette('grey');

        $mdThemingProvider.theme('progress')
            .primaryPalette('light-green')
            .accentPalette('orange')
            .warnPalette('red')
            .backgroundPalette('grey');

        // Adding a translation table for the English language
        $translateProvider.translations('en_UK', {
            "HOME_ABOUT": "About this project",
            "HOME_ABOUT_DESCRIPTION_1" : "EatWellUK is a research study being conducted by the University of Reading investigating online personalised nutrition advice. We have developed this web application, which can evaluate the quality of your dietary intake and generate a personalised nutrition report.",
            "HOME_ABOUT_DESCRIPTION_2" : "This is an online study. At the end of the 12-week study, you will receive a personalised nutrition advice report which is based on your dietary intake.",
            "HOME_ABOUT_DESCRIPTION_3" : "Participating in this study involves three online interactions of approximately 20 minutes each.  You will be asked to create an account in this website, provide information about your characteristics (gender, age, height and weight), and complete a physical activity and diet questionnaire. You will need to repeat the physical activity and diet questionnaires after 6 and 12 weeks.",
            "HOME_ABOUT_DESCRIPTION_4" : "We are looking for adults (18+) living in the UK, without any diagnosed health conditions (e.g. diabetes), without any food allergies or intolerances, who are not on a special diet (e.g. pregnancy or vegan) and who are not receiving face-to-face nutritional services at the moment.",
            "HOME_ABOUT_DESCRIPTION_5" : "The University of Reading is internationally recognised for its excellence in research on the relationship between diet and chronic disease. Please visit our website (reading.ac.uk/nutrition) for more information.",
            "HOME_WELCOME": "Welcome",
            "HOME_WELCOME_DESCRIPTION": "You are now logged into your account. Press the 'Continue' button to go to the study",
            "HOME_VOLUNTEER": "I am a volunteer",
            "HOME_FFQ": "Continue",
            "LOGIN_HEADING": "New account or Log in",
            "LOGIN_EMAIL": "Your e-mail",
            "LOGIN_EMAIL_INVALID": "Enter a valid e-mail address",
            "LOGIN_PASSWORD": "Your password",
            "LOGIN_PASSWORD_INVALID": "Enter a valid password",
            "LOGIN_PASSWORD_CONFIRM": "Confirm your password",
            "LOGIN_CREATE_ACCOUNT": "New Account",
            "LOGIN_LOGIN": "Log in",
            "LOGIN_RESET": "Reset Password",
            "LOGIN_CANCEL": "Cancel",
            "ACCOUNT_HEADING": "My Account",
            "ACCOUNT_CHANGE_PASSWORD": "Change Password",
            "ACCOUNT_OLD_PASSWORD": "Old Password",
            "ACCOUNT_NEW_PASSWORD": "New Password",
            "ACCOUNT_CONFIRM_PASSWORD": "Confirm Password",
            "ACCOUNT_LOGOUT": "Log out",
            "SCREENING_REQUIRED": "All fields are required",
            "SCREENING_DESCRIBE": "Please describe",
            "SCREENING_FIRSTNAME": "First Name",
            "SCREENING_SURNAME": "Surname",
            "SCREENING_MALE": "Male",
            "SCREENING_FEMALE": "Female",
            "SCREENING_AGE": "Age (years)",
            "SCREENING_AGE_RANGE": "Only adults older than 18 are eligible",
            "SCREENING_DOB": "Day of birth",
            "SCREENING_DOB_RANGE": "Between 1 and 31",
            "SCREENING_MOB": "Month",
            "SCREENING_YOB": "Year of birth",
            "SCREENING_WEIGHT": "Weight (kg)",
            "SCREENING_WEIGHT_ERROR": "Please enter your weight in kg",
            "SCREENING_HEIGHT": "Height (cm)",
            "SCREENING_HEIGHT_ERROR": "Please enter your height in cm",
            "SCREENING_HEIGHT_FEET": "feet",
            "SCREENING_HEIGHT_FEET_ERROR": "Please enter your height in feet and inches",
            "SCREENING_HEIGHT_INCHES": "in",
            "SCREENING_HEIGHT_INCHES_ERROR": "Please enter your height in feet and inches",
            "SCREENING_OCCUPATION": "Occupation",
            "SCREENING_EDUCATION": "Education",
            "SCREENING_RECRUITMENT": "How did you hear about this study?",
            "SCREENING_CONDITIONS": "Have you ever had any of the following?",
            "SCREENING_LACTOSE": "Lactose intolerance?",
            "SCREENING_ALLERGY": "Any other food allergy?",
            "SCREENING_DIABETES": "Diabetes?",
            "SCREENING_VEGAN": "I am vegan",
            "SCREENING_PREGNANT": "I am currently pregnant or lactating",
            "SCREENING_METABOLIC": "Any metabolic disorder?",
            "SCREENING_ILLNESSES": "Any other conditions or illnesses?",
            "SCREENING_OTHER": "Other Information",
            "SCREENING_NOTGOODHEALTH": "I don't consider myself to be in good health condition",
            "SCREENING_CONSULTATION": "I am receiving face-to-face nutritional services",
            "SCREENING_DIETREQ": "I have special dietary requirements not already noted above",
            "SCREENING_LIVINGUK": "I do NOT live in the UK",
            "SCREENING_MEDICATION": "I am currently taking a prescription medication",
            "SCREENING_MEDICALINFO": "I have other medical information that I think may be of relevance for this study",
            "CONTINUE": "Continue",
            "PREFFQ_CURRENT_WEIGHT": "Current Weight (kg)",
            "PREFFQ_CURRENT_WEIGHT_STONES": "Stones",
            "PREFFQ_CURRENT_WEIGHT_POUNDS": "Pounds",
            "PREFFQ_WEIGHT_TITLE": "Please weigh yourself",
            "PREFFQ_OCC_PA_LEVEL": "Occupational Physical Activity Level",
            "PREFFQ_NON_OCC_PA_LEVEL": "Non-occupational Physical Activity Level",
            "FFQ_PORTION": "Portion:",
            "FFQ_HOWMUCH": "How much do you have each time?",
            "HELP_TAB_QUESTIONNAIRE": "Questionnaire",
            "HELP_TAB_QUESTIONNAIRE_TEXT": "The diet questionnaire contains 157 food items. It will take around 20 minutes to complete. Please try to complete all the items in one session. If you need to leave your computer or close your browser during the session, your responses will be saved. Please login within 24 hours to complete the remainder of the questions.",
            "HELP_TAB_TIMELINE": "Timeline",
            "HELP_TAB_TIMELINE_TEXT": "You will be asked to complete three online Food Frequency Questionnaires over the 12-week period. Each questionnaire lists commonly consumed foods and you will be asked to select the foods you regularly consume, their portion size and how often you eat them. Each questionnaire takes approximately 20 minutes to complete.",
            "HELP_TAB_CONTACT": "Contact",
            "HELP_TAB_CONTACT_TEXT": "If you would like any more information on this study, please feel free to contact us via the e-mail eatwelluk@reading.ac.uk",
            "INFO_TAB_INFO": "Information",
            "INFO_TAB_PIS": "Please download and read the Participant Information Sheet",
            "INFO_TAB_CONSENT": "Please download and read the Consent Form",
            "MESSAGE_WAIT": "Your next questionnaire will be available on the ",
            "MESSAGE_TODAY_COMPLETED": "Thank you. You have completed your FFQ today.",
            "MESSAGE_SURVEY_INSTRUCTIONS": "You have completed the diet questionnaire. The following usability survey takes only 1 minute.",
            "MESSAGE_FEEDBACK_INSTRUCTIONS": "You have completed all food questionnaires. The following feedback questionnaire takes only 1 minute.",
            "MESSAGE_FFQ_INSTRUCTIONS_1": "The diet questionnaire contains 157 food items. It will take around 20 minutes to complete. Please try to complete all the items in one session. If you need to leave your computer or close your browser during the session, your responses will be saved. Please login within 24 hours to complete the remainder of the questions.",
            "MESSAGE_FFQ_INSTRUCTIONS_2": "We are only interested in what you have had in the last month.  For any food items that you have not had in the last month, you can skip that item (press the 'Not in the last month' button). For items that you have had, please indicate how frequently you had that food in the last month along with the portion size. You are allowed to return to the previous food items and change your answers using the back button (bottom left corner).",
            "MESSAGE_SURVEY_COMPLETED": "Thank you for submitting the survey! Your next questionnaire will be available on the ",
            "MESSAGE_COMPLETED": "You have completed all questionnaires. We thank you for your participation in this study.",
            "MESSAGE_THANKYOU": "Thank you!",
            "MESSAGE_SCREENING_WAITING": "Your information was received. A researcher will e-mail you once they have assessed your eligibility to participate in this study. If you would like any more information, please feel free to contact us via the e-mail eatwelluk@reading.ac.uk",
            "MESSAGE_SCREENING_REJECTED": "Based on the information you have provided, we are sorry to tell you that you are not eligible to participate in this particular study. If you would like any more information about this decision, please feel free to contact us via the e-mail eatwelluk@reading.ac.uk. Thank you for your time and collaboration.",
            "MESSAGE_REPORT_BUTTON": "View Nutrition Advice",
            "MESSAGE_REPORT_FACETOFACE": "You will receive your feedback during the consultation with the nutritionist. Contact eatwellq8@reading.ac.uk for confirming your appointment.",
            "MESSAGE_BAECKE": "Physical Activity Questionnaire",
            "MESSAGE_BAECKE_INSTRUCTIONS": "You will be presented with 16 questions regarding your physical activities. This first questionnaire last arounds 3 minutes.",
            "CONSENT_HEADING": "Consent",
            "CONSENT_AGREE": "I agree",
            "CONSENT_DISAGREE": "I disagree",
            "CONSENT_MESSAGE": "In order to proceed to the study, it is a requirement that you read the consent form and agree with its terms and conditions.",
            "CONSENT_1": "I have received and read the accompanying Information Sheet relating to the project entitled 'Evaluation of the Effectiveness of Online Nutrition Advice in the UK'.",
            "CONSENT_2": "I agree to the arrangements described in the Information Sheet in so far as they relate to my participation.",
            "CONSENT_3": "I understand that participation is entirely voluntary and that I have the right to withdraw from the study at any time without giving reason, and that this will be without detriment to any care or services I may be receiving or may receive in the future.",
            "CONSENT_4": "I agree to receive e-mails from the research team and to the automatic collection of timestamps, browser type and screen size of my computer device during the use of the study website.",
            "CONSENT_5": "This project has been subject to ethical review, according to the procedures specified by the University of Reading Research Ethics Committee, School of Chemistry, Food and Pharmacy, and has been given a favourable ethical opinion for conduct (study 13/17).",
            "CONSENT_6": "I was able to access downloadable copies of this Consent Form and of the accompanying Information Sheet.",
            "REPORT_ADVICE_TITLE": "Advice",
            "REPORT_ADVICE_GREETING": "Hi",
            "REPORT_ADVICE_INTRO_PERSONALISED_1": "This is your personalised report.",
            "REPORT_ADVICE_INTRO_PERSONALISED_INCREASE": "CONGRATULATIONS! You have improved your score in the following component: ",
            "REPORT_ADVICE_INTRO_PERSONALISED_DECREASE": "Careful! You have decreased your score of ",
            "REPORT_ADVICE_INTRO_PERSONALISED_NEXT": "The following messages present the most important diet changes recommended for you.",
            "REPORT_ADVICE_INTRO_CONTROL": "The following messages present nutrition recommendations based on the UK guidelines.",
            "REPORT_ADVICE_INTRO_CONTROL_2": "Your personalised nutrition advice report which is based on your dietary intake will be available to you at the end of the 12-week study.",
            "REPORT_ADVICE_WEIGHT": "Weight",
            "REPORT_ADVICE_WEIGHT_RANGE": "Ideal range",
            "REPORT_ADVICE_WEIGHT_CURRENT": "Current weight",
            "REPORT_ADVICE_WEIGHT_CLASS": "Classification",
            "REPORT_ADVICE_WEIGHT_CLASS_HEALTHY": "Healthy Weight",
            "REPORT_ADVICE_WEIGHT_CLASS_UNDERWEIGHT": "Underweight",
            "REPORT_ADVICE_WEIGHT_CLASS_OVERWEIGHT": "Overweight",
            "REPORT_ADVICE_WEIGHT_CLASS_OBESE": "Obese",
            "REPORT_ADVICE_PA": "Physical activity",
            "REPORT_ADVICE_PA_OVERALL": "Overall activity index",
            "REPORT_ADVICE_PA_WORK": "Work activity index",
            "REPORT_ADVICE_PA_SPORTS": "Sports activity index",
            "REPORT_ADVICE_PA_LEISURE": "Leisure (non-sport) activity index",
            "REPORT_ADVICE_CONTRIBUTORS": "Based on your questionnaire, these are the food items that contributed the most to this component:",
            "REPORT_PROGRESS_TITLE": "Your progress",
            "REPORT_HES": "Healthy Eating Score",
            "REPORT_HES_DEFINITION": "The Healthy Eating Score is a score used to measure the quality of your diet compared to the international guidelines. The maximum score is 100. The higher, the better.",
            "REPORT_FOODS_REC": "Recommended Foods",
            "REPORT_FOODS_REC_SECOND_SENTENCE": " (The higher the better)",
            "REPORT_FOODS_LIMIT": "Foods to Limit",
            "REPORT_FOODS_LIMIT_SECOND_SENTENCE": "(The lower the better)",
            "REPORT_NUTRIENTS_REC": "Recommended Nutrients",
            "REPORT_NUTRIENTS_LIMIT": "Nutrients to limit",
            "REPORT_INTAKE": "Current Intake",
            "REPORT_ACTION": "Action",
            "REPORT_HEALTH": "Health Benefit",
            "REPORT_PROGRESS_INTRO": "This section presents a summary of your progress. For each component, you receive a score between 0 and 100. Foods are divided into two groups: (1) recommended foods (the more the better, and (2) foods to limit (less is better). Your overall Healthy Eating Score is a combination of your scores from these two groups."
        });


        // Tell the module what language to use by default
        $translateProvider.preferredLanguage('en_UK');
        $translateProvider.useSanitizeValueStrategy('escape');

    });
