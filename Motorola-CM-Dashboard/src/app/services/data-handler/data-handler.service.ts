import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DataHandlerService {
  public sideViewDropDownData = new Subject<any>();
  public dataFromSideView = new Subject<any>();
  constructor() { }

  /**
   * This method sets values coming from component to Subject 
   * type sideViewDropDownData which is subscribed in other component
   * @param data -incoming data from component
   */
  setSideViewDropdown(data) {
    this.sideViewDropDownData.next(data);
  }
  /**
    * This method sets values coming from component to Subject 
    * type sideViewDropDownData which is subscribed in other component
    * @param data -incoming data from component
    */
  setDataFromSideView(data) {
    this.dataFromSideView.next(data);
  }
}
