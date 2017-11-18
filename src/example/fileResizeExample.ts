
import {Observable} from "rxjs";

import {StreamCounter, StreamItemTimer} from "../lib/streamCounter"

const overallCounter = new StreamCounter(reportProgress);
const loadTimer = new StreamItemTimer(reportProgress);
const waitingForResizeCounter = new StreamCounter(reportProgress);
const resizeTimer = new StreamItemTimer(reportProgress);

var lastMessageLength: number = 0;

function reportProgress(carriageReturn:boolean = true){

    const overallLoadRate = loadTimer.getOverallRate(5);
    
    const overallResizeRate = resizeTimer.getOverallRate(5);

    let message = `${overallCounter.complete}/${overallCounter.total} (${overallCounter.rate.msPerItem}ms/item) Items Complete;`;
    message += ` ${loadTimer.inProgress} images loading (last ${overallLoadRate.count} ${overallLoadRate.msPerItem}ms/item);`
    message += ` ${waitingForResizeCounter.inProgress} images waiting to resize;`
    message += ` ${resizeTimer.inProgress} images resizing (last ${overallResizeRate.count} ${overallResizeRate.msPerItem}ms/item);`

    if(carriageReturn){
        if(lastMessageLength > message.length && (<any>process.stdout).clearLine){
            (<any>process.stdout).clearLine();
        }

        message += "\r";
        process.stdout.write(message);

        lastMessageLength = message.length;
    } else {
        console.log(message);
    }
}

function renameImage(imageName: string,size: string): string{
    return imageName.replace(".jpg","_" + size + ".jpg")
}

function loadImage(imagePath: string): Observable<string>{
    return Observable.defer(() => {
        const timer = loadTimer.startItemTimer();
        const delay = (Math.random()*500) + 500;

        return Observable.interval(delay)
            .take(1)
            .do(() => timer.stop())
            .map(() => imagePath);
    });
}

function resizeImage(imagePath: string, maxDimensions: number): Observable<string>{
    return Observable.defer(() => {
        const timer = resizeTimer.startItemTimer();
        waitingForResizeCounter.itemComplete();
        const delay = (Math.random()*750) + 250;

        return Observable.interval(delay)
            .take(1)
            .do(() => timer.stop())
            .map(() => imagePath);
    });
}

const imagePipeline = Observable.range(0,100)
    .do(() => overallCounter.newItem())
    .map(imageNumber => `Image_${imageNumber}.jpg`)
    .map(imagePath => loadImage(imagePath))
    .mergeAll(3)
    .flatMap(imagePath => {
        return Observable.from([
            {path: renameImage(imagePath,"small"), size: 500},
            {path: renameImage(imagePath,"medium"), size: 2000},
            {path: renameImage(imagePath,"large"), size: 4000}
        ]);
    })
    .map(dimensionImage => resizeImage(dimensionImage.path,dimensionImage.size))
    .do(() => waitingForResizeCounter.newItem())
    .merge(8)
    .bufferCount(3)
    .do(() => overallCounter.itemComplete())

imagePipeline.subscribe(
    image => {},
    error => console.log(`Error: ${error}`),
    () => {
        reportProgress(false);
        console.log(`All Items Complete`);
    }
);