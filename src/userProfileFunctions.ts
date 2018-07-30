import * as  functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import {extractData} from "./extractDataHelper";
import {FBData} from "./utilities/FBData";

//to write into db, use admin
export const onUserRegistered_setPendingEvents = functions.database
    .ref('userProfile/{pushId}')
    .onCreate(async userPro => {

        //extract relevant data and add log
        const fbData: FBData = extractData(userPro);
        console.log(`A User record was saved to database:`);
        console.log(fbData);

        const phone = fixPhoneNumber(fbData.data.phone); //id is only the digits

        return await admin.database()
            .ref(`userPendingEvents/${phone}`)
            .once('value')
            .then(snapshot => {
                console.log(`Pending events for user ${fbData.data.key}:${fbData.data.fullName}:`);
                console.log(JSON.stringify(snapshot));
                let pendingEvents = snapshot.val();
                if (pendingEvents) {
                    console.log(`set pending events to user ${fbData.data.fullName}:`);
                    //extract the events data
                    const pe = Object.keys(pendingEvents).map(ek => pendingEvents[ek]);
                    console.log(JSON.stringify(pe));

                    pe.forEach(e => {
                        console.log(`Update event ${e.key}`);

                        //add the user key to the event
                        const ev = Object.assign({}, e, {
                            userKey: fbData.data.key
                        });

                        console.log(JSON.stringify(e));
                        // writing to the Firebase Realtime Database.
                        admin.database()
                            .ref(`userToEvent/${fbData.data.key}`)
                            .set(ev);

                    });
                }
                return '';
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
