
import {IRate, IStreamInfo, IStreamCounter, StreamCounter, StreamItemTimer, IStreamItemTimer, ITimer, IItemTimer} from "../lib/streamCounter"

abstract class StreamInfoTests{

  constructor(){}

  public runTests(){
    describe(this._suiteName,() => {

      beforeEach(() => {

        this._timerStamps = [
          1000, 2000, 
          2150, 3350, 
          3500, 4900, 
          5052, 6652,
          6800, 8600,
          8750, 10750,
          10900, 13100,
          13252, 15702
        ];

        this._timer = {
          getTime: ():number => {
            return this._timerStamps.length > 0 ? this._timerStamps[0] : 0
          }
        }

        this._counter = this.createSystem(this._timer,this._progressFunction);
      });

      this.runSuites()
    });
  }

  private _timerStamps: number[];
  private _timer: ITimer;
  private _counter: IStreamInfo;
  private _callbackCount: number = 0;

  private _progressFunction(){
    this._callbackCount++;
  }

  //  Abstract Functions

  protected createSystem(timer: ITimer, progressFunction: () => void): IStreamInfo{
    throw Error("createSystem is abstract");
  }

  protected get _suiteName(): string{
    throw Error("get suiteName is abstract");
  }

  protected newItem(){
    throw Error("get suiteName is abstract");
  }

  protected itemComplete(){
    throw Error("get suiteName is abstract");
  }

  protected getRate(): IRate | null{
    throw Error("get suiteName is abstract");
  }

  //  Protected Functions

  protected _advanceTime(){
    this._timerStamps.shift();
  }

  protected startAndEndItem(count: number = 1){
    for(let currentCount = 0; currentCount < count; currentCount++ ){
      this.newItem();
      this.itemComplete();
    }
  }

  //  Test Suites

  protected runSuites(){
      this.testInProgressItems();
      this.testInProgressItems();
      this.testTotalItems();
      this.testCompleteItems();
      this.testRate();
  }

  protected testProgressCallBacks(){
    describe("Progress Callback",() => {
      it("Should not be called after construction",() => {
        expect(this._callbackCount).toEqual(0);      
      });

      it("Should be called after new item",() => {
        this.newItem();
        expect(this._callbackCount).toEqual(1);
        this.newItem();
        expect(this._callbackCount).toEqual(2);
        this.newItem();
        expect(this._callbackCount).toEqual(3);
        this.newItem();
        expect(this._callbackCount).toEqual(4);
      });

      it("Should be called after item complete",() => {
        this.newItem();
        this.newItem();
        this.newItem();
        this.newItem();
        this.itemComplete();
        expect(this._callbackCount).toEqual(4);
        this.itemComplete();
        expect(this._callbackCount).toEqual(5);
        this.itemComplete();
        expect(this._callbackCount).toEqual(6);
        this.itemComplete();
        expect(this._callbackCount).toEqual(7);
      });
    });
  }

  protected testInProgressItems(){
    describe("in progress items", () => {

      it("Should initially be 0",() => {
        expect(this._counter.inProgress).toEqual(0);
      });

      it("Should increment when new item is called",() => {
        this.newItem();
        expect(this._counter.inProgress).toEqual(1);
        this.newItem();
        expect(this._counter.inProgress).toEqual(2);
        this.newItem();
        expect(this._counter.inProgress).toEqual(3);
        this.newItem();
        expect(this._counter.inProgress).toEqual(4);
      });
      
      it("Should decrement when item is complete",() => {
        this.newItem();
        this.newItem();
        this.newItem();
        this.newItem();
        this.itemComplete();
        expect(this._counter.inProgress).toEqual(3);
        this.itemComplete();
        expect(this._counter.inProgress).toEqual(2);
        this.itemComplete();
        expect(this._counter.inProgress).toEqual(1);
        this.itemComplete();
        expect(this._counter.inProgress).toEqual(0);
      });
    });
  }

  protected testTotalItems(){
    describe("total items", () => {

      it("Should initially be 0",() => {
        expect(this._counter.total).toEqual(0);
      });

      it("Should increment when new item is called",() => {
        this.newItem();
        expect(this._counter.total).toEqual(1);
        this.newItem();
        expect(this._counter.total).toEqual(2);
        this.newItem();
        expect(this._counter.total).toEqual(3);
        this.newItem();
        expect(this._counter.total).toEqual(4);
      });
      
      it("Should not decrement when item is complete",() => {
        this.newItem();
        this.newItem();
        this.newItem();
        this.newItem();
        this.itemComplete();
        expect(this._counter.total).toEqual(4);
        this.itemComplete();
        expect(this._counter.total).toEqual(4);
        this.itemComplete();
        expect(this._counter.total).toEqual(4);
        this.itemComplete();
        expect(this._counter.total).toEqual(4);
      });
    });
  }

  protected testCompleteItems(){
    describe("complete items", () => {

      it("Should initially be 0",() => {
        expect(this._counter.complete).toEqual(0);
      });

      it("Should increment when new item is called",() => {
        this.newItem();
        expect(this._counter.complete).toEqual(0);
        this.newItem();
        expect(this._counter.complete).toEqual(0);
        this.newItem();
        expect(this._counter.complete).toEqual(0);
        this.newItem();
        expect(this._counter.complete).toEqual(0);
      });
      
      it("Should increment when item is complete",() => {
        this.newItem();
        this.newItem();
        this.newItem();
        this.newItem();
        this.itemComplete();
        expect(this._counter.complete).toEqual(1);
        this.itemComplete();
        expect(this._counter.complete).toEqual(2);
        this.itemComplete();
        expect(this._counter.complete).toEqual(3);
        this.itemComplete();
        expect(this._counter.complete).toEqual(4);
      });
    });
  }

  protected testRate(){
    describe("rate", () => {
      
      it("Should intially return zero rate",() => {
        expect(this.getRate()).toEqual({msPerItem: NaN, count: 0});
      });
      
      it("after first item starts it should return zero rate",() => {
        this.newItem();
        expect(this.getRate()).toEqual({msPerItem: NaN, count: 0});
      });
      
      it("after first item is complete it should return a valid rate",() => {
        this.newItem();
        this.itemComplete();
        expect(this.getRate()).toEqual({msPerItem: 1000, count: 1});
      
      });
      
      it("for every item the rate should update",() => {
        this.startAndEndItem();
        expect(this.getRate()).toEqual({msPerItem: 1000, count: 1});

        this.startAndEndItem();
        expect(this.getRate()).toEqual({msPerItem: 1175, count: 2});

        this.startAndEndItem();
        expect(this.getRate()).toEqual({msPerItem: 1300, count: 3});

        this.startAndEndItem();
        expect(this.getRate()).toEqual({msPerItem: 1413, count: 4});
      });
    });
  }
}

class StreamCounterTests extends StreamInfoTests{

  private _streamCounter: IStreamCounter

  protected createSystem(timer: ITimer, progressFunction: () => void): IStreamInfo{
    this._streamCounter = new StreamCounter(progressFunction, timer);
    return this._streamCounter;
  }

  protected get _suiteName(): string{
    return "Stream Counter";
  }

  protected newItem(){
    this._streamCounter.newItem();
    this._advanceTime();
  }

  protected itemComplete(){
    this._streamCounter.itemComplete();
    this._advanceTime();
  }

  protected getRate(): IRate | null{
    return this._streamCounter.rate;
  }
}

class StreamItemTimerTests extends StreamInfoTests{

  protected runSuites(){
    super.runSuites()

    this.testRates();
  }

  private _streamItemTimer: IStreamItemTimer
  private _timers: IItemTimer[];

  protected createSystem(timer: ITimer, progressFunction: () => void): IStreamInfo{
    this._timers = [];
    this._streamItemTimer = new StreamItemTimer(progressFunction, timer);
    return this._streamItemTimer;
  }

  protected get _suiteName(): string{
    return "Stream Items Timer";
  }

  protected newItem(){
    this._timers.push( this._streamItemTimer.startItemTimer());
    this._advanceTime();
  }

  protected itemComplete(){
    if(this._timers.length > 0){
      this._timers.shift()!.stop();
    }
    this._advanceTime();
  }

  protected getRate(): IRate | null{
    return this._streamItemTimer.getOverallRate();
  }

  protected testRates() {
    describe("overall rate",() => {
      
        it("Should intially return zero rate",() => {
          expect(this._streamItemTimer.getOverallRate()).toEqual({msPerItem: NaN, count: 0});
        });
        
        it("after first item it should return zero rate",() => {
          this.newItem();
          expect(this._streamItemTimer.getOverallRate()).toEqual({msPerItem: NaN, count: 0});
        });
        
        it("after first item is complete overallRate should return correct rate",() => {
          this.startAndEndItem();
          expect(this._streamItemTimer.getOverallRate()).toEqual({msPerItem: 1000, count: 1});
        });
        
        it("after first item is complete the overall rate of 5 rates should return an average of 1 rate",() => {
          this.startAndEndItem();
          expect(this._streamItemTimer.getOverallRate(5)).toEqual({msPerItem: 1000, count: 1});
        });
        
        it("after second item is complete the overall rate of 5 rates should return an average of 2 rates",() => {
          this.startAndEndItem(2);
          expect(this._streamItemTimer.getOverallRate(5)).toEqual({msPerItem: 1175, count: 2});
        });
        
        it("after 8 items are complete the overall rate of 5 rates should return an average of 5 rates",() => {
          this.startAndEndItem();
          expect(this._streamItemTimer.getOverallRate(5)).toEqual({msPerItem: 1000, count: 1});
          this.startAndEndItem();
          expect(this._streamItemTimer.getOverallRate(5)).toEqual({msPerItem: 1175, count: 2});
          this.startAndEndItem();
          expect(this._streamItemTimer.getOverallRate(5)).toEqual({msPerItem: 1300, count: 3});
          this.startAndEndItem();
          expect(this._streamItemTimer.getOverallRate(5)).toEqual({msPerItem: 1413, count: 4});
          this.startAndEndItem();
          expect(this._streamItemTimer.getOverallRate(5)).toEqual({msPerItem: 1520, count: 5});
          this.startAndEndItem();
          expect(this._streamItemTimer.getOverallRate(5)).toEqual({msPerItem: 1720, count: 5});
          this.startAndEndItem();
          expect(this._streamItemTimer.getOverallRate(5)).toEqual({msPerItem: 1920, count: 5});
          this.startAndEndItem();
          expect(this._streamItemTimer.getOverallRate(5)).toEqual({msPerItem: 2130, count: 5});
        });
    });

    describe("average rate",() => {
      
        it("Should intially return zero rate",() => {
          expect(this._streamItemTimer.getAverageRate()).toEqual({msPerItem: NaN, count: 0});
        });
        
        it("after first item it should return zero rate",() => {
          this.newItem();
          expect(this._streamItemTimer.getAverageRate()).toEqual({msPerItem: NaN, count: 0});
        });
        
        it("after first item is complete overallRate should return correct rate",() => {
          this.newItem();
          this.itemComplete();
          expect(this._streamItemTimer.getAverageRate()).toEqual({msPerItem: 1000, count: 1});
        });
        
        it("after first item is complete the overall rate of 5 rates should return an average of 1 rate",() => {
          this.newItem();
          this.itemComplete();
          expect(this._streamItemTimer.getAverageRate(5)).toEqual({msPerItem: 1000, count: 1});
        });
        
        it("after second item is complete the overall rate of 5 rates should return an average of 2 rates",() => {
          this.newItem();
          this.itemComplete();
          this.newItem();
          this.itemComplete();
          expect(this._streamItemTimer.getAverageRate(5)).toEqual({msPerItem: 1100, count: 2});
        });
        
        it("after 8 items are complete the overall rate of 5 rates should return an average of 5 rates",() => {
          this.startAndEndItem();
          expect(this._streamItemTimer.getAverageRate(5)).toEqual({msPerItem: 1000, count: 1});
          this.startAndEndItem();
          expect(this._streamItemTimer.getAverageRate(5)).toEqual({msPerItem: 1100, count: 2});
          this.startAndEndItem();
          expect(this._streamItemTimer.getAverageRate(5)).toEqual({msPerItem: 1200, count: 3});
          this.startAndEndItem();
          expect(this._streamItemTimer.getAverageRate(5)).toEqual({msPerItem: 1300, count: 4});
          this.startAndEndItem();
          expect(this._streamItemTimer.getAverageRate(5)).toEqual({msPerItem: 1400, count: 5});
          this.startAndEndItem();
          expect(this._streamItemTimer.getAverageRate(5)).toEqual({msPerItem: 1600, count: 5});
          this.startAndEndItem();
          expect(this._streamItemTimer.getAverageRate(5)).toEqual({msPerItem: 1800, count: 5});
          this.startAndEndItem();
          expect(this._streamItemTimer.getAverageRate(5)).toEqual({msPerItem: 2010, count: 5});
        });
    });



  }

}

new StreamCounterTests().runTests();
new StreamItemTimerTests().runTests();
