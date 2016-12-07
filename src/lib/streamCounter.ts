
export interface IRate{
 count: number;
 rate: number;
}

export interface IStreamInfo{
  inProgress: number;
  total: number;
  complete: number;
}

export interface IStreamCounter extends IStreamInfo{
  newItem();
  itemComplete();
  rate: IRate;
}

export interface IStreamItemsTimer extends IStreamInfo{
  startItemTimer(): IItemTimer;
  getRates(): IRate[];   
  getAverageRate(count?: number): IRate;
  getOverallRate(count?: number): IRate; 
}

export interface IItemTimer{
  stop(): IRate;
}

export abstract class StreamInfo implements IStreamInfo{
 
  constructor(protected _progressCallback?: () => void){
  }

  public get inProgress(): number {
    return 0;
  }

  public get total(): number {
    return 0;
  }

  public get complete(): number {
    return 0;
  }

  public get rate(): IRate {
    return null;
  }

  protected reportProgress(){
    if(this._progressCallback){
      this._progressCallback();
    }
  }
}

export class StreamCounter extends StreamInfo implements IStreamCounter{

  constructor(progressCallback?: () => void){
    super(progressCallback)
  }

  public newItem(){
    this.reportProgress();
  }

  public itemComplete(){
    this._progressCallback();
  }
}

export class StreamItemsTimer extends StreamInfo implements IStreamItemsTimer{
 
  constructor(progressCallback?: () => void){
    super(progressCallback)
  }

  public startItemTimer(): IItemTimer{
    this.reportProgress();
    return null;
  }

  public getRates(count?: number): IRate[]{
    return null;
  }

  public getAverageRate(count?: number): IRate{
    return null;
  }

  public getOverallRate(count?: number): IRate{
    return null;
  }
}
