#!/bin/bash

# This script is used to set up the database layout and the first user.

cd $(dirname "$0")


echo -e "Applying Schemes"
# modify schema
modifySchema(){
    curl -s -S -X PUT \
        -H "X-Parse-Application-Id: $eNutri_APP_ID" \
        -H "X-Parse-Master-Key: $eNutri_MASTER_KEY" \
        -H "Content-Type: application/json" \
        -d "
            {
                \"className\": \"$1\",
                \"fields\": $2,
                \"classLevelPermissions\": $3
            }" \
        $eNutri_WEB_URL/parse/schemas/$1 > /dev/null

}

addSchema() {
    curl -s -S -X POST \
        -H "X-Parse-Application-Id: $eNutri_APP_ID" \
        -H "X-Parse-Master-Key: $eNutri_MASTER_KEY" \
        -H "Content-Type: application/json" \
        -d "
            {
                \"className\": \"$1\",
                \"fields\": $2,
                \"classLevelPermissions\":{
                    \"find\": {
                        \"requiresAuthentication\": true
                    },
                    \"count\": {
                        \"requiresAuthentication\": true
                    },
                    \"get\": {
                        \"requiresAuthentication\": true
                    },
                    \"create\": {
                        \"*\": true
                    },
                    \"update\": {
                        \"requiresAuthentication\": true
                    },
                    \"delete\": {},
                    \"addField\": {}
                }
            }" \
        $eNutri_WEB_URL/parse/schemas/$1 > /dev/null
}

# Add Schemas for everything
addSchema 'State' '{
    "consentResponse":{
        "type":"String"
    },
    "consentTimestamp":{
        "type":"Number"
    },
    "screeningComplete":{
        "type":"Boolean"
    },
    "screeningAccepted":{
        "type":"Boolean"
    },
    "surveyComplete":{
        "type":"Boolean"
    },
    "surveySUS":{
        "type":"Number"
    },
    "FFQCompleteCount":{
        "type":"Number"
    },
    "firstFFQCompletionDate":{
        "type":"String"
    },
    "firstFFQCompletionTimestamp":{
        "type":"Number"
    },
    "lastFFQCompletionDate":{
        "type":"String"
    },
    "lastFFQCompletionTimestamp":{
        "type":"Number"
    },
    "lastFFQCompleteId":{
        "type":"Number"
    },
    "nextFFQDueDate":{
        "type":"String"
    },
    "feedbackComplete":{
        "type":"Boolean"
    },
    "ffqStartedCount":{
        "type":"Number"
    }
}'
addSchema 'Utm' '{
    "source":{
        "type":"String"
    },
    "medium":{
        "type":"String"
    },
    "campaign":{
        "type":"String"
    },
    "term":{
        "type":"String"
    },
    "content":{
        "type":"String"
    }
}'
addSchema 'Screening' '{
    "screeningDate":{
        "type":"String"
    },
    "screeningTimestamp":{
        "type":"Number"
    },
    "firstname":{
        "type":"String"
    },
    "surname":{
        "type":"String"
    },
    "gender":{
        "type":"String"
    },
    "age":{
        "type":"Number"
    },
    "height":{
        "type":"Number"
    },
    "education":{
        "type":"String"
    },
    "notgoodhealth":{
        "type":"Boolean"
    },
    "notgoodhealthDesc":{
        "type":"String"
    },
    "lactose":{
        "type":"Boolean"
    },
    "foodallergy":{
        "type":"Boolean"
    },
    "foodallergyDesc":{
        "type":"String"
    },
    "diabetes":{
        "type":"Boolean"
    },
    "methabolicdisorder":{
        "type":"Boolean"
    },
    "methabolicdisorderDesc":{
        "type":"String"
    },
    "illnesses":{
        "type":"Boolean"
    },
    "illnessesDesc":{
        "type":"String"
    },
    "medication":{
        "type":"Boolean"
    },
    "medicationDesc":{
        "type":"String"
    },
    "medicalinformation":{
        "type":"Boolean"
    },
    "medicalinformationDesc":{
        "type":"String"
    },
    "vegan":{
        "type":"Boolean"
    },
    "dietaryreq":{
        "type":"Boolean"
    },
    "dietaryreqDesc":{
        "type":"String"
    },
    "recruitment":{
        "type":"String"
    },
    "pregnant":{
        "type":"Boolean"
    },
    "livinguk":{
        "type":"Boolean"
    },
    "consultation":{
        "type":"Boolean"
    }
}'
addSchema 'Feedback' '{
    "reportDate":{
        "type":"String"
    },
    "answers":{
        "type":"Array"
    },
    "user61":{
        "type":"Array"
    },
    "user71":{
        "type":"Array"
    },
    "user81":{
        "type":"Array"
    }
}'
addSchema 'Survey' '{
    "surveySUS":{
        "type":"Number"
    },
    "answers":{
        "type":"Array"
    },
    "reportDate":{
        "type":"String"
    },
    "problems":{
        "type":"String"
    }
}'
addSchema 'Baecke' '{
    "answers":{
        "type":"Object"
    },
    "work":{
        "type":"Number"
    },
    "sports":{
        "type":"Number"
    },
    "leisure":{
        "type":"Number"
    },
    "overall":{
        "type":"Number"
    }
}'
addSchema 'Nutrients' '{
    "results":{
        "type":"Object"
    }
}'
addSchema 'Ffq' '{
    "preFFQTimestamp":{
        "type": "Number"
    },
    "FFQStartTimestamp":{
        "type": "Number"
    },
    "FFQComplete":{
        "type": "Boolean"
    },
    "lastFoodItem":{
        "type": "Number"
    },
    "id":{
        "type": "Number"
    },
    "baecke":{
        "type": "Pointer",
        "targetClass": "Baecke",
        "required": false
    },
    "nutrients":{
        "type": "Pointer",
        "targetClass": "Nutrients",
        "required": false
    },
    "results":{
        "type":"Array"
    },
    "currentWeight":{
        "type": "Number"
    },
    "weightUnit":{
        "type": "String"
    },
    "preFFQComplete":{
        "type": "Boolean"
    },
    "preFFQDate":{
        "type": "String"
    },
    "appName":{
        "type": "String"
    },
    "appCodeName":{
        "type": "String"
    },
    "appVersion":{
        "type": "String"
    },
    "userAgent":{
        "type": "String"
    },
    "platform":{
        "type": "String"
    },
    "product":{
        "type": "String"
    },
    "language":{
        "type": "String"
    },
    "vendor":{
        "type": "String"
    },
    "mostLikelyBrowser":{
        "type": "String"
    },
    "screenWidth":{
        "type": "Number"
    },
    "screenAvailWidth":{
        "type": "Number"
    },
    "screenHeight":{
        "type": "Number"
    },
    "screenAvailHeight":{
        "type": "Number"
    },
    "FFQCompletionTimestamp":{
        "type": "Number"
    },
    "FFQCompletionDate":{
        "type": "String"
    }
}'
addSchema 'Report' '{
    "id":{
        "type":"Number"
    },
    "ffqId":{
        "type":"Number"
    },
    "currentWeight":{
        "type":"Number"
    },
    "weightUnit":{
        "type":"String"
    },
    "reportDate":{
        "type":"String"
    },
    "baecke":{
        "type": "Pointer",
        "targetClass": "Baecke",
        "required": false
    },
    "nutrients":{
        "type": "Pointer",
        "targetClass": "Nutrients",
        "required": false
    },
    "results":{
        "type":"Array"
    }
}'

# These classes already exist and we want special CLPs for them
modifySchema '_User' '{
    "group":{
        "type":"String"
    },
    "report":{
        "type":"String"
    },
    "state":{
        "type": "Pointer",
        "targetClass": "State",
        "required": false
    },
    "utm":{
        "type": "Pointer",
        "targetClass": "Utm",
        "required": false
    },
    "screening":{
        "type": "Pointer",
        "targetClass": "Screening",
        "required": false
    },
    "feedback":{
        "type": "Pointer",
        "targetClass": "Feedback",
        "required": false
    },
    "survey":{
        "type": "Pointer",
        "targetClass": "Survey",
        "required": false
    },
    "ffq1":{
        "type": "Pointer",
        "targetClass": "Ffq",
        "required": false
    },
    "ffq2":{
        "type": "Pointer",
        "targetClass": "Ffq",
        "required": false
    },
    "ffq3":{
        "type": "Pointer",
        "targetClass": "Ffq",
        "required": false
    },
    "report1":{
        "type": "Pointer",
        "targetClass": "Report",
        "required": false
    },
    "report2":{
        "type": "Pointer",
        "targetClass": "Report",
        "required": false
    },
    "report3":{
        "type": "Pointer",
        "targetClass": "Report",
        "required": false
    }
}' '{
    "find": {
        "*": true
    },
    "count": {
        "*": true
    },
    "get": {
        "*": true
    },
    "create": {
        "*": true
    },
    "update": {
        "*": true
    },
    "delete": {},
    "addField": {}
}'
modifySchema '_Role' '{}' '{
    "find": {
        "*": true
    },
    "count": {
        "*": true
    },
    "get": {
        "*": true
    },
    "create": {},
    "update": {},
    "delete": {},
    "addField": {}
}'

echo -e "Creating Research Account"
# create user

createObject() {
    curl -s -S -X POST \
        -H "X-Parse-Application-Id: $eNutri_APP_ID" \
        -H "X-Parse-Master-Key: $eNutri_MASTER_KEY" \
        -H "Content-Type: application/json" \
        -d "$2" \
        $eNutri_WEB_URL/parse/classes/$1 \
        | jq -r '.objectId'

}

NUTRIENTS1=$(createObject 'Nutrients' '{
        "results":{}
    }')
NUTRIENTS2=$(createObject 'Nutrients' '{
        "results":{}
    }')
NUTRIENTS3=$(createObject 'Nutrients' '{
        "results":{}
    }')
NUTRIENTS4=$(createObject 'Nutrients' '{
        "results":{}
    }')
NUTRIENTS5=$(createObject 'Nutrients' '{
        "results":{}
    }')
NUTRIENTS6=$(createObject 'Nutrients' '{
        "results":{}
    }')
    
BAECKE1=$(createObject 'Baecke' '{
        "answers":{}
    }')
BAECKE2=$(createObject 'Baecke' '{
        "answers":{}
    }')
BAECKE3=$(createObject 'Baecke' '{
        "answers":{}
    }')
BAECKE4=$(createObject 'Baecke' '{
        "answers":{}
    }')
BAECKE5=$(createObject 'Baecke' '{
        "answers":{}
    }')
BAECKE6=$(createObject 'Baecke' '{
        "answers":{}
    }')

FFQ1=$(createObject "Ffq" "{
        \"baecke\":{
            \"__type\": \"Pointer\",
            \"className\": \"Baecke\",
            \"objectId\": \"$BAECKE1\"
            },
        \"nutrients\":{
            \"__type\": \"Pointer\",
            \"className\": \"Nutrients\",
            \"objectId\": \"$NUTRIENTS1\"
            },
        \"results\": []
    }")
FFQ2=$(createObject "Ffq" "{
        \"baecke\":{
            \"__type\": \"Pointer\",
            \"className\": \"Baecke\",
            \"objectId\": \"$BAECKE2\"
            },
        \"nutrients\":{
            \"__type\": \"Pointer\",
            \"className\": \"Nutrients\",
            \"objectId\": \"$NUTRIENTS2\"
            },
        \"results\": []
    }")
FFQ3=$(createObject "Ffq" "{
        \"baecke\":{
            \"__type\": \"Pointer\",
            \"className\": \"Baecke\",
            \"objectId\": \"$BAECKE3\"
            },
        \"nutrients\":{
            \"__type\": \"Pointer\",
            \"className\": \"Nutrients\",
            \"objectId\": \"$NUTRIENTS3\"
            },
        \"results\": []
    }")

REPORT1=$(createObject "Report" "{
        \"ffqId\": -1,
        \"baecke\":{
            \"__type\": \"Pointer\",
            \"className\": \"Baecke\",
            \"objectId\": \"$BAECKE4\"
            },
        \"nutrients\":{
            \"__type\": \"Pointer\",
            \"className\": \"Nutrients\",
            \"objectId\": \"$NUTRIENTS4\"
            },
        \"results\": []
    }")
REPORT2=$(createObject "Report" "{
        \"ffqId\": -1,
        \"baecke\":{
            \"__type\": \"Pointer\",
            \"className\": \"Baecke\",
            \"objectId\": \"$BAECKE5\"
            },
        \"nutrients\":{
            \"__type\": \"Pointer\",
            \"className\": \"Nutrients\",
            \"objectId\": \"$NUTRIENTS5\"
            },
        \"results\": []
    }")
REPORT3=$(createObject "Report" "{
        \"ffqId\": -1,
        \"baecke\":{
            \"__type\": \"Pointer\",
            \"className\": \"Baecke\",
            \"objectId\": \"$BAECKE6\"
            },
        \"nutrients\":{
            \"__type\": \"Pointer\",
            \"className\": \"Nutrients\",
            \"objectId\": \"$NUTRIENTS6\"
            },
        \"results\": []
    }")

STATE=$(createObject 'State' '{
    "consentResponse":"",
    "screeningComplete":false,
    "screeningAccepted":false,
    "surveyComplete":false,
    "FFQCompleteCount":0,
    "feedbackComplete":false,
    "ffqStartedCount":0
    }')
UTM=$(createObject 'Utm' '{
    "source":"",
    "medium":"",
    "campaign":"",
    "term":"",
    "content":""
    }')
SCREENING=$(createObject 'Screening' '{
    "firstname":"",
    "surname":"",
    "gender":"",
    "age":0,
    "height":0,
    "education":"",
    "notgoodhealth":false,
    "notgoodhealthDesc":"",
    "lactose":false,
    "foodallergy":false,
    "foodallergyDesc":"",
    "diabetes":false,
    "methabolicdisorder":false,
    "methabolicdisorderDesc":"",
    "illnesses":false,
    "illnessesDesc":"",
    "medication":false,
    "medicationDesc":"",
    "medicalinformation":false,
    "medicalinformationDesc":"",
    "vegan":false,
    "dietaryreq":false,
    "dietaryreqDesc":"",
    "recruitment":""
    }')
FEEDBACK=$(createObject 'Feedback' '{
    "answers":[]
    }')
SURVEY=$(createObject 'Survey' '{
    "answers":[],
    "surveySUS":0
    }')


# Add the research user "admin"
RESEARCHER=$(curl -X POST \
    -H "X-Parse-Application-Id: $eNutri_APP_ID" \
    -H "X-Parse-Master-Key: $eNutri_MASTER_KEY" \
    -H "X-Parse-Revocable-Session: 1" \
    -H "Content-Type: application/json" \
    -d "{
            \"username\":\"admin@admin.com\",
            \"password\":\"admin\",
            \"group\":\"researcher\",
            \"state\":{
                \"__type\": \"Pointer\",
                \"className\": \"State\",
                \"objectId\": \"$STATE\"
            },
            \"utm\":{
                \"__type\": \"Pointer\",
                \"className\": \"Utm\",
                \"objectId\": \"$UTM\"
            },
            \"screening\":{
                \"__type\": \"Pointer\",
                \"className\": \"Screening\",
                \"objectId\": \"$SCREENING\"
            },
            \"feedback\":{
                \"__type\": \"Pointer\",
                \"className\": \"Feedback\",
                \"objectId\": \"$FEEDBACK\"
            },
            \"survey\":{
                \"__type\": \"Pointer\",
                \"className\": \"Survey\",
                \"objectId\": \"$SURVEY\"
            },
            \"ffq1\":{
                \"__type\": \"Pointer\",
                \"className\": \"Ffq\",
                \"objectId\": \"$FFQ1\"
            },
            \"ffq2\":{
                \"__type\": \"Pointer\",
                \"className\": \"Ffq\",
                \"objectId\": \"$FFQ2\"
            },
            \"ffq3\":{
                \"__type\": \"Pointer\",
                \"className\": \"Ffq\",
                \"objectId\": \"$FFQ3\"
            },
            \"report1\":{
                \"__type\": \"Pointer\",
                \"className\": \"Report\",
                \"objectId\": \"$REPORT1\"
            },
            \"report2\":{
                \"__type\": \"Pointer\",
                \"className\": \"Report\",
                \"objectId\": \"$REPORT2\"
            },
            \"report3\":{
                \"__type\": \"Pointer\",
                \"className\": \"Report\",
                \"objectId\": \"$REPORT3\"
            }
        }" \
    $eNutri_WEB_URL/parse/users \
    | jq -r '.objectId')

curl -X POST \
    -H "X-Parse-Application-Id: $eNutri_APP_ID" \
    -H "X-Parse-Master-Key: $eNutri_MASTER_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"researcher\",
        \"ACL\": {
          \"*\": {
            \"read\": true
          }
        },
        \"users\": {
          \"__op\": \"AddRelation\",
          \"objects\": [
            {
              \"__type\": \"Pointer\",
              \"className\": \"_User\",
              \"objectId\": \"$RESEARCHER\"
            }
          ]
        }
      }" \
    $eNutri_WEB_URL/parse/roles


exit 0
