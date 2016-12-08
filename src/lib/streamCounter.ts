
export interface IRate{
 readonly count: number;
 readonly rate: number;
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

  public get rate(): IRate | null {
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
    this.reportProgress();
  }
}

export class StreamItemsTimer extends StreamInfo implements IStreamItemsTimer{
 
  constructor(progressCallback?: () => void){
    super(progressCallback)
  }

  public startItemTimer(): IItemTimer{
    this.reportProgress();
    return { stop: () => {} };
  }

  public getAverageRate(count?: number): IRate | null{
    return null;
  }

  public getOverallRate(count?: number): IRate | null{
    return null;
  }
}
