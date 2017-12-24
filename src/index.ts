import  { createEventListener } from "./eventFunctions";
import { generateThumbnailListener } from "./photoFunctions";
import * as admin from 'firebase-admin'
import * as  functions from 'firebase-functions'

exports.funcGroup = {
    createEventListener: createEventListener,
    generateThumbnailListener:generateThumbnailListener
};

//init the firebase  module
admin.initializeApp(functions.config().firebase);

/*
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

