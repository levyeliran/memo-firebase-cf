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
        console.log(`An Event record was saved to database:`);
        console.log(fbData);

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
                                const phone = u.phone
                                    .replace('(', '')
                                    .replace(')', '')
                                    .replace('-', '')
                                    .replace(' ', ''); //id is only the digits
                                return phone === pd.id;
                            });

                            const eventEntity:any = {
                                key: fbData.data.key,
                                userKey: user.key,
                                initials: fbData.data.initials,
                                isActive: false,
                                isPast: false,
                                startDate: fbData.data.startDate,
                                status: EventStatus.invited
                            };

                            if (user) {
                                console.log(`set event ${fbData.data.key} to user ${user.key}`);
                                console.log(JSON.stringify(user));

                                //add the user key
                                eventEntity.userKey = user.key;

                                admin.database()
                                    .ref(`userToEvent/${user.key}/${fbData.data.key}`)
                                    .update(eventEntity);
                            }
                            else {
                                console.log(`set PENDING event ${fbData.data.key} to user ${pd.name}:${pd.id}`);

                                //add the user phone "id"
                                eventEntity.userPhone = pd.id;

                                admin.database()
                                    .ref(`userPendingEvents/${pd.id}/${fbData.data.key}`)
                                    .update(eventEntity);
                            }

                        });
                    }
                });
        }

        const entity = {
            eventKey: fbData.data.key,
            status: EventStatus.own
        };

        console.log(`set own event ${fbData.data.key} to CURRENT user ${fbData.userId}`);
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
