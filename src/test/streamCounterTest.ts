
class StreamInfoTests{

  constructor(private _suiteName: string){}

  public runTests(){
    describe(this._suiteName,() => {
      this.testInProgressItems();
      this.testInProgressItems();
      this.testTotalItems();
      this.testCompleteItems();
      this.testRate();
    });
  }

  protected testProgressCallBacks(){
    describe("Progress Callback",() => {
      it("Should not be called after construction",() => {
      
      });

      it("Should be called after new item",() => {
      
      });

      it("Should be called after item complete",() => {
      
      });
    });
  }

  protected testInProgressItems(){
    describe("in progress items", () => {
      it("Should increment when new item is called",() => {
      
      });
      
      it("Should decrement when item is complete",() => {
      
      });
    });
  }

  protected testTotalItems(){
    describe("total items", () => {
      it("Should increment when new item is called",() => {
      
      });
      
      it("Should not decrement when item is complete",() => {
      
      });
    });
  }

  protected testCompleteItems(){
    describe("complete items", () => {
      it("Should not increment when new item is called",() => {
      
      });
      
      it("Should increment when item is complete",() => {
      
      });
    });
  }

  protected testRate(){
    describe("rate", () => {
      
      it("Should intially return null",() => {
      
      });
      
      it("after first item it should return null",() => {
      
      });
      
      it("after first item is complete it should return a valid rate",() => {
      
      });
      
      it("for every item the rate should update",() => {
      
      });
    });
  }
}

class StreamItemTimerTests extends StreamInfoTests{

  protected testRate() {
    describe("item rates",() => {

        it("Should intially return null",() => {
        
        });
        
        it("after first item it should return null",() => {
        
        });
        
        it("after first item is complete rates should return an array of one item",() => {
          
        });
        
        it("after first item is complete the average of 5 rates should return an average of 1 rate",() => {
        
        });
        
        it("after second item is complete rates should return an array of two item",() => {
          
        });
        
        it("after second item is complete the average of 5 rates should return an average of 2 rates",() => {
        
        });
        
        it("after 8 items are complete the average of 5 rates should return an average of 5 rates",() => {
        
        });
    });
  }

}

new StreamInfoTests("Stream Counter").runTests();

new StreamItemTimerTests("Stream Items Timer").runTests();
