import * as  functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import {extractData} from "./extractDataHelper";
import {FBData} from "./utilities/FBData";
import {EventStatus} from "./utilities/EntityTypes";

export const onEvenCreated_setUserToEvent = functions.database
    .ref('events/{pushId}')
    .onCreate(async event => {

        //extract relevant data and add log
        const fbData: FBData = extractData(event);
        console.log(`An Event record was saved to database:`);
        console.log(fbData);

        const eventEntity: any = {
            key: fbData.data.key,
            eventKey: fbData.data.key,
            initials: fbData.data.initials,
            description: fbData.data.description,
            isActive: false,
            isPast: false,
            startDate: fbData.data.startDate,
            creatorKey: fbData.data.creatorKey,
            creatorName: fbData.data.creatorName,
            title: fbData.data.title
        };

        //register all invited users
        const participatesDetails = fbData.data.participatesDetails;
        if (participatesDetails) {
            admin.database()
                .ref(`userProfile`)
                .once('value')
                .then(snapshot => {
                    let users = snapshot.val();
                    if (users) {
                        console.log("found Users in userProfile node");
                        console.log(JSON.stringify(users));

                        participatesDetails.forEach(pd => {
                            console.log(`Set new record for Participant ${pd.name}-${pd.phone}`);
                            console.log(JSON.stringify(pd));

                            //extract the users data
                            users = Object.keys(users).map(k => users[k]);
                            const user = users.find(u => {
                                const phone = fixPhoneNumber(u.phone); //id is only the digits
                                return phone === pd.id;
                            });

                            if (user) {
                                console.log(`set event ${fbData.data.key} to user ${user.key}`);
                                console.log(JSON.stringify(user));

                                //add the user key
                                eventEntity.userKey = user.key;
                                eventEntity.isVipUser = pd.isVip;
                                eventEntity.status = EventStatus.invited;

                                admin.database()
                                    .ref(`userToEvent/${user.key}/${fbData.data.key}`)
                                    .update(eventEntity).then(e=>{
                                        console.log(`User to event mapping was created!`);
                                        console.log(JSON.stringify(e));
                                    });
                            }
                            else {
                                console.log(`set PENDING event ${fbData.data.key} to user ${pd.name}:${pd.id}`);

                                //add the user phone "id"
                                eventEntity.userPhone = pd.id;
                                eventEntity.isVipUser = pd.isVip;

                                admin.database()
                                    .ref(`userPendingEvents/${pd.id}/${fbData.data.key}`)
                                    .update(eventEntity).then(e=>{
                                    console.log(`Pending user event mapping was created!`);
                                    console.log(JSON.stringify(e));
                                });
                            }

                        });
                    }
                });
        }

        eventEntity.userKey = fbData.data.creatorKey;
        //remove the vip flag if exist for the owner of the event
        eventEntity.isVipUser = null;
        eventEntity.status = EventStatus.own;

        console.log(`set own event ${fbData.data.key} to CURRENT user ${fbData.userId}`);
        // writing to the Firebase Realtime Database.
        await admin.database()
            .ref(`userToEvent/${fbData.userId}`)
            .child(fbData.data.key)
            .set(eventEntity).then(e=>{
                console.log(`event was updated!`);
                console.log(JSON.stringify(e));
            });

        return eventEntity;
    });


export const onEvenUpdated_setUserToEventStatus = functions.database
    .ref('events/{pushId}')
    .onUpdate(async event => {

        //extract relevant data and add log
        const fbData: FBData = extractData(event);
        console.log(`An Event record was updated:`);
        console.log(fbData);

        //get all events entities and update their status
        return await admin.database()
            .ref(`userToEvent`)
            .once('value')
            .then(ute => {

                if (ute) {
                    console.log(`Users events list mapping:`);
                    console.log(JSON.stringify(ute));

                    const eventsToUpdate = Object.keys(ute).map(k => {
                        if (k === event.data.key) {
                            return ute[k];
                        }
                        return null;
                    }).filter(e => e);

                    eventsToUpdate.forEach(e => {
                        console.log(`update users events mapping for user ${e.userKey}:`);
                        console.log(JSON.stringify(ute));

                        e.isActive = fbData.data.isActive;
                        e.isPast = fbData.data.isPast;

                        //update the event details to "userToEvent" node
                        admin.database()
                            .ref(`userToEvent/${e.userKey}`)
                            .child(e.key)
                            .set(e).then(e => {
                            console.log(`user event mapping was updated!`);
                            console.log(JSON.stringify(e));
                        });
                    });
                    return '';
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
