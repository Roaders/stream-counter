# stream-item-timer

[![Greenkeeper badge](https://badges.greenkeeper.io/Roaders/stream-item-timer.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/roaders/stream-item-timer/badge.svg)](https://snyk.io/test/github/roaders/stream-item-timer)
[![Build Status](https://travis-ci.org/Roaders/stream-item-timer.svg?branch=master)](https://travis-ci.org/Roaders/stream-item-timer)

A library to track performance metrics for processing streams

## Installation

`npm install --save stream-item-timer`

## StreamCounter

Allows you track how many items are remaining to be processed and how fast they are being processed (average rate over the life of the stream).

### Example usage:

```
import {StreamCounter} from "stream-item-timer"

var counter = new StreamCounter(updateProgress);

function updateProgress(){
    if(!counter.rate){
        return;
    }
    console.log(counter.complete + " items complete out of " + counter.total + " total items at a rate of " + counter.rate.msPerItem + "ms per item");
}


Rx.Observable.from(arrayOfItems)
    .do(() => counter.newItem())
    .flatMap(item => doSomethingWithItem())
    .do(() => counter.itemComplete())
    .subscribe();

```
This will give an output along the lines of:
```
1 items complete out of 5 total items at a rate of 200ms per item
2 items complete out of 5 total items at a rate of 180ms per item
3 items complete out of 5 total items at a rate of 150ms per item
4 items complete out of 5 total items at a rate of 140ms per item
5 items complete out of 5 total items at a rate of 100ms per item
```

## StreamItemTimer

Allows you to see how the processing rate of items in a stream can vary over time.

### API

#### `startItemTimer(): IItemTimer`

starts a timer for an individual item. To stop the timer call `stop()` on the returned timer.

#### `getAverageRate(count?: number): IRate`

Gets the average rate for the last `count` items. If no count is passed an average for all items is returned.

The returned rate contains the item `count` and the `msPerItem`.

The average rage is the average time between the start and end time of each item. It does not include time between items if one item does not start immediately after the previous item.

The `msPerItem` will not decrease if items are run in parallel and it will not increase if there is a delay starting the next item.

#### `getOverallRate(count?: number): IRate`

Gets the overall rate for the last `count` items. If no count is passed an overall rate for all items is returned.

The returned rate contains the item `count` and the `msPerItem`.

The overall rate is the time between the start of the first item and the end of the last item divided by the number of items. This will include any delays in starting subsequent items.

The `msPerItem` will  decrease if items are run in parallel and it will increase if there is a delay starting the next item.

### Example Usage

```
import {StreamItemTimer} from "stream-item-timer"

var timer = new StreamItemTimer(updateProgress);

function updateProgress(){
    if(!timer.overallRate(5)){
        return;
    }
    var rate = timer.overallRate(5);
    console.log(timer.inProgress + " items in progress. Last " + rate.count + " items completed in " + rate.msPerItem + "ms per item" );
}


Rx.Observable.from(arrayOfItems)
    .do(() => counter.newItem())
    .flatMap(item => {
        return Rx.Observable.defer(() => {
            var timer = counter.startItemTimer();

            return Rx.Observable.just(item)
                .flatMap(item => doSomeWork())
                .do(() => timer.stop())
        });
    })
    .do(() => counter.itemComplete())
    .subscribe();

```
This will give an output along the lines of:
```
2 items in progress. Last 1 items completed in 30ms per item
3 items in progress. Last 1 items completed in 30ms per item
4 items in progress. Last 1 items completed in 30ms per item
5 items in progress. Last 1 items completed in 30ms per item
5 items in progress. Last 2 items completed in 40ms per item
5 items in progress. Last 3 items completed in 50ms per item
4 items in progress. Last 4 items completed in 60ms per item
3 items in progress. Last 5 items completed in 70ms per item
2 items in progress. Last 5 items completed in 80ms per item
1 items in progress. Last 5 items completed in 90ms per item
```

## Tests

Tests can be run as follows:

```
git clone https://github.com/Roaders/stream-item-timer.git
cd stream-item-timer
npm install
npm test
```

## Example
An example stream that uses both `StreamCounter` and `StreamItemsTimer` can be run as follows:

```
git clone https://github.com/Roaders/stream-item-timer.git
cd stream-item-timer
npm install
npm start
```
