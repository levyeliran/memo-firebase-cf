import * as  functions from 'firebase-functions'
import * as admin from 'firebase-admin'

//to write into db, use admin
//const snapshot = await admin.database().ref('messages').push({ original: original })

export const createEventListener = functions.database
    .ref('events/{pushId}')
    .onWrite(async event => {
        console.log(event);
    });
