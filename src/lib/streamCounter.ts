
export interface IRate{
 readonly count: number;
 readonly msPerItem: number;
}

export interface IStreamInfo{
  readonly inProgress: number;
  readonly total: number;
  readonly complete: number;
}

export interface IStreamCounter extends IStreamInfo{
  newItem();
  itemComplete();
  readonly rate: IRate | null;
}

export interface IStreamItemsTimer extends IStreamInfo{
  startItemTimer(): IItemTimer;
  getAverageRate(count?: number): IRate | null;
  getOverallRate(count?: number): IRate | null; 
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
 
  constructor(protected _timer: ITimer, protected _progressCallback?: () => void){
  }

  //  Private Variables

  private _startTime: number;
  private _lastComplete: number;

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

  public get rate(): IRate | null {
    if(isNaN(this._lastComplete) || isNaN(this._startTime)){
      return null;
    }

    const elapsed = this._lastComplete - this._startTime;
    const msPerItem = elapsed/ this.complete;

    return {count: this.complete, msPerItem: msPerItem};
  }

  //  Protected Functions

  protected itemStart(){
    if(isNaN(this._startTime)){
      this._startTime = this._timer.getTime();
    }

    this._inProgres++;
    this._total++;
  }

  protected itemEnd(){
    this._lastComplete = this._timer.getTime();

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

  constructor(timer: ITimer, progressCallback?: () => void){
    super(timer, progressCallback)
  }

  public newItem(){
    this.itemStart();
    this.reportProgress();
  }

  public itemComplete(){
    this.itemEnd();
    this.reportProgress();
  }
}

export class StreamItemsTimer extends StreamInfo implements IStreamItemsTimer{
 
  constructor(timer: ITimer, progressCallback?: () => void){
    super(timer, progressCallback)
  }

  private _items: ITimedItem[] = [];

  //  Public Functions

  public startItemTimer(): IItemTimer{
    this.itemStart();
    this.reportProgress();

    const now = this._timer.getTime();
    this._items.push({startTime: now});

    return { stop: () => {
      this.completeItem(now) 
    }};
  }

  public getAverageRate(count?: number): IRate | null{
    const completeItems = this.getCompleteItems()
        .slice(-count);

    if(completeItems.length === 0){
      return null;
    }

    const elapsedTimes = completeItems.map(item => item.elapsed!);
    const total = this.sumArray(elapsedTimes);
    const actualCount = completeItems.length;
    const msPerItem = total / actualCount;
    
    return {msPerItem: msPerItem, count: actualCount};
  }

  public getOverallRate(count?: number): IRate | null{
    const completeItems = this.getCompleteItems()
        .slice(-count);

    if(completeItems.length === 0){
      return null;
    }

    const elapsed = completeItems[completeItems.length-1].endTime - completeItems[0].startTime;
    const actualCount = completeItems.length;
    const msPerItem = elapsed / actualCount;
    
    return {msPerItem: msPerItem, count: actualCount};
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
      const now = this._timer.getTime();
      matchingItems[0].endTime = now;
      matchingItems[0].elapsed = now - matchingItems[0].startTime;
    }
  }

  private getCompleteItems(): ITimedItem[]{
    return this._items
      .filter(item => item.endTime != null && item.elapsed != null);
  }
}
