
import {IRate, IStreamInfo, IStreamCounter, StreamCounter, StreamItemsTimer, IStreamItemsTimer} from "../lib/streamCounter"

abstract class StreamInfoTests{

  constructor(){}

  public runTests(){
    describe(this._suiteName,() => {

      beforeEach(() => {
        this._counter = this.createSystem(this.progressFunction);
      });

      this.runSuites()
    });
  }

  private _counter: IStreamInfo;
  private _callbackCount: number = 0;

  private progressFunction(){
    this._callbackCount++;
  }

  //  Abstract Functions

  protected createSystem(progressFunction: () => void): IStreamInfo{
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

  protected getRate(): IRate{
    throw Error("get suiteName is abstract");
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
      
      it("Should decrement when item is complete",() => {
        this.newItem();
        this.newItem();
        this.newItem();
        this.newItem();
        this.itemComplete();
        this.itemComplete();
        this.itemComplete();
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
      
      it("Should decrement when item is complete",() => {
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
      
      it("Should intially return null",() => {
        expect(this.getRate()).toEqual(null);
      });
      
      it("after first item it should return null",() => {
        this.newItem();
        expect(this.getRate()).toEqual(null);
      });
      
      it("after first item is complete it should return a valid rate",() => {
        this.itemComplete();
        expect(this.getRate()).toEqual({rate: 1000, count: 1});
      
      });
      
      it("for every item the rate should update",() => {
        this.newItem();
        this.itemComplete();
        expect(this.getRate()).toEqual({rate: 1000, count: 1});
        this.itemComplete();
        expect(this.getRate()).toEqual({rate: 1200, count: 2});
        this.itemComplete();
        expect(this.getRate()).toEqual({rate: 1400, count: 3});
        this.itemComplete();
        expect(this.getRate()).toEqual({rate: 1600, count: 4});
      });
    });
  }
}

class StreamCounterTests extends StreamInfoTests{

  private _streamCounter: IStreamCounter

  protected createSystem(progressFunction: () => void): IStreamInfo{
    this._streamCounter = new StreamCounter(progressFunction);
    return this._streamCounter;
  }

  protected get _suiteName(): string{
    return "Stream Counter";
  }

  protected newItem(){
    this._streamCounter.newItem();
  }

  protected itemComplete(){
    this._streamCounter.itemComplete();
  }

  protected getRate(): IRate{
    return this._streamCounter.rate;
  }
}

class StreamItemTimerTests extends StreamInfoTests{

  protected runSuites(){
    super.runSuites()

    this.testAverageRate();
  }

  private _streamItemsTimer: IStreamItemsTimer

  protected createSystem(progressFunction: () => void): IStreamInfo{
    this._streamItemsTimer = new StreamItemsTimer(progressFunction);
    return this._streamItemsTimer;
  }

  protected get _suiteName(): string{
    return "Stream Items Timer";
  }

  protected newItem(){
    this._streamItemsTimer.startItemTimer()
  }

  protected itemComplete(){
    throw Error("To be implemented");
  }

  protected getRate(): IRate{
    return this._streamItemsTimer.getOverallRate();
  }

  protected testAverageRate() {
    describe("item rates",() => {
      
        it("Should intially return null",() => {
          expect(this._streamItemsTimer.getRates()).toEqual(null);
          expect(this._streamItemsTimer.getAverageRate()).toEqual(null);
        });
        
        it("after first item it should return null",() => {
          this.newItem();
          expect(this._streamItemsTimer.getRates()).toEqual(null);
          expect(this._streamItemsTimer.getAverageRate()).toEqual(null);
        });
        
        it("after first item is complete rates should return an array of one item",() => {
          this.newItem();
          this.itemComplete();
          expect(this._streamItemsTimer.getRates()).toEqual([{rate: 1000, count: 1}]);
        });
        
        it("after first item is complete the average of 5 rates should return an average of 1 rate",() => {
          this.newItem();
          this.itemComplete();
          expect(this._streamItemsTimer.getAverageRate(5)).toEqual({rate: 1000, count: 1});
        });
        
        it("after second item is complete rates should return an array of two item",() => {
          this.newItem();
          this.itemComplete();
          expect(this._streamItemsTimer.getRates()).toEqual([{rate: 1000, count: 1},{rate: 1000, count: 1}]);
        });
        
        it("after second item is complete the average of 5 rates should return an average of 2 rates",() => {
          this.newItem();
          this.itemComplete();
          this.newItem();
          this.itemComplete();
          expect(this._streamItemsTimer.getAverageRate(5)).toEqual({rate: 1200, count: 2});
        });
        
        it("after 8 items are complete the average of 5 rates should return an average of 5 rates",() => {
          this.newItem();
          this.itemComplete();
          this.newItem();
          this.itemComplete();
          this.newItem();
          this.itemComplete();
          this.newItem();
          this.itemComplete();
          this.newItem();
          this.itemComplete();
          this.newItem();
          this.itemComplete();
          this.newItem();
          this.itemComplete();
          this.newItem();
          this.itemComplete();
          expect(this._streamItemsTimer.getAverageRate(5)).toEqual({rate: 1800, count: 5});
        });
    });
  }

}

new StreamCounterTests().runTests();
new StreamItemTimerTests().runTests();
