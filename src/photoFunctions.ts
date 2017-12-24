import * as  functions from 'firebase-functions'
/*
import * as  gcs from '@google-cloud/storage'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
const spawn = require('child-process-promise').spawn;
*/

//https://firebase.google.com/docs/storage/extend-with-functions
export const generateThumbnailListener = functions.storage.object().onChange( event => {

    const object = event.data; // The Storage object.

    console.log("a file was uploaded");
    console.log(object);
/*
    console.log(object.bucket);
    console.log(object.name);

    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    const resourceState = object.resourceState; // The resourceState is 'exists' or 'not_exists' (for file/folder deletions).
    const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.


    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
        console.log('This is not an image.');
        return;
    }

    // Get the file name.
    const fileName = path.basename(filePath);
    // Exit if the image is already a thumbnail.
    if (fileName.startsWith('thumb_')) {
        console.log('Already a Thumbnail.');
        return;
    }

    // Exit if this is a move or deletion event.
    if (resourceState === 'not_exists') {
        console.log('This is a deletion event.');
        return;
    }

    // Exit if file exists but is not new and is only being triggered
    // because of a metadata change.
    if (resourceState === 'exists' && metageneration > 1) {
        console.log('This is a metadata change event.');
        return;
    }

    // Download file from bucket.
    const bucket = gcs.bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const metadata = { contentType: contentType };
    return bucket.file(filePath).download({
        destination: tempFilePath
    }).then(() => {
        console.log('Image downloaded locally to', tempFilePath);
        // Generate a thumbnail using ImageMagick.
        return spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath]);
    }).then(() => {
        console.log('Thumbnail created at', tempFilePath);
        // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
        const thumbFileName = `thumb_${fileName}`;
        const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
        // Uploading the thumbnail.
        return bucket.upload(tempFilePath, { destination: thumbFilePath, metadata: metadata });
    // Once the thumbnail has been uploaded delete the local file to free up disk space.
    }).then(() => fs.unlinkSync(tempFilePath));

*/


});