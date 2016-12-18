
export interface IRate{
 readonly count: number;
 readonly msPerItem: number;
}

export interface IStreamInfo{
  readonly inProgress: number;
  readonly total: number;
  readonly complete: number;
}

export interface IStreamCounterInfo extends IStreamInfo{
  readonly rate: IRate;
}

export interface IStreamItemTimerInfo extends IStreamInfo{
  getAverageRate(count?: number): IRate;
  getOverallRate(count?: number): IRate; 
}

export interface IStreamCounter extends IStreamCounterInfo{
  newItem();
  itemComplete();
}

export interface IStreamItemTimer extends IStreamItemTimerInfo{
  startItemTimer(): IItemTimer;
}

export interface IItemTimer{
  stop();
}

export interface ITimer{
  getTime(): number;
}

interface ITimedItem{
  startTime: number;
  endTime?: number;
  elapsed?: number;
}

export abstract class StreamInfo implements IStreamInfo{
 
  constructor(protected _progressCallback?: () => void, protected _timer?: ITimer){
    if(!this._timer){
      this._timer = {
        getTime: () => new Date().getTime()
      }
    }
  }

  //  Properties

  private _inProgres: number = 0;

  public get inProgress(): number {
    return this._inProgres;
  }

  private _total: number = 0;

  public get total(): number {
    return this._total;
  }

  private _complete: number = 0;

  public get complete(): number {
    return this._complete;
  }

  //  Protected Functions

  protected itemStart(){
    this._inProgres++;
    this._total++;
  }

  protected itemEnd(){
    this._inProgres--;
    this._complete++;
  }

  protected reportProgress(){
    if(this._progressCallback){
      this._progressCallback();
    }
  }
}

export class StreamCounter extends StreamInfo implements IStreamCounter{

  constructor(progressCallback?: () => void, timer?: ITimer){
    super(progressCallback, timer)
  }


  //  Private Variables

  private _startTime: number;
  private _lastComplete: number;

  //  Properties

  public get rate(): IRate {
    if(isNaN(this._lastComplete) || isNaN(this._startTime)){
      return {count: 0, msPerItem: NaN};
    }

    const elapsed = this._lastComplete - this._startTime;
    const msPerItem = elapsed/ this.complete;

    return {count: this.complete, msPerItem: Math.round(msPerItem)};
  }

  //  Overridden Functions

  protected itemStart(){
    if(isNaN(this._startTime)){
      this._startTime = this._timer!.getTime();
    }

    super.itemStart();
  }

  protected itemEnd(){
    this._lastComplete = this._timer!.getTime();

    super.itemEnd();
  }

  //  Public Functions

  public newItem(){
    this.itemStart();
    this.reportProgress();
  }

  public itemComplete(){
    this.itemEnd();
    this.reportProgress();
  }
}

export class StreamItemTimer extends StreamInfo implements IStreamItemTimer{
 
  constructor(progressCallback?: () => void, timer?: ITimer){
    super(progressCallback, timer)
  }

  private _items: ITimedItem[] = [];

  //  Public Functions

  public startItemTimer(): IItemTimer{
    this.itemStart();
    this.reportProgress();

    const now = this._timer!.getTime();
    this._items.push({startTime: now});

    return { stop: () => {
      this.completeItem(now) 
    }};
  }

  public getAverageRate(count?: number): IRate{
    const completeItems = this.getCompleteItems()
        .slice(-count);

    if(completeItems.length === 0){
      return {count: 0, msPerItem: NaN};
    }

    const elapsedTimes = completeItems.map(item => item.elapsed!);
    const total = this.sumArray(elapsedTimes);
    const actualCount = completeItems.length;
    const msPerItem = total / actualCount;
    
    return {msPerItem: Math.round(msPerItem), count: actualCount};
  }

  public getOverallRate(count?: number): IRate{
    const completeItems = this.getCompleteItems()
        .slice(-count);

    if(completeItems.length === 0){
      return {count: 0, msPerItem: NaN};
    }

    const elapsed = completeItems[completeItems.length-1].endTime - completeItems[0].startTime;
    const actualCount = completeItems.length;
    const msPerItem = elapsed / actualCount;
    
    return {msPerItem: Math.round(msPerItem), count: actualCount};
  }

  //  Private Functions

  private sumArray(source: number[], startValue: number = 0): number{
    if(!source){
      return NaN;
    }

    if(source.length === 0){
      return startValue;
    }

    return this.sumArray(source.slice(1), startValue + source[0])
  }

  private completeItem(startTime: number){
    this.itemEnd();

    const matchingItems = this._items
      .filter(item => item.startTime === startTime && item.endTime === undefined);

    if(matchingItems.length > 0){
      const now = this._timer!.getTime();
      matchingItems[0].endTime = now;
      matchingItems[0].elapsed = now - matchingItems[0].startTime;
    }
  }

  private getCompleteItems(): ITimedItem[]{
    return this._items
      .filter(item => item.endTime != null && item.elapsed != null);
  }
}
