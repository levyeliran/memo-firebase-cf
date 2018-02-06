import * as  functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import {extractData} from "./extractDataHelper";
import {FBData} from "./utilities/FBData";
import {EventStatus} from "./utilities/EntityTypes";


//to write into db, use admin
export const onEvenCreated_setUserToEvent = functions.database
    .ref('events/{pushId}')
    .onCreate(async event => {

        //extract relevant data and add log
        const fbData: FBData = extractData(event);
        console.log(fbData);

        //register all invited users
        const participatesDetails = fbData.data.participatesDetails;
        if (participatesDetails) {
            admin.database()
                .ref(`users`)
                .once('value')
                .then(users => {
                    if (users) {
                        console.log("found Users");
                        console.log(users);
                        participatesDetails.forEach(pdEmail => {
                            const user = users.find(u => u.email === pdEmail);
                            if (user) {
                                console.log(`set event ${fbData.data.key} to users ${user.key}`);
                                console.log(user);
                                admin.database()
                                    .ref(`userToEvent/${user.key}/${fbData.data.key}`)
                                    .update({
                                        eventKey: fbData.data.key,
                                        status: EventStatus.invited
                                    })
                            }
                            else {
                                console.log(`set PENDING event ${fbData.data.key} to users ${user.key}`);
                                admin.database()
                                    .ref(`userPendingEvents/${pdEmail}/${fbData.data.key}`)
                                    .update({
                                        eventKey: fbData.data.key
                                    })
                            }

                        });
                    }
                });
        }

        const entity = {
            eventKey: fbData.data.key,
            status: EventStatus.own
        };

        console.log(`set own event ${fbData.data.key} to CURRENT users`);
        // writing to the Firebase Realtime Database.
        await admin.database()
            .ref(`userToEvent/${fbData.userId}`)
            .child(fbData.data.key)
            .set(entity);

        return entity;
    });

/*

export const onCreateEventListener_setEventToInvitedUsers = functions.database
    .ref('events/{pushId}')
    .onWrite(async event => {

    });


export const onCreateEventListener_sendNotifications = functions.database
    .ref('events/{pushId}')
    .onWrite(async event => {

    });

const onUpdateEventListener_updateInvitedUsersStatus = functions.database
    .ref('events/{pushId}')
    .onUpdate(async event => {
        //when app close the event - set status "rejected for all other users"
    });*/
