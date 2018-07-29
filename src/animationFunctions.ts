import * as  functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import {extractData} from "./extractDataHelper";
import {FBData} from "./utilities/FBData";

const ANIMATION_IN_TYPES = {
    bounceInLeft: 'bounceInLeft',
    fadeIn: 'fadeIn',
    fadeInLeftBig: 'fadeInLeftBig',
    fadeInUpBig: 'fadeInUpBig',
    rotateIn: 'rotateIn',
    rotateInUpRight: 'rotateInUpRight',
    rollIn: 'rollIn',
    zoomInLeft: 'zoomInLeft',
    slideInDown: 'slideInDown',
    bounceInRight: 'bounceInRight',
    fadeInDown: 'fadeInDown',
    fadeInRight: 'fadeInRight',
    rotateInDownLeft: 'rotateInDownLeft',
    zoomInRight: 'zoomInRight',
    slideInLeft: 'slideInLeft',
    bounceIn: 'bounceIn',
    bounceInUp: 'bounceInUp',
    fadeInDownBig: 'fadeInDownBig',
    fadeInRightBig: 'fadeInRightBig',
    flipInX: 'flipInX',
    lightSpeedIn: 'lightSpeedIn',
    rotateInDownRight: 'rotateInDownRight',
    zoomIn: 'zoomIn',
    zoomInUp: 'zoomInUp',
    slideInRight: 'slideInRight',
    bounceInDown: 'bounceInDown',
    fadeInLeft: 'fadeInLeft',
    fadeInUp: 'fadeInUp',
    flipInY: 'flipInY',
    rotateInUpLeft: 'rotateInUpLeft',
    jackInTheBox: 'jackInTheBox',
    zoomInDown: 'zoomInDown',
    slideInUp: 'slideInUp'
};

const ANIMATION_OUT_TYPES = {
    bounceOutDown: 'bounceOutDown',
    fadeOutLeft: 'fadeOutLeft',
    fadeOutUp: 'fadeOutUp',
    flipOutX: 'flipOutX',
    rotateOutUpLeft: 'rotateOutUpLeft',
    zoomOutDown: 'zoomOutDown',
    slideOutDown: 'slideOutDown',
    bounceOutLeft: 'bounceOutLeft',
    fadeOut: 'fadeOut',
    fadeOutLeftBig: 'fadeOutLeftBig',
    fadeOutUpBig: 'fadeOutUpBig',
    flipOutY: 'flipOutY',
    rotateOut: 'rotateOut',
    rotateOutUpRight: 'rotateOutUpRight',
    rollOut: 'rollOut',
    zoomOutLeft: 'zoomOutLeft',
    slideOutLeft: 'slideOutLeft',
    bounceOutRight: 'bounceOutRight',
    fadeOutDown: 'fadeOutDown',
    fadeOutRight: 'fadeOutRight',
    rotateOutDownLeft: 'rotateOutDownLeft',
    zoomOutRight: 'zoomOutRight',
    slideOutRight: 'slideOutRight',
    bounceOut: 'bounceOut',
    bounceOutUp: 'bounceOutUp',
    fadeOutDownBig: 'fadeOutDownBig',
    fadeOutRightBig: 'fadeOutRightBig',
    lightSpeedOut: 'lightSpeedOut',
    rotateOutDownRight: 'rotateOutDownRight',
    zoomOut: 'zoomOut',
    zoomOutUp: 'zoomOutUp',
    slideOutUp: 'slideOutUp',
    hinge: 'hinge'
};

const ANIMATION_GIFS_TYPES = {
    flip: 'flip',
    bounce: 'bounce',
    shake: 'shake',
    wobble: 'wobble',
    flash: 'flash',
    headShake: 'headShake',
    jello: 'jello',
    pulse: 'pulse',
    swing: 'swing',
    rubberBand: 'rubberBand',
    tada: 'tada'
};

export const onEvenAnimationStatusCreated_createAnimation = functions.database
    .ref('pendingEventAnimation/{eventId}')
    .onUpdate(async (ea: any) => {

        console.log(`************************************************************`);

        //extract relevant data and add log
        const fbData: FBData = extractData(ea);
        console.log(`An Pending Event Animation record was saved to database:`);
        console.log(fbData);

        if(!fbData.data.eventKey){
            console.log(`Event key is missing, EXIT animation creation.`);
            return null;
        }

        if(!fbData.data.photos){
            console.log(`Event photos is missing, EXIT animation creation.`);
            return null;
        }

        if(!fbData.data.event){
            console.log(`Event object is missing, EXIT animation creation.`);
            return null;
        }

        //get event animation and check if 15 minutes has been passed
        console.log(`Check for existing event animation ${fbData.data.eventKey}: `);

        return admin.database()
            .ref(`eventAnimation/${fbData.data.eventKey}`)
            .once('value')
            .then(eventAnimation => {
                let animation: any = {};
                if (eventAnimation && eventAnimation.creationDate) {
                    console.log(`OLD event animation`);
                    console.log(JSON.stringify(eventAnimation));

                    const animationCreationDate = new Date(eventAnimation.creationDate);
                    const timeGap = 1000 * 60 * 15; //set 15 min gap
                    if ((new Date()).getTime() - animationCreationDate.getTime() >= timeGap) {
                        //create the updated animation
                        console.log(`Update event animation...`);
                        animation = createAnimation(fbData.data);
                    }
                    else {
                        console.log(`No need to re-create event animation... 15Min from previous creation didn't passed yet`);
                        return null;
                    }
                }
                else {
                    console.log(`Create event animation FIRST TIME!`);

                    //create the updated animation
                    animation = createAnimation(fbData.data);
                }

                //add the animation creation date
                animation.creationDate = (new Date()).toString();
                console.log(`Write event animation ${animation.eventKey} to db`);
                console.log(JSON.stringify(animation));

                admin.database()
                    .ref(`eventAnimation/${animation.eventKey}`)
                    .update(animation).then(e => {
                    if (!eventAnimation){
                        console.log(`Event Animation: ${animation.eventKey} was CREATED!`);
                        console.log(JSON.stringify(e));
                        return;
                    }
                    console.log(`Event Animation: ${animation.eventKey} was UPDATED!`);
                    console.log(JSON.stringify(e));
                });

                console.log(`Updating event animation status ${animation.eventKey} to db`);
                admin.database()
                    .ref(`events/${animation.eventKey}`)
                    .set({hasAnimation: true}).then(e => {
                    console.log(`Event Animation status (on event entity): ${animation.eventKey} was updated!`);
                    console.log(JSON.stringify(e));
                });

                return animation;
            });
    });

const createAnimation = (animationConfig: any) => {
    const resultAnimation:any = {
        appIntro: getAppAnimationIntro(),
        eventIntro: getEventAnimationIntro(animationConfig),
        photosAnimationContent: {},
        appCompletion: {}
    };
    //create the event body here
    //total sound time is 4:11
    //configure timeline (based on creation time vs count)
    //get time per photo (based on creation time, user type, num of tags, tags meaning, additional effects)
    //set loop counter
    //

    const timeLinePhotos = getAnimationPhotosTimeline(animationConfig);
    resultAnimation.photosAnimationContent = getPhotosAnimationContent(timeLinePhotos);
    //we need to calculate the delay time since the event photos animation is dynamic
    resultAnimation.appCompletion = getAppAnimationCompletion(
        resultAnimation.photosAnimationContent.totalTimeInMillisecond +
        resultAnimation.photosAnimationContent.delayTimeInMillisecond);

    const delayDuration = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,60];
    const result = {
        eventKey: animationConfig.eventKey,
        style: getAnimationStyleTag(delayDuration.map(sec => {
            return getAnimationDelayCss(sec).style + getAnimationDurationCss(sec).style;
        }).join(" ")),
        script: getAnimationScriptTag(resultAnimation),
        additionalHTML: '',//todo - add here all common gifs & emojies.
        animationBodyHTML: null,
        animationData: resultAnimation
    };
    result.animationBodyHTML = getAnimationBodyHTML(result);
    return result;

};

const getAnimationBodyHTML = (configuration:any):any => {
    return `
        <!DOCTYPE html>
         <html lang="en">
            <head>
              <link rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css"
                integrity="sha384-OHBBOqpYHNsIqQy8hL1U+8OXf9hH6QRxi0+EODezv82DfnZoV7qoHAZDwMwEJvSw"
                crossorigin="anonymous">
              <script  src="https://code.jquery.com/jquery-3.3.1.min.js"
                integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
                crossorigin="anonymous"></script>
              <meta charset="UTF-8">
              ${configuration.style}
              ${configuration.script}
            </head>
            <body>
            </body>
         </html>`;

    /*${getAnimationGifs().map(g => {
                return getElementHtmlTag({
                    id: g.name,
                    url: g.src
                }, g.styleClass);
            }).join("\n\n\n")}*/
};

const getAppAnimationIntro = (): any => {
    //display intro of the app animation
    //7 seconds
    const animationConfig = {
        totalTimeInMillisecond: 9000 ,
        delayTimeInMillisecond: 200,
        animationContent: {
            animIntroAppLogo: {
                elementId: "animIntroAppLogo",
                delayTimeInMillisecond: 200,
                durationTimeInMillisecond: 3000 ,
                elementStyle: getElementStyle({id: "animIntroAppLogo"}),
                element: `<div class="app-logo-wrapper">
                            ${getElementHtmlTag({
                                id: "animIntroAppLogo",
                                url: getAnimationImgs().find(img => img.name === "appIcon").src
                            }, "app-logo-img")}
                          </div>`,
                animationScript: getCustomElementScript("animIntroAppLogo", 2).script
            },
            animIntroAppDesc: {
                elementId: "animIntroAppDesc",
                delayTimeInMillisecond: 3000 ,
                durationTimeInMillisecond: 3000 ,
                elementStyle: getElementStyle({id: "animIntroAppDesc"}),
                element:
                    (`<div id="animIntroAppDesc" class="app-name-wrapper hidden">
                        <div class="app-name">Memories</div>
                        <div class="app-description">For your special moments</div>
                    </div>`),
                animationScript: getCustomElementScript("animIntroAppDesc", 2).script
            },
            animIntroCountdownGif: {
                elementId: "animIntroCountdownGif",
                delayTimeInMillisecond: 6000 ,
                durationTimeInMillisecond: 2000 ,
                elementStyle: getElementStyle({id: "animIntroCountdownGif"}),
                element: getElementHtmlTag({
                    id: "animIntroCountdownGif",
                    url: getAnimationImgs().find(img => img.name === "countdown321").src
                }),
                animationScript: getCustomElementScript("animIntroCountdownGif", 1).script
            }
        }
    };
    //app logo "presents..." - 2 sec
    // app desc - 2 sec
    //3,2,1 animation - 3 sec
    console.log('App intro was created:');
    console.log(JSON.stringify(animationConfig));
    return animationConfig;
};

const getEventAnimationIntro = (data: any): any => {
    //names
    //date
    //event type
    //event docation
    //description

    //12 seconds
    const animationConfig = {
        totalTimeInMillisecond: 17000 ,
        delayTimeInMillisecond: 9000 ,
        animationContent: {
            eventIntroName: {
                elementId: "eventIntroName",
                delayTimeInMillisecond: 200,
                durationTimeInMillisecond: 3000 ,
                elementStyle: getElementStyle({id: "eventIntroName"}),
                element:
                    (`<div id="eventIntroName" class="event-name-wrapper hidden">
                        <div class="event-name">${data.event.title || 'This Event'}</div>
                    </div>`),
                animationScript: getCustomElementScript("eventIntroName", 2).script
            },
            eventIntroSaveTheDate: {
                elementId: "eventIntroSaveTheDate",
                delayTimeInMillisecond: 4500 ,
                durationTimeInMillisecond: 3000 ,
                elementStyle: getElementStyle({id: "eventIntroSaveTheDate"}),
                element: getElementHtmlTag({
                    id: "eventIntroSaveTheDate",
                    url: getAnimationImgs().find(img => img.name === "saveTheDate").src
                }, "save-the-date-img"),
                animationScript: getCustomElementScript("eventIntroSaveTheDate", 2).script
            },
            eventIntroEventDate: {
                elementId: "eventIntroEventDate",
                delayTimeInMillisecond: 7500 ,
                durationTimeInMillisecond: 4000 ,
                elementStyle: getElementStyle({id: "eventIntroEventDate"}),
                element:
                    (`<div id="eventIntroEventDate" class="event-date-wrapper hidden">
                        <div class="event-date">${(new Date(data.event.startDate)).toLocaleDateString()}</div>
                    </div>`),
                animationScript: getCustomElementScript("eventIntroEventDate", 3).script
            },
            eventIntroEventType: {
                elementId: "eventIntroEventType",
                delayTimeInMillisecond: 11500 ,
                durationTimeInMillisecond: 2000 ,
                elementStyle: getElementStyle({id: "eventIntroEventType"}),
                element:
                    (`<div id="eventIntroEventType" class="event-type-wrapper hidden">
                        <div class="r1">The best</div>
                        <div class="r2">Event</div>
                        <div class="r3">Of the year!!!</div>
                    </div>`),
                animationScript: getCustomElementScript("eventIntroEventType", 1).script
            },
            eventIntroLetsPartyGif: {
                elementId: "eventIntroLetsPartyGif",
                delayTimeInMillisecond: 14500 ,
                durationTimeInMillisecond: 3000 ,
                elementStyle: getElementStyle({id: "eventIntroLetsPartyGif"}),
                element: getElementHtmlTag({
                    id: "eventIntroLetsPartyGif",
                    url: getAnimationGifs().find(g => g.name === "teenagerDancer").src
                }),
                animationScript: getCustomElementScript("eventIntroLetsPartyGif", 2).script
            }
        }
    };

    //event name //3 sec
    //save the date - 2 sec
    //date - 3 sec
    //event type "wedding of the year" - 2 sec
    //lets party!!! - 2 sec
    console.log('Event intro was created:');
    console.log(JSON.stringify(animationConfig));
    return animationConfig;
};

const getAnimationPhotosTimeline = (data: any) => {
    //const eventCurrentDurationInMinutes =
        //((new Date()).getTime() - (new Date(data.event.startDate)).getTime()) / (1000 * 60);
    const timeline = {};
    //create timeline of Minimum 5 minutes (we need at least 6 places in time line)
    let skip = 6;//eventCurrentDurationInMinutes / 6 > 6 ? 5 : (eventCurrentDurationInMinutes / 6) + 1;
    console.log("Timeline skips value: ", skip);

    let time = new Date(data.event.startDate);
    let timeKey = time.toString();
    let maxPhotosForTimeRange = 0;
    data.photos.forEach((photo, index) => {
        const nextTime = new Date(time.getTime() + skip * 60000);
        if (photo.creationDate > nextTime) {
            skip += 5;
            time = nextTime;
            timeKey = (time.toString()).replace(' ','');
        }
        const animatedPhoto = getPhotoConfiguration(index, photo, data.event);
        if(!animatedPhoto){
            return;
        }
        /*{
            id:"",
            url:"",
            creatorName:"",
            isVipUser:bool,
            gifsAndTags:[{}],
            isDisplayUsersTags:bool
        }*/
        if (timeline[timeKey]) {
            timeline[timeKey].photos.push(animatedPhoto);
            if (timeline[timeKey].photos.length > maxPhotosForTimeRange) {
                maxPhotosForTimeRange = timeline[timeKey].photos.length;
                timeline[timeKey].isPickTime = true;
            }
        }
        else {
            timeline[timeKey] = {
                photos: [animatedPhoto],
                isPickTime: false
            };
        }
    });
    console.log("Photos timeline was created: ");
    console.log(JSON.stringify(timeline));
    return timeline;
};

const getPhotoConfiguration = (photoId: any, photo: any, event: any) => {
    let photoConfiguration: any = null;
    if (photo.tagsMetaData && photo.tagsMetaData.emojiTags && Array.isArray(photo.tagsMetaData.emojiTags)) {
        photoConfiguration = {};
        photoConfiguration.id = `photo_${photoId}`;
        photoConfiguration.url = photo.fileURL;
        photoConfiguration.creatorName = photo.creatorName;
        photoConfiguration.isVipUser = photo.isVipUser;
        photoConfiguration.gifsAndTags = getPhotoGifsAndTagsAnimationConfiguration(photo.tagsMetaData.emojiTags);
        /*{
            categoryKey: "",
            tags:[{}],
            availableGifs:[{}],
            vipUserNames:[""]
        };*/
        if (event.participatesDetails && Array.isArray(event.participatesDetails)) {
            photoConfiguration.isDisplayUsersTags = photo.tagsMetaData.emojiTags.length >= (event.participatesDetails.length * 0.9);
        }
    }

    if(photoConfiguration){
        console.log(`photoConfiguration ${photoConfiguration.id} is:`);
        console.log(JSON.stringify(photoConfiguration));
    }

    return photoConfiguration;
};

const getPhotoGifsAndTagsAnimationConfiguration = (emojiTags: any) => {

    const animationGifs = getAnimationGifs();
    const groupedTags = {};
    emojiTags.forEach(et => {
        if (groupedTags[et.emojiTagCategoryKey]) {
            groupedTags[et.emojiTagCategoryKey].tags.push(et);
        }
        else {
            groupedTags[et.emojiTagCategoryKey] = {
                categoryKey: et.emojiTagCategoryKey,
                tags: [et]
            };
        }
    });

    const keys = Object.keys(groupedTags);
    const selectedTags = keys
        .map(k => groupedTags[k])
        .filter(gt => gt.length >= 3);

    return selectedTags.map(st => {
        let result = {
            categoryKey: st.categoryKey,
            tags: st.tags,
            availableGifs: animationGifs.filter(ag => ag.categoryKey == st.categoryKey),
            vipUserNames: []
        };

        const vipUserNames = st.tags.filter(t => t.isVipUser).map(t => t.creatorName);
        if (vipUserNames.length === 3) {
            result = Object.assign(result, {vipUserNames});
        }
        return result;
    });
};

const getPhotosAnimationContent = (timelinePhotos: any): any => {

    const animationConfig = {
        totalTimeInMillisecond: 0,
        delayTimeInMillisecond: 26000 , //app intro + event intro time
        animationContent: {}
    };

    //loop over timeline collection, which has for every step:
    //isPickTime: boolean
    //photos: array of:
    /*{
           id:"",
           url:"",
           creatorName:"",
           isVipUser:bool,
           gifsAndTags:
                {
                    categoryKey: "",
                    tags:
                        {
                            photoKey: "",
                            emojiTags:
                            {
                                  eventKey:string;
                                  photoKey:string;
                                  emojiTagKey:string;
                                  emojiTagCategoryKey:string;
                                  isVipUser:boolean;
                                  creatorKey:string;
                                  creatorName:string;
                                  creationDate:string;
                            }
                        }
                    availableGifs:
                        {
                            name: "",
                            src: "",
                            categoryKey: num,
                            categoryName: ""
                            styleClass: ""
                         }
                    vipUserNames:[""]
                };
           isDisplayUsersTags:bool
       }*/
    const timelineKeys = Object.keys(timelinePhotos);

    console.log('Timeline keys are:');
    console.log(JSON.stringify(timelineKeys));
    let delay = 200;
    let totalPhotos = 0;
    timelineKeys.forEach(tlk => {
        const stepConf = timelinePhotos[tlk];

        console.log(`Timeline ${tlk} value is:`);
        console.log(JSON.stringify(stepConf));

        stepConf.photos.forEach(p => {
            const animScript = getElementScript(p, stepConf.isPickTime);
            animationConfig.animationContent[p.id] = {
                elementId: p.id,
                delayTimeInMillisecond: delay,
                durationTimeInMillisecond: animScript.duration - 200,
                elementStyle: getElementStyle(p, stepConf.isPickTime),
                element: getElementHtmlTag(p),
                animationScript: animScript.script
            };
            //calculate the delay for the next photo display - incrmental value (will be the total time of the photos animation)
            delay += animScript.duration;
            totalPhotos++;
            console.log(`Animated photo ${p.id} conf is:`);
            console.log(JSON.stringify(animationConfig.animationContent[p.id]));
        });

    });

    console.log(`Total animation time for ${totalPhotos} photos`);
    console.log(`${delay}ms`);
    //add the duration for total time
    animationConfig.totalTimeInMillisecond += delay;

    /*    const animationConfig = {
      totalTimeInMillisecond: 13000,
      animationContent: {
        "1": {
          elementId: "firstImg",
          delayTimeInMillisecond: 0,
          elementStyle: '#firstImg{width: 100%; position: absolute; border: 5px solid lightblue;}',
          element:'<img id="firstImg" class="hidden" src="https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/thumb_-L129T5PnR7Va49yYXrR%5D52w0SkcAASNacMNtQtcc5o4ANu43%5D-LAbgllhFZTOB-0S3CQE.png?alt=media&token=c953847d-99f4-4400-a92c-4d453fd3a00b" />',
          animationScript: '$("#firstImg").animateCss("animated jackInTheBox duration2s", function(){' +
          '$("#firstImg").animateCss("pulse duration2s", function(){' +
          '$("#firstImg").animateCss("zoomOutLeft duration2s", function(){$("#firstImg").remove();});' +
          '});' +
          '});'
        },
        "2": {
          elementId: "secondImg",
          delayTimeInMillisecond: 5000,
          elementStyle: '#secondImg{width: 100%; position: absolute; border: 5px solid lightsalmon;}',
          element:'<img id="secondImg" class="hidden" src="https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/thumb_-L129T5PnR7Va49yYXrR%5De4Zl6z3T5He7Z3SIrP0U3lLuVhm2%5D-L9LbEuqyzO0xie9dTU_.png?alt=media&token=dd3ac897-beae-4cb8-8711-9afe2e511f38" />',
          animationScript: '$("#secondImg").animateCss("animated jackInTheBox duration2s", function(){' +
          '$("#secondImg").animateCss("pulse duration5s", function(){' +
          '$("#secondImg").animateCss("zoomOutRight duration2s", function(){$("#secondImg").remove();});' +
          '});' +
          '});'
        }
      }
    };*/

    console.log('Event photos animation was created:');
    console.log(JSON.stringify(animationConfig));
    return animationConfig;
};

const getAppAnimationCompletion = (delay): any => {
    //display completion of the app animation
    //7 seconds
    const animationConfig = {
        totalTimeInMillisecond: 6000 ,
        delayTimeInMillisecond: delay + 500,
        animationContent: {
            animCompletionDesc: {
                elementId: "animCompletionDesc",
                delayTimeInMillisecond: 200,
                durationTimeInMillisecond: 3000,
                elementStyle: getElementStyle({id: "animCompletionDesc"}),
                element:
                    (`<div id="animCompletionDesc" class="app-completion-desc-wrapper hidden">
                        <div class="r1">Until next time</div>
                        <div class="r2">Keep smiling!</div>
                    </div>`),
                animationScript: getCustomElementScript("animCompletionDesc", 2, true).script
            },
            animCompletionAppLogo: {
                elementId: "animCompletionAppLogo",
                delayTimeInMillisecond: 3000 ,
                durationTimeInMillisecond: 3000,
                elementStyle: getElementStyle({id: "animCompletionAppLogo"}),
                element:`<div class="app-logo-wrapper">
                            ${getElementHtmlTag({
                                id: "animCompletionAppLogo",
                                url: getAnimationImgs().find(img => img.name === "appIcon").src
                            }, "app-logo-img-completion")}
                        </div>`,
                animationScript: getCustomElementScript("animCompletionAppLogo", 2).script
            }
        }
    };

    //until next time - 2 sec
    //app logo -  3 sec
    console.log('App completion was created:');
    console.log(JSON.stringify(animationConfig));
    return animationConfig;
};

const getRemoveElementHandler = (animatedPhoto: any, removeAllImages = false) => {

    if(removeAllImages){
        return `function(){
                $("#${animatedPhoto.id}").remove();
                $(".animation-img").remove();
            }`;
    }

    return `function(){
                $("#${animatedPhoto.id}").remove();
            }`;
};

const getTagsAnimation = (tags: any) => {
    return '';
    /*`
    var tagsData = JSON.parse(JSON.stringify(${JSON.stringify(tags)}));
    var inc = 0;
    var tagsInterval = setInterval(function(){
        if(inc < tagsData.length){
           var tag = tagsData[inc];
           $("#").src = tag.emojiTagUrl;
           $("#").innerHTML = tag.creatorName;
           if(tag.isVipUser){
               $("#").addClass("vipClass");
           } 
        }
        inc++;
    },1000);
    
    //display the tag container
    $("#").addClass("displayTag");
    
    //hide the tag container
    var tagsTimeout = setTimeout(function(){ 
        $("#").removeClass("displayTag");
        $("#").addClass("vipClass")
        clearTimeout(tagsTimeout);
        clearInterval(tagsInterval);
    }, ${tags.length*1000 + 1000});
    `;*/
};

const getGifsAnimation = (gifs: any) => {
    return `    
    var gifsData = JSON.parse(JSON.stringify(${JSON.stringify(gifs)}));
    if(gifsData.length >= 1){
        //display the gif
        var gif1InTimeout = setTimeout(function(){ 
            $("'#"+gifsData[0].name+"'").addClass("displayGif");
            clearTimeout(gif1InTimeout);
        }, 10);
        //hide the gif
        var gif1OutTimeout = setTimeout(function(){ 
            $("'#"+gifsData[0].name+"'").removeClass("displayGif");
            clearTimeout(gif1OutTimeout);
        }, 1500);
        
    }
    
    if(gifsData.length >= 2){
        //display the gif
        var gif2InTimeout = setTimeout(function(){ 
            $("'#"+gifsData[1].name+"'").addClass("displayGif");
            clearTimeout(gif2InTimeout);
        }, 1000);
        
        //hide the gif
        var gif2OutTimeout = setTimeout(function(){ 
            $("'#"+gifsData[1].name+"'").removeClass("displayGif");
            clearTimeout(gif2OutTimeout);
        }, 3300);
    }
    `;
};

const getElementScript = (animatedPhoto: any, isPickTime = false) => {
    let duration = 0;
    const inOutDuration = isPickTime ? 2: 4;
    const inOutDurationClass = getAnimationDurationCss(inOutDuration);

    const inAnimation = getInAnimationType();
    duration += inOutDuration*1000;

    const outAnimation = getOutAnimationType();
    duration += inOutDuration*1000;

    //add preview animation
    let script = `$("#${animatedPhoto.id}").animateCss("animated ${inAnimation} ${inOutDurationClass.className}", `;

    let additionalDurationClass = getAnimationDurationCss(2);
    const additionalAnimation = getGeneralAnimationType();

    //add additional animations
    if(!isPickTime &&
        (animatedPhoto.gifsAndTags.tags.length ||
            animatedPhoto.gifsAndTags.availableGifs.length ||
            animatedPhoto.gifsAndTags.vipUserNames.length)){
        const tagsCount = animatedPhoto.gifsAndTags.tags.length + 1;
        additionalDurationClass = getAnimationDurationCss(tagsCount);
        script += `function(){ 
        ${getTagsAnimation(animatedPhoto.gifsAndTags.tags)}
        ${getGifsAnimation(animatedPhoto.gifsAndTags.availableGifs)}
        $("#${animatedPhoto.id}").animateCss("${additionalAnimation} ${additionalDurationClass.className}", `;

        duration += tagsCount * 1000;
    }
    else {
        script += `function(){
        $("#${animatedPhoto.id}").animateCss("${additionalAnimation} ${additionalDurationClass.className}", `;
        duration += 2000;
    }

    //add hide animation
    //add remove element
    script += `function(){ $("#${animatedPhoto.id}").animateCss("${outAnimation} ${inOutDurationClass.className}", 
        ${getRemoveElementHandler(animatedPhoto)});`;

    //add additional animations closing tags
    script += '});';

    //add animation closing tag
    script += '});';

    return {
        script: script,
        duration: duration
    };
};

const getCustomElementScript = (elementId: any, elementDuration = 0, removeAllImages = false) => {
    let duration = 0;
    duration += 1000; //in out duration
    const additionalDuration = getAnimationDurationCss(elementDuration);


    //add preview animation
    let script = `$("#${elementId}").animateCss("animated ${ANIMATION_IN_TYPES.bounceIn} durationDot5", `;

    script += `function(){ $("#${elementId}").animateCss("${ANIMATION_GIFS_TYPES.pulse} ${additionalDuration.className}", `;

    //add hide animation
    //add remove element
    script += `function(){ $("#${elementId}").animateCss("${ANIMATION_OUT_TYPES.bounceOut} durationDot5", 
        ${getRemoveElementHandler({id: elementId}, removeAllImages)});`;

    //add additional animations closing tags
    script += '});';

    //add animation closing tag
    script += '});';

    return {
        script: script,
        duration: duration
    };
};

const getElementStyle = (animatedPhoto: any, isPickTime = false): string => {
    let style = `#${animatedPhoto.id}{
        width: 100%; 
        position: absolute;
        ${animatedPhoto.customStyle || ''}
    }
    `;
    return style;
};

const getElementHtmlTag = (animatedPhoto: any, customClass = "animation-img") => {
    return `<img 
                id="${animatedPhoto.id}" 
                class="${customClass} hidden" 
                src="${animatedPhoto.url}" />`;
};

const getAnimationStyleTag = (customCss = null) => {
    return `
    <style>
        body {
          background: #18162A;
          width: 100%; 
          height: 100%; 
          padding: 0;
          margin: 0;
          overflow-y: hidden;
          overflow-x: hidden;
          overflow: hidden;
          font-family: 'Noto Sans', sans-serif;
        }
        .displayGif{
            visibility: visible;
        }
        .mirorX{
            transform: scaleX(-1);
        }
        .mirorY{
            transform: scaleY(-1);
        }
        .hidden{
          visibility: hidden;
        }
        .party{
            position:static;
            width:60px;
            height:60px;
            left:15%;
            top:20%;
        }
        .wow{
            position:static;
            width:50px;
            height:50px;
            left:85%;
            top:20%;
        }
        .fun{
            position:static;
            width:80px;
            height:80px;
            left:15%;
            top:20%;
        }
        .sweet{
            position:static;
            width:50px;
            height:50px;
            left:10%;
            top:10%;
        }
        .love{
            position:static;
            width:50px;
            height:50px;
            left:25%;
            top:75%;
        }
        .touching{
            position:static;
            width:65px;
            height:65px;
            right:15%;
            top:80%;
        }
        .love{
            position:static;
            width:50px;
            height:50px;
            right:25%;
            top:20%;
        }
        .shock{
            position:static;
            width:80px;
            height:80px;
            right:15%;
            top:60%;
        }
        .animated{
          visibility: visible;
        }
        .animation-img {
            width: 109% !important; 
            position: absolute;
        }
        .durationDot2{
            animation-duration: .5s;
        }
        .durationDot5{
            animation-duration: .5s;
        }
        .durationDot7{
            animation-duration: .7s;
        }
        
        .app-name-wrapper {
            text-align: left;
            color: white;
            position: absolute;
            left: 25%;
            top: 20%;
        }
        .app-name-wrapper .app-name {
          position: absolute;
          top:30%
          color: white;
          font-size: 40px;
          text-shadow: 0px 0px 2px white;
          font-weight: 900;
          text-decoration: blink;
        }
        .app-name-wrapper .app-description {
          color: white;
          font-size: 11px;
          font-weight: 900;
          padding-bottom: 12px;
          position:absolute;
          top:45px;
          left:2px;
        }
        
        .event-name-wrapper{
            text-align: center;
            color: white;
            font-size: 45px;
            text-shadow: 0px 0px 20px yellow;
            font-weight: 900;
            position: absolute;
            top: 30%;
        }
        .event-name-wrapper .event-name{
        
        }
        
        .event-date-wrapper{
            position: absolute;
            top: 35%;
            text-align: center;
            color: white;
            font-size: 50px;
            text-shadow: 0px 0px 10px white;
            font-weight: 900;
        }
        
        .event-type-wrapper{
            text-align: center;
            color: white;
            font-size: 38px;
            text-shadow: 0px 0px 15px yellow;
            font-weight: 900;
            position:absolute;
            top:23%;
        }
        
        .app-completion-desc-wrapper{
            position: absolute;
            top: 65%;
            text-shadow: 0px 0px 25px black;
            text-align: center;
            color: yellow;
            font-size: 30px;
            text-shadow: 0px 0px 20px black;
            font-weight: 900;
        }
        
        .app-logo-wrapper{
            position:absolute;
            border-radius: 50%;
            width: 40%;
            padding: 10px 10px 0px 10px;
            left:25%;
            top: 38%;
        }
        .app-logo-wrapper .app-logo-img{
            width:90%;
        }
        
        #animIntroCountdownGif{
            position:absolute;
            width:100%;
            height:100%;
        }
        
        #eventIntroSaveTheDate, save-the-date-img{
            position:absolute;
            width:110%;
            height:110%;
        }
        
        #eventIntroLetsPartyGif{
            position:absolute;
            width:80%;
            height:85%;
            top:8%;
        }
        
        .app-logo-wrapper .app-logo-img-completion{
            width:90%;
        }
        ${customCss}
    </style>`
};

const getAnimationScriptTag = (animationConfigObj = null) => {
    return "<script> \n"+
    "const animationConfig = JSON.parse(JSON.stringify(" + JSON.stringify(animationConfigObj) + "));\n" +
    //"console.log(animationConfig);\n"+
    "var timeouts = {};\n"+
    "$.fn.extend({\n"+
    "  animateCss: function (animationName, callback) {\n"+
   "    var animationEnd = (function (el) {\n"+
   "      var animations = {\n"+
   "        animation: 'animationend',\n"+
   "        OAnimation: 'oAnimationEnd',\n"+
   "        MozAnimation: 'mozAnimationEnd',\n"+
   "        WebkitAnimation: 'webkitAnimationEnd',\n"+
   "      };\n"+
   "      for (var t in animations) {\n"+
   "        if (el.style[t] !== undefined) {\n"+
   "          return animations[t];\n"+
   "        }\n"+
   "      }\n"+
   "    })(document.createElement('div'));\n"+
   "    this.addClass('animated ' + animationName).one(animationEnd, function () {\n"+
   "      $(this).removeClass('animated ' + animationName);\n"+

   "      if (typeof callback === 'function') callback();\n"+
   "    });\n"+
   "    return this;\n"+
   "  }\n"+
   "});\n"+


   "const str2DOMElement = function(html) {\n"+
   "  var frame = document.createElement('iframe');\n"+
   "  frame.style.display = 'none';\n"+
   "  document.body.appendChild(frame);\n"+
   "  frame.contentDocument.open();\n"+
   "  frame.contentDocument.write(html);\n"+
   "  frame.contentDocument.close();\n"+
   "  var bodyEl = frame.contentDocument.body.firstChild;\n"+
   "  document.body.removeChild(frame);\n"+
   "  return bodyEl;\n"+
   "};\n"+

   "$(document).ready(function () {\n"+

   "    if(!animationConfig){\n"+
   "        console.error('animationConfig is missing');\n"+
   "        return;\n"+
   "    }\n"+

   "    if(animationConfig.appIntro){\n"+
   "        const t1 = setTimeout(function(){\n"+
   "            const appIntroKeys = Object.keys(animationConfig.appIntro.animationContent);\n"+
    "           console.log('appIntroKeys:');\n"+
    "           console.log(appIntroKeys);\n"+
   "            appIntroKeys.forEach(function (key) {\n"+
   "                var data = animationConfig.appIntro.animationContent[key];\n"+
//"                   console.log('appIntroKey data:');\n"+
//"                   console.log(data);\n"+

   "                if(data.elementStyle){\n"+
   "                    var style = document.createElement('style');\n"+
   "                    style.type = 'text/css';\n"+
   "                    style.appendChild(document.createTextNode(data.elementStyle));\n"+
//"                       console.log('append appIntroKey style:');\n"+
//"                       console.log(style);\n"+
   "                    document.head.append(style);\n"+
   "                }\n"+

//"                   console.log('append appIntroKey element:');\n"+
//"                   console.log(data.element);\n"+
   "                document.body.append(str2DOMElement(data.element));\n"+

   "                if(data.animationScript){\n"+
   "                    timeouts[data.elementId] = setTimeout(function(){\n"+
   "                        var script = document.createElement('script');\n"+
   "                        script.type = 'text/javascript';\n"+
   "                        script.text = data.animationScript;\n"+

//"                           console.log('append appIntroKey script:');\n"+
//"                           console.log(data.animationScript);\n"+
   "                        document.head.append(script);\n"+

 //  "                        console.log(data.elementId + ' timeout was cleared(' + timeouts[data.elementId] + ')');\n"+
   "                        clearTimeout(timeouts[data.elementId]);\n"+
   "                    }, data.delayTimeInMillisecond - 200);\n"+
   "                }\n"+
   "            });\n"+

   //"            console.log('appIntro timeout was cleared(' + t1 + ')');\n"+
   "            clearTimeout(t1);\n"+
   "        }, animationConfig.appIntro.delayTimeInMillisecond - 200);\n"+
   "    }\n"+

   "    if(animationConfig.eventIntro){\n"+
   "        const t2 = setTimeout(function(){\n"+
   "            const eventIntroKeys = Object.keys(animationConfig.eventIntro.animationContent);\n"+
   "            eventIntroKeys.forEach(function (key) {\n"+
   "            var data = animationConfig.eventIntro.animationContent[key];\n"+
   //"            console.log(data);\n"+

   "            if(data.elementStyle){\n"+
   "                var style = document.createElement('style');\n"+
   "                style.type = 'text/css';\n"+
   "                style.appendChild(document.createTextNode(data.elementStyle));\n"+
   "                document.head.append(style);\n"+
   "            }\n"+

   "            document.body.append(str2DOMElement(data.element));\n"+

   "            if(data.animationScript){\n"+
   "                timeouts[data.elementId] = setTimeout(function(){\n"+
   "                  var script = document.createElement('script');\n"+
   "                  script.type = 'text/javascript';\n"+
   "                  script.text = data.animationScript;\n"+
   "                  document.head.append(script);\n"+

  // "                  console.log(data.elementId + 'timeout was cleared(' + timeouts[data.elementId] + ')');\n"+
   "                  clearTimeout(timeouts[data.elementId]);\n"+
   "                }, data.delayTimeInMillisecond - 200);\n"+
   "            }\n"+
        "            });\n"+

    //    "            console.log('eventIntro timeout was cleared(' + t2 + ')');\n"+
        "            clearTimeout(t2);\n"+
   "        }, animationConfig.eventIntro.delayTimeInMillisecond - 200);\n"+
   "    }\n"+

   "    if(animationConfig.photosAnimationContent){\n"+
   "        const t3 = setTimeout(function(){\n"+
   "            const photosAnimKeys = Object.keys(animationConfig.photosAnimationContent.animationContent);\n"+
   "            console.log('photos keys:');\n"+
   "            console.log(photosAnimKeys);\n"+
   "            photosAnimKeys.forEach(function (key) {\n"+
   "            var data = animationConfig.photosAnimationContent.animationContent[key];\n"+
   //"            console.log(data);\n"+

   "            if(data.elementStyle){\n"+
   "                var style = document.createElement('style');\n"+
   "                style.type = 'text/css';\n"+
   "                style.appendChild(document.createTextNode(data.elementStyle));\n"+
   "                document.head.append(style);\n"+
   "            }\n"+

   "            document.body.append(str2DOMElement(data.element));\n"+

   "            if(data.animationScript){\n"+
   "                timeouts[data.elementId] = setTimeout(function(){\n"+
   "                  var script = document.createElement('script');\n"+
   "                  script.type = 'text/javascript';\n"+
   "                  script.text = data.animationScript;\n"+
   "                  document.head.append(script);\n"+

  // "                  console.log(data.elementId + 'timeout was cleared(' + timeouts[data.elementId] + ')');\n"+
   "                  clearTimeout(timeouts[data.elementId]);\n"+
   "                }, data.delayTimeInMillisecond - 700);\n"+
   "            }\n"+
        "            });\n"+

       // "            console.log('photosAnimationContent timeout was cleared(' + t3 + ')');\n"+
        "            clearTimeout(t3);\n"+
   "        }, animationConfig.photosAnimationContent.delayTimeInMillisecond - 500);\n"+
   "    }\n"+

   "    if(animationConfig.appCompletion){\n"+
   "        const t4 = setTimeout(function(){\n"+
   "            const appCompletionKeys = Object.keys(animationConfig.appCompletion.animationContent);\n"+

        "            appCompletionKeys.forEach(function (key) {\n"+
   "            var data = animationConfig.appCompletion.animationContent[key];\n"+
   "            console.log(data);\n"+

   "            if(data.elementStyle){\n"+
   "                var style = document.createElement('style');\n"+
   "                style.type = 'text/css';\n"+
   "                style.appendChild(document.createTextNode(data.elementStyle));\n"+
   "                document.head.append(style);\n"+
   "            }\n"+

   "            document.body.append(str2DOMElement(data.element));\n"+

   "            if(data.animationScript){\n"+
   "                timeouts[data.elementId] = setTimeout(function(){\n"+
   "                  var script = document.createElement('script');\n"+
   "                  script.type = 'text/javascript';\n"+
   "                  script.text = data.animationScript;\n"+
   "                  document.head.append(script);\n"+

  // "                  console.log(data.elementId + 'timeout was cleared(' + timeouts[data.elementId] + ')');\n"+
   "                  clearTimeout(timeouts[data.elementId]);\n"+
   "                }, data.delayTimeInMillisecond - 200);\n"+
   "            }\n"+

        "            });\n"+

      //  "            console.log('appCompletion timeout was cleared(' + t4 + ')');\n"+
        "            clearTimeout(t4);\n"+
   "        }, animationConfig.appCompletion.delayTimeInMillisecond - 200);\n"+
   "    }\n"+

   "});\n" +
   "</script>";
};

const getAnimationGifs = (): any => {
    const gifs = [{
        name: "countdownSticker",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FcountdownSticker.gif?alt=media&token=5d3ac171-2d59-413b-8916-6e2d2302bab7",
        categoryKey: -1,
        categoryName: "general",
        styleClass: "gif general"
    }, {
        name: "spongeBobLove",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FbobSpongeLove.gif?alt=media&token=ad06a055-2ae4-45f4-94ea-24b6204b6fab",
        categoryKey: 6,
        categoryName: "touching",
        styleClass: "gif touching"
    }, {
        name: "confety",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2Fconfety.gif?alt=media&token=bffbf169-06a4-48d0-b26d-3c9f1f8a4086",
        categoryKey: 3,
        categoryName: "fun",
        styleClass: "gif fun"
    }, {
        name: "coolBeerCup",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FcoolBeerCup.gif?alt=media&token=944f2120-8cde-4107-8a4a-7344b4d9e6b6",
        categoryKey: 3,
        categoryName: "fun",
        styleClass: "gif fun"
    }, {
        name: "dancingBanana",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FdancingBanana.gif?alt=media&token=d3b08e82-d93e-43b7-a33c-8a875a44ce25",
        categoryKey: 7,
        categoryName: "wow",
        styleClass: "gif wow"
    }, {
        name: "dancingGrandpa",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FdancingGrandpa.gif?alt=media&token=4459c590-72ee-4fd1-ac5a-a6e218911ca1",
        categoryKey: 4,
        categoryName: "party",
        styleClass: "gif party"
    }, {
        name: "filledUpTwoBeerCups",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FfilledUpTwoBeerCups.gif?alt=media&token=1b49ea4f-245f-4121-8fbb-dda79ab5f2ca",
        categoryKey: 3,
        categoryName: "fun",
        styleClass: "gif fun"
    }, {
        name: "fireworks1",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2Ffireworks1.gif?alt=media&token=c2de3a64-72cf-4f9d-a597-2d5f9badfa8b",
        categoryKey: 4,
        categoryName: "party",
        styleClass: "gif party"
    }, {
        name: "fireworks2",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2Ffireworks2.gif?alt=media&token=d853de70-df0d-4ed7-a09a-86204b287563",
        categoryKey: 4,
        categoryName: "party",
        styleClass: "gif party"
    }, {
        name: "fireworks3",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2Ffireworks2.gif?alt=media&token=d853de70-df0d-4ed7-a09a-86204b287563",
        categoryKey: 4,
        categoryName: "party",
        styleClass: "gif party"
    }, {
        name: "fireworks4",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2Ffireworks2.gif?alt=media&token=d853de70-df0d-4ed7-a09a-86204b287563",
        categoryKey: 6,
        categoryName: "touching",
        styleClass: "gif touching"
    }, {
        name: "floatingDancer",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FfloatingDancer.gif?alt=media&token=c63c04fd-6e79-4d35-b98a-53ebe900f10c",
        categoryKey: 7,
        categoryName: "wow",
        styleClass: "gif wow"
    }, {
        name: "greenWinkMan",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FgreenWinkMan.gif?alt=media&token=c061f116-30e3-43e1-9afa-6d5a968cf5c8",
        categoryKey: 2,
        categoryName: "sweet",
        styleClass: "gif sweet"
    }, {
        name: "happyColoredDancer",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FhappyColoredDancer.gif?alt=media&token=d8865e49-068b-4571-ae9a-f3992b7e74ea",
        categoryKey: 3,
        categoryName: "fun",
        styleClass: "gif fun"
    }, {
        name: "happyFuckYahh",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FhappyFuckYahh.gif?alt=media&token=10e77994-ea5e-4674-a29e-02816c77d07e",
        categoryKey: 8,
        categoryName: "shock",
        styleClass: "gif shock"
    }, {
        name: "happyHampster",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FhappyHampster.gif?alt=media&token=e7bccf64-2840-4fd1-b27f-6cd732f3ea22",
        categoryKey: 2,
        categoryName: "sweet",
        styleClass: "gif sweet"
    }, {
        name: "hotdogWithPartyBall",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FhotdogWithPartyBall.gif?alt=media&token=b5ac7ac1-8821-42e1-96f6-815124456229",
        categoryKey: 4,
        categoryName: "party",
        styleClass: "gif party"
    }, {
        name: "increasedWhiteSquare",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FincreasedWhiteSquare.gif?alt=media&token=a4982350-d6c0-437a-ab93-af5ee8f4e6bb",
        categoryKey: 2,
        categoryName: "sweet",
        styleClass: "gif sweet"
    }, {
        name: "loveHeartSticker",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FloveHeartSticker.gif?alt=media&token=d7c45e73-ae7b-4b5d-8bf0-2585cad214ff",
        categoryKey: 1,
        categoryName: "love",
        styleClass: "gif love"
    }, {
        name: "loveRedSticker",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FloveRedSticker.gif?alt=media&token=04167592-735f-4b26-a779-c1248fda6df6",
        categoryKey: 6,
        categoryName: "touching",
        styleClass: "gif touching"
    }, {
        name: "muffine",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2Fmuffine.gif?alt=media&token=b7acb8e0-be6c-4fdb-9cd6-c204bdd15f75",
        categoryKey: 2,
        categoryName: "sweet",
        styleClass: "gif sweet"
    }, {
        name: "partySticker",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FpartySticker.gif?alt=media&token=af7fed00-2b3c-40a0-a5c4-225775693b03",
        categoryKey: 4,
        categoryName: "party",
        styleClass: "gif party"
    }, {
        name: "pinkArrow",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FpinkArrow.gif?alt=media&token=6d1b77b7-a2c5-4348-879d-5e556d1b32ff",
        categoryKey: 2,
        categoryName: "sweet",
        styleClass: "gif sweet"
    }, {
        name: "pinkGift",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FpinkGift.gif?alt=media&token=c6c3026c-3a0a-4eaa-bcc2-73e295eacbfd",
        categoryKey: 2,
        categoryName: "sweet",
        styleClass: "gif sweet"
    }, {
        name: "pinkStar",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FpinkStar.gif?alt=media&token=f4d08941-fef4-489d-aac0-06accd6a63bf",
        categoryKey: 2,
        categoryName: "sweet",
        styleClass: "gif sweet"
    }, {
        name: "pinkWineBottle",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FpinkWineBottle.gif?alt=media&token=0a44895b-c6d9-4852-9e26-e2a6b5266d49",
        categoryKey: 3,
        categoryName: "fun",
        styleClass: "gif fun"
    }, {
        name: "powSticker",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FpowSticker.gif?alt=media&token=f960f21f-e5d4-4d88-b427-2f9389a31f10",
        categoryKey: 4,
        categoryName: "party",
        styleClass: "gif party"
    }, {
        name: "purpleHearts",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FpurpleHearts.gif?alt=media&token=f5b80ebf-1690-49d0-be55-8ac67dd93360",
        categoryKey: 1,
        categoryName: "love",
        styleClass: "gif love"
    }, {
        name: "rainbowCake",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FrainbowCake.gif?alt=media&token=388f3bd2-771a-4e31-b0fa-9a96d2c392bd",
        categoryKey: 2,
        categoryName: "sweet",
        styleClass: "gif sweet"
    }, {
        name: "teenagerDancer",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FteenagerDancer.gif?alt=media&token=a3d6e569-0045-4e1b-a443-c639b69a5159",
        categoryKey: 4,
        categoryName: "party",
        styleClass: "gif party"
    }, {
        name: "twinkledArrow",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FtwinkledArrow.gif?alt=media&token=1b99e383-6e25-4bd7-9f7d-e8dead6bafcb",
        categoryKey: 3,
        categoryName: "fun",
        styleClass: "gif fun"
    }, {
        name: "twinkledStar",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FtwinkledStar.gif?alt=media&token=a9a9818f-e129-4979-9947-1ac529796bd1",
        categoryKey: 4,
        categoryName: "party",
        styleClass: "gif party"
    }, {
        name: "twistedPinkCandy",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FtwistedPinkCandy.gif?alt=media&token=11de775d-3e67-42ff-aeed-ae7b202b11af",
        categoryKey: 3,
        categoryName: "fun",
        styleClass: "gif fun"
    }, {
        name: "yasssSticker",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FyasssSticker.gif?alt=media&token=9d8c7341-2f14-45d8-85b0-9787241c516e",
        categoryKey: 7,
        categoryName: "wow",
        styleClass: "gif wow"
    }, {
        name: "yellowLight",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2FyellowLight.gif?alt=media&token=9ef7cfb4-4a04-4f63-a21e-b0248522ebfe",
        categoryKey: 4,
        categoryName: "party",
        styleClass: "gif party"
    }];
    return gifs;
};

const getAnimationImgs = (): any => {
    const imgs = [{
        name: "appIcon",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/imgs%2FappIcon.png?alt=media&token=dfc1ca78-6fa9-4f4c-a809-654cbb0e0fd4",
        categoryKey: -1,
        categoryName: "general"
    },{
        name: "saveTheDate",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/imgs%2FsaveTheDateorg.png?alt=media&token=4bc81d6e-eb39-4dfe-9950-255d286203ac",
        categoryKey: -1,
        categoryName: "general"
    },{
        name: "countdown321",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/gifs%2Fcountdown321.gif?alt=media&token=fd96ca29-8e17-4dd6-9f0d-21b4c54e157b",
        categoryKey: -1,
        categoryName: "general"
    },{
        name: "blueSquare",
        src: "https://firebasestorage.googleapis.com/v0/b/memo-11ade.appspot.com/o/imgs%2FblueSquare.png?alt=media&token=f80b2cc5-e666-439b-a7d2-3e80e02a4c36",
        categoryKey: -1,
        categoryName: "general"
    }];
    return imgs;
};

const getAnimationDelayCss = (duration = 1) => {
    return {
        className: `delay${duration}s`,
        style: `.delay${duration}s {animation-delay: ${duration}s;}
        `
    };
};

const getAnimationDurationCss = (duration = 1) => {
    return {
        className: `duration${duration}s`,
        style: `.duration${duration}s {animation-duration: ${duration}s;}
        `
    };
};

const getAnimationRotationCss = (deg = 0) => {
    //positive number (0 -> 90): left side up
    //negative number (-90 -> 0): right side up
    return {
        className: `.rotate${deg}`,
        style: `.rotate${deg} {transform: rotate(${deg}deg);}`
    };
};

const getInAnimationType = () => {
    const inKeys = Object.keys(ANIMATION_IN_TYPES);
    const rnd = Math.floor((Math.random() * inKeys.length) + 1);
    return inKeys[rnd]
};

const getOutAnimationType = ()=> {
    const inKeys = Object.keys(ANIMATION_OUT_TYPES);
    const rnd = Math.floor((Math.random() * inKeys.length) + 1);
    return inKeys[rnd]
};

const getGeneralAnimationType = () => {
    const inKeys = Object.keys(ANIMATION_GIFS_TYPES);
    const rnd = Math.floor((Math.random() * inKeys.length) + 1);
    return inKeys[rnd]
};