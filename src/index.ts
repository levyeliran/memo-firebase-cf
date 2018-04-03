import {onEvenCreated_setUserToEvent} from "./eventFunctions";
import {onPhotoAdded_updateThumbnailURL,onPhotoUploaded_generatePhotoThumbnail
} from "./photoFunctions";
import {onUserCreated_registerPendingEvents} from "./userFunctions";
import * as admin from 'firebase-admin'
import * as  functions from 'firebase-functions'

exports.funcGroup = {
    //events listeners
    onEvenCreated_setUserToEvent: onEvenCreated_setUserToEvent,

    //photos listeners
    onPhotoAdded_updateThumbnailURL: onPhotoAdded_updateThumbnailURL,
    onPhotoUploaded_generatePhotoThumbnail: onPhotoUploaded_generatePhotoThumbnail,


    //users listeners
    onUserCreated_registerPendingEvents: onUserCreated_registerPendingEvents
};

//animation hosting redirection
exports.animation = functions.https.onRequest((req, res) => {
    let content = "";
    if(req.query.animConfKey){
        content = "";
    }
    else {
        //return empty state
        content = "empty";
    }
    res.status(200).send(
        `<!doctype html>
            <body>
              ${content}
            </body>
         </html>`
    );
});


/*restfull api*/
/*for animation config as api*/
//https://www.skcript.com/svr/creating-restful-api-firebase/






//init the firebase  module
admin.initializeApp(functions.config().firebase);
/*admin.initializeApp(
    Object.assign({}, functions.config().firebase, {
            credential: admin.credential.cert({
                projectId: 'memo-11ade',
                clientEmail: 'firebase-adminsdk-c2zxm@memo-11ade.iam.gserviceaccount.com',
                privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCUTdm2VwL1JRS/\n5XSK/5EDBfiz2VBoWXgjxf83mN9NK3OTeBoiEfu2ASN+mFJLCY0lvvPVDD2O4C8k\\ncpC/wvfG4XIbWVI2HjOx3tZE0qTUezVCsHlKYibbAv9aW5KIcv6XYDQbILQGf5DD\\nkCQgef6G9K2t6OLEtUX8crKVq6oD5zwEirc0hqTQ7DrhmjDAr9ZKcD4SQ1BbRWvU\\ngxT/rFqTr5cpxF7UMR+i4GTfhn1fmZmW6dRPhjsGmf0IWaw+kTqQTTID5DxL4ixV\\ncXJVByD3ascTRyLJaYWKoJMrQeXLWsPtFYbS0LUQzb60WRJGwoD4XqPbnzthDbf5\\ndV9g0y7NAgMBAAECggEAB3BROYlrQ08ZF5gDjL5NcISh6Sl/FEDamxbBGrGPD9Cc\\nYzr8upVC1in/9QdgZ1WjEA/gLKFIzCwYCUC63HeD1KS1w8Pq8P56UtNt1XVoYaUN\\ncpsl9lJuhwFDPC3IL5JvDTo82th81y+aXAjUmxFrcCsBNC4wg7Pg/wzkwsehx0DE\\nKrwIrNc9qIZMa9Qw+R29PnK5zljkqdE98AMFyzKwNxh5U08/viTbRw9UbnkxoADU\\njCNpqu5547VUR9nIc6wQBzaxFxBh+OOY6eIeip1hNNUyKqzFS/U+nit0Ofk8nfqO\\n277J7PGIIgvr3eju/J9kDOtEFKvflh9JN3CnkbdWqQKBgQDMi4vCUpAf1oFfKscC\\n0aUZkWh1qbkRg8I59LLhfzA1CXlmECjz4Sivlj+p0NtBbx5/qetQH4i3ILPgF0bY\\neBARLtM7gg1QMa0LrZywl8uenq8NMnIO5pq9wm9whmKBA2CQ+r8CiTwGyjT1Mb1k\\noqgLDS5mVkZCKtx9nk222Zd3JQKBgQC5nHP+I+lbvcY7M1JKHuFvPYo02IzQiFu2\\nAtxicb+JQh9DZf+QJM7QqWySz3ZUKcM7BplonJ30fklUKWSS/Ev0z95wZzU1Zu4Z\\nlvzZgySCszHTeIV9bhFC/VFTcHvmMgMg6f5i0kHzSbAtJaOSQ1TpvHAUaCq20nsv\\nM71qFMz8iQKBgQDAZ3d0uBMoT69sJKIE7c1eqp/XJmqWphj6SUpGwUxIZ3wRXJwZ\\nJDAQUsXZ6EOGXo8SyXQ27yK8F//7iAm1L+L1NtWtwVzilYfQV2Pv3SnFMEE7qbsO\\ndy8R1qba8x4Pe2zHk4Y/TXXwcR61ki80TajClIiT7Q2zyfuUEmfJ2w4WHQKBgE3Q\\nRGSQA539cmSRQHdoeNQc9ZrwCiDGecRVcLUowMa3XMnxsfFpLPcXgDgQF6hzFbDi\\nNGBCAIpmgzFwZQSmFuXcW4G+EvV/YGSEAx7hNuZAX6wrQ7Nw+HWgI38akibQYrVi\\nw84EHbfz9ZMHy4pfBfMzl71GalnY5eHFDCyz6bgZAoGAPS4TGBMmlbXrRF6VDhri\\nYCGhGR3SKQ774SXU4roXB7UtQw4bIb+y+W8QDHMASxsQeVPSzbYkQgxPi1XCoeES\\nPBLnvH97frvmD94wDgdNKUXP+dAA+g3OLgV925BsB1jqwdwhTW80ILid7Y0nznrX\\nSvOWkrB8ZkZlcjrOeTL8NgI=\\n-----END PRIVATE KEY-----\\n'
            })
        }
    ));
,
    databaseURL: 'https://memo-11ade.firebaseio.com'
});*/

/*
firebase listeners:
onWrite(), which triggers when data is created, updated, or deleted in the Realtime Database.
onCreate(), which triggers when new data is created in the Realtime Database.
onUpdate(), which triggers when data is updated in the Realtime Database.
onDelete(), which triggers when data is deleted from the Realtime Database.


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

