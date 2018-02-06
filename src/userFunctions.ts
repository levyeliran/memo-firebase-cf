import * as  functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import {extractData} from "./extractDataHelper";
import {FBData} from "./utilities/FBData";
import {EventStatus} from "./utilities/EntityTypes";


//to write into db, use admin
export const onUserCreated_registerPendingEvents = functions.database
    .ref('users/{pushId}')
    .onCreate(user => {

        //extract relevant data and add log
        const fbData: FBData = extractData(user);
        console.log(fbData);

        //get all pendings events by the user registered Email
        admin.database()
            .ref(`userPendingEvents/${fbData.data.email}`)
            .once('value')
            .then(pendingEvents => {
                if (pendingEvents) {
                    console.log(`pending events`);
                    console.log(JSON.stringify(pendingEvents));

                    // writing to the Firebase Realtime Database.
                    pendingEvents.forEach(pe => {
                        const entity = {
                            eventKey: pe.key,
                            status: EventStatus.invited
                        };

                        console.log(`write pending event ${pe.key} to user ${fbData.userId}`);
                        console.log(JSON.stringify(pendingEvents));

                        //write the event details to "userToEvent" node
                        admin.database()
                            .ref(`userToEvent/${fbData.userId}`)
                            .child(pe.eventkey)
                            .set(entity);
                    });

                    console.log(`remove pending events for user ${fbData.userId}, ${fbData.data.email}`);
                    //remove the current user node
                    admin.database()
                        .ref(`userPendingEvents/${fbData.data.email}`)
                        .remove()
                }
            });
    });