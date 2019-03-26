import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DataHandlerService {
  public sideViewDropDownData = new Subject<any>();
  public dataFromSideView = new Subject<any>();
  public dataForMainLayout = new Subject<any>();
  public resetDropdowns = new Subject<any>();
  public clickDashboard = new Subject<any>();
  public SCMinMaxDates = new Subject<any>();
  constructor() { }

  /**
   * This method sets values coming from component Subject 
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
  /**
     * This method sets true/false to show side dropdown div
     *  which is subscribed in other component
     * @param data -incoming data from component
     */
  setDataForMainLayout(data) {
    this.dataForMainLayout.next(data);
  }

  /**
    * Group by elements acc to same category
    * @param {Array} xs - Array of items.
    * @param {string} k - On which element to group by.
    * @return return elements in similar category.
    */
  groupBySameKeyValues(xs, k) {
    return xs.reduce(function (rv, x) {
      (rv[x[k]] = rv[x[k]] || []).push(x);
      return rv;
    }, {});
  }
  resetAllDropDowns(data) {
    this.resetDropdowns.next(data);
  }

  clickDashboardLink(data){
    this.clickDashboard.next(data);
  }
setMinMaxDate(data){
 // console.log("the data passed from sc is:"+JSON.stringify(data));
  this.SCMinMaxDates.next(data);
}
}
