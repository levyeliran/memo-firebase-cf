import * as  functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import {isNewObject, extractData} from "./extractDataHelper";
import {FBData} from "./utilities/FBData";
import {EventStatus} from "./utilities/EntityTypes";


//to write into db, use admin
//const snapshot = await admin.database().ref('messages').push({ original: original })
export const createEventListener_setUserToEvent = functions.database
    .ref('events/{pushId}')
    .onWrite(async event => {

        // Only edit data when it is first created.
        if (!isNewObject(event)) {
            return null;
        }

        //extract relevant data and add log
        const fbData:FBData = extractData(event);
        console.log(fbData);

        const entity = {
            eventKey:fbData.data.key,
            status: EventStatus.own
        };

        // writing to the Firebase Realtime Database.
        await admin.database()
            .ref(`userToEvent/${fbData.userId}`)
            .child(fbData.data.key)
            .set(entity);

        return entity;

    });


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
    });