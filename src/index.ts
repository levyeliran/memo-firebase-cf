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
            const animation = eventAnimation.val()
            if (animation) {

                console.log(`event animation keys:`);
                console.log(JSON.stringify(Object.keys(animation)));

                console.log(`event animation:`);
                console.log(JSON.stringify(animation));

                console.log(`event animation - style:`);
                console.log(JSON.stringify(animation.style));

                console.log(`event animation - script:`);
                console.log(JSON.stringify(animation.script));

                console.log(`event animation - generalHTML:`);
                console.log(JSON.stringify(animation.generalHTML));

                console.log(`Return 200 OK, response body(animationBodyHTML):`);
                console.log(JSON.stringify(animation.animationBodyHTML));

                //send the result to the app iFrame - therefore we need to create a valid html document
                res.status(200).send(animation.animationBodyHTML);
            }
            else {
                //handle here
                console.log(`Return 200 ERROR`);
                res.status(200).send('');
            }
        });
});

//init the firebase  module
admin.initializeApp(functions.config().firebase);


