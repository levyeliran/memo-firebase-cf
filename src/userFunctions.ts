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

        const userPhone = fixPhoneNumber(fbData.data.phone);
        //get all pendings events by the user registered phone
        admin.database()
            .ref(`userPendingEvents/${userPhone}`)
            .once('value')
            .then(pendingEvents => {
                if (pendingEvents) {
                    console.log(`pending events`);
                    console.log(JSON.stringify(pendingEvents));

                    // writing to the Firebase Realtime Database.
                    pendingEvents.forEach(pe => {
                        const entity = {
                            key: pe.key,
                            userKey: fbData.data.key,
                            status: EventStatus.invited,
                            creatorKey: pe.creatorKey,
                            creatorName: pe.creatorName,
                            title: pe.title,
                            initials: pe.initials,
                            description: pe.description,
                            startDate: pe.startDate,
                            isActive: pe.isActive,
                            isPast: pe.isPast,
                            isVipUser: pe.isVipUser
                        };

                        console.log(`write pending event ${pe.key} to user ${fbData.userId}`);
                        console.log(JSON.stringify(pendingEvents));

                        //write the event details to "userToEvent" node
                        admin.database()
                            .ref(`userToEvent/${fbData.userId}`)
                            .child(pe.key)
                            .set(entity).then(e => {
                            console.log(`User to event mapping was created from pending events!`);
                            console.log(JSON.stringify(e));
                        });
                    });

                    console.log(`remove pending events for user ${fbData.userId}, ${fbData.data.email}, ${userPhone}`);

                    //remove the current user node
                    admin.database()
                        .ref(`userPendingEvents/${userPhone}`)
                        .remove().then(e => {
                        console.log(`User pending event was deleted!`);
                        console.log(JSON.stringify(e));
                    });
                }
            });
    });

function fixPhoneNumber(phone:string =''){
    return phone
        .replace('+972', '0')
        .replace('(972)', '0')
        .split('(').join('')
        .split(')').join('')
        .split('-').join('')
        .split(' ').join('')
        .split('+').join('')
        .split('_').join('')
        .split('.').join('')
}