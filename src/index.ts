import * as admin from 'firebase-admin'
import * as  functions from 'firebase-functions'
import {onEvenCreated_setUserToEvent, onEvenUpdated_setUserToEventStatus} from "./eventFunctions";
import {onPhotoAdded_updateThumbnailURL,onPhotoUploaded_generatePhotoThumbnail
} from "./photoFunctions";
import {onUserCreated_registerPendingEvents} from "./userFunctions";
import {onEvenAnimationStatusCreated_createAnimation} from "./animationFunctions";

exports.funcGroup = {
    //events listeners
    onEvenCreated_setUserToEvent: onEvenCreated_setUserToEvent,
    onEvenUpdated_setUserToEventStatus: onEvenUpdated_setUserToEventStatus,

    //photos listeners
    onPhotoAdded_updateThumbnailURL: onPhotoAdded_updateThumbnailURL,
    onPhotoUploaded_generatePhotoThumbnail: onPhotoUploaded_generatePhotoThumbnail,

    //users listeners
    onUserCreated_registerPendingEvents: onUserCreated_registerPendingEvents,

    //animation listeners
    onEvenAnimationStatusCreated_createAnimation: onEvenAnimationStatusCreated_createAnimation
};

//animation hosting redirection
/*restfull api*/
/*for animation config as api*/
//https://www.skcript.com/svr/creating-restful-api-firebase/
exports.animation = functions.https.onRequest((req, res) => {

    //get the animation current
    //get the new animation
    console.log('An animation request has triggered!');
    console.log('request parameters: ');
    console.log(JSON.stringify(req.query));

    console.log('fetch the animation: ');
    admin.database()
        .ref(`eventAnimation/${req.query.eventKey}`)
        .once('value')
        .then(eventAnimation => {
            let animation: any = {};
            if (eventAnimation) {
                console.log(`event animation:`);
                console.log(JSON.stringify(eventAnimation));

                //send the result to the app iFrame - therefore we need to create a valid html document
                res.status(200).send(
                    `<!DOCTYPE html>
                     <html lang="en">
                        <head>
                          <link rel="stylesheet"
                            href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css"
                            integrity="sha384-OHBBOqpYHNsIqQy8hL1U+8OXf9hH6QRxi0+EODezv82DfnZoV7qoHAZDwMwEJvSw"
                            crossorigin="anonymous">
                          <script  src="https://code.jquery.com/jquery-3.3.1.min.js"
                            integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
                            crossorigin="anonymous"></script>
                          <meta charset="UTF-8">
                          ${eventAnimation.style}
                          ${eventAnimation.script}
                        </head>
                        <body>
                        </body>
                     </html>`);

            }
            else {
                //handle here
                res.status(200).send('');
            }
        });
});



//init the firebase  module
admin.initializeApp(functions.config().firebase);


/*
firebase listeners:
onWrite(), which triggers when data is created, updated, or deleted in the Realtime Database.
onCreate(), which triggers when new data is created in the Realtime Database.
onUpdate(), which triggers when data is updated in the Realtime Database.
onDelete(), which triggers when data is deleted from the Realtime Database.


When deploying functions, you can target specific ones:

firebase deploy --only functions:function1
firebase deploy --only functions:function1,functions:function2
You can also group functions together into export groups in order to deploy multiple functions in a single command. For example, you can define groups within functions/index.js like this:

var functions = require('firebase-functions');

exports.groupA = {
    function1: functions.https.onRequest(...);
    function2: functions.database.ref('\path').onWrite(...);
}
exports.groupB = require('./groupB);
In this case, functions/groupB.js contains additional functions:

var functions = require('firebase-functions');
exports.function3 = functions.storage.object().onChange(...);
exports.function4 = functions.analytics.event('in_app_purchase').onLog(...);

You can deploy all the functions in a group by running:
firebase deploy --only functions:groupA

You can target a specific function within a group by running:
    firebase deploy --only functions:groupA.function1,groupB.function4
*/

