
export interface IRate{
 count: number;
  rate: number;
}

export interface IStreamInfo{
  inProgress: number;
  total: number;
  complete: number;
  rate: IRate;
}

export interface IStreamCounter extends IStreamInfo{
  newItem();
  itemComplete();
}

export interface IStreamItemsTimer extends IStreamInfo{
  startItemTimer(): IItemTimer;
  getRates(count?: number): IRate[];   
  getAverageRate(count?: number): IRate;    
}

export interface IItemTimer{
  stop(): IRate;
}

export abstract class StreamInfo implements IStreamInfo{
 
  constructor(private progressCallback?: () => void){
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
}

export class StreamCounter extends StreamInfo implements IStreamCounter{

  constructor(progressCallback?: () => void){
    super(progressCallback)
  }

  public newItem(){

  }

  public itemComplete(){

  }
}

export class StreamItemsTimer extends StreamInfo implements IStreamItemsTimer{
 
  constructor(progressCallback?: () => void){
    super(progressCallback)
  }

  public startItemTimer(): IItemTimer{
    return null;
  }

  public getRates(count?: number): IRate[]{
    return null;
  }

  public getAverageRate(count?: number): IRate{
    return null;
  }  
  
}
