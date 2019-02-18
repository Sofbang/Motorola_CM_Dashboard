import { Component, OnInit } from '@angular/core';
import { SmartclientService } from '../services/lookup/smartclient.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import { ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import { ChartSelectEvent } from 'ng2-google-charts';

@Component({
  selector: 'app-smartclient-case-by-status',
  templateUrl: './smartclient-case-by-status.component.html',
  styleUrls: ['./smartclient-case-by-status.component.css']
})
export class SmartclientCaseByStatusComponent implements OnInit {
  public barChartData: any;
  //public cases: any;
  // public selectedTerritoriesCasetype: any = 'all';
  // public dropdownListCaseStatusTerritory = [];
  public territoriesArr: any = [];
  public workFlowStatusArr: any = [];
  public caseData = [];
  public data:any;
  public sideViewDropDowns = new SideViewDropDowns();
  @ViewChild('openSCModal') openScModel: ElementRef;
  constructor(private _smartclientService: SmartclientService, private _dataHandlerService: DataHandlerService) {
    this._dataHandlerService.dataFromSideView
      .subscribe(res => {
        console.log("suc sc" + JSON.stringify(res));
        let incomingData = res.data, event = res.event.toLowerCase(), from = res.from;
        if (event == 'onitemselect') {
          this.onItemSelect(incomingData, from)
        } else if (event == 'onitemdeselect') {
          this.onItemDeSelect(incomingData, from)
        } else if (event == 'onselectall') {
          this.onSelectAll(incomingData, from);
        }
        else if (event == 'ondeselectall') {
          this.onDeSelectAll(incomingData, from);
        }
      });
  }


  public selectBar(event: ChartSelectEvent) {
    console.log("in the selectBar"+JSON.stringify(event.selectedRowValues[0]));
    this.data = event.selectedRowValues[0];
    console.log("the data is:",this.data);
    this.openScModel.nativeElement.click();
    $('.modal .modal-dialog').css('width', $(window).width() * 0.95);//fixed
    $('.modal .modal-body').css('height', $(window).height() * 0.85);//fixed
    $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.69);
    $('tbody.SCModlTbody').css('overflow-y', 'scroll');
    $('tbody.SCModlTbody').css('overflow-x', 'hidden');
    // $('tbody.SCModlTbody').css('display', 'block');
    $('tbody.SCModlTbody').css('width', '100%');
     
  }

  /**
     * calling the Angular Lookup Service Method getContracts() implemented by Vishal Sehgal as on 8/2/2019
     * 
     */
  public getCaseData() {
    return new Promise((resolve, reject) => {
      let cases;
      this._smartclientService.getSCCases().
        subscribe(data => {
          cases = this.makeChartData(data);
          this.caseData = data;
          //console.log("contracts" + cases)
        }, err => console.error(err),
          // the third argument is a function which runs on completion
          () => {
            resolve(this.makeChartArr(cases));
          }
        )
    }).catch((error) => {
      console.log('errorin getting data :', error);
      reject(error);
    })
  }

  /**
    * calling the Angular smartClient Service Method getTerritoriesData() implemented by Vishal Sehgal as on 11/2/2019
    * 
    */
  public getTerritories() {
    return new Promise((resolve, reject) => {
      let territories;
      this._smartclientService.getScTerritories()
        .subscribe(data => {
          territories = data;
          //console.log("territories" + territories)
        }, err => console.error(err),
          // the third argument is a function which runs on completion
          () => {
            let array = [];
            let count = 0;
            let otherTerritory;
            for (let i in territories) {
              if (territories[i].territory == 'OTHER') {
                //console.log("The other territory " + territories[i].territory)
                // otherTerritory = territories[i].territory
                otherTerritory = { 'item_id': territories[i].territory, 'item_text': territories[i].territory };
              } else {
                array.push({ 'item_id': territories[i].territory, 'item_text': territories[i].territory });
              }
            }
            //array.push({ 'item_id': territories[i].territory, 'item_text': territories[i].territory });
            array.push(otherTerritory);
            resolve(array);
          }
        )
    }).catch((error) => {
      console.log('errorin getting data :', error);
      reject(error);

    })
  }

  public getWorkflowStatus() {
    return new Promise((resolve, reject) => {
      let workflowStatus;
      this._smartclientService.getScWorkflowStatus()
        .subscribe(data => {
          workflowStatus = data;
          //console.log("territories" + territories)
        }, err => console.error(err),
          // the third argument is a function which runs on completion
          () => {
            let array = [];
            let count = 0;
            let otherStatus, otherFlag = false;
            for (let i in workflowStatus) {
              if (workflowStatus[i].status_order == 'OTHER') {
                //console.log("The other territory " + territories[i].territory);
                if (!otherFlag) { otherStatus = { 'item_id': workflowStatus[i].status_order, 'item_text': workflowStatus[i].status_order } };
                otherFlag = true;
              } else {
                array.push({ 'item_id': workflowStatus[i].to_status, 'item_text': workflowStatus[i].to_status });
              }
            }
            array.push(otherStatus);
            // console.log("workflowStatus" + JSON.stringify(array));
            resolve(array);
          }
        )
    }).catch((error) => {
      console.log('errorin getting data :', error);
      reject(error);
    })
  }

  // public getArrivalTypeData() {
  //   return new Promise((resolve, reject) => {
  //     let arrivalType;
  //     this._smartclientService.getScArrivalType()
  //       .subscribe(data => {
  //         arrivalType = data;
  //         //console.log("territories" + territories)
  //       }, err => console.error(err),
  //         // the third argument is a function which runs on completion
  //         () => {
  //           let array = [];
  //           let count = 0;
  //           let otherStatus, otherFlag = false;
  //           for (let i in arrivalType) {
  //             array.push({ 'item_id': arrivalType[i].to_status, 'item_text': arrivalType[i].to_status });
  //           }
  //           resolve(array);
  //         }
  //       )
  //   }).catch((error) => {
  //     console.log('errorin getting data :', error);
  //     reject(error);
  //   })
  // }


  public drawChart(data) {
    //this.barChartData.dataTable = data;
    this.barChartData = {
      chartType: 'BarChart',
      dataTable: data,
      options: {
        title: '',
        titleTextStyle: {
          color: '#FFFFFF',    // any HTML string color ('red', '#cc00cc')
          fontName: 'Verdana', // i.e. 'Times New Roman'
          fontSize: 18, // 12, 18 whatever you want (don't specify px)
          bold: true,    // true or false
          italic: false
        },
        width: 800, height: 500, legend: { position: 'bottom', textStyle: { color: '#FFFFFF' } },
        backgroundColor: '#083853',
        hAxis: {
          textStyle: { color: '#FFFFFF' }
        },
        vAxis: {
          textStyle: { color: '#FFFFFF' }
        },
        series: {
          0: { color: 'FF5253' }
        },
        tooltip: { isHtml: false }
      }
    };
  }
  // ng multiselect events implemented by Vishal Sehgal 12/2/2019
  onItemSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr.push(item)
    } else if (from == 'workflow') {
      this.workFlowStatusArr.push(item);
    }
    // console.log("territory" + JSON.stringify(this.territoriesArr));
    // console.log("workflow" + JSON.stringify(this.workFlowStatusArr));
    this.filterChartData();
  }

  onItemDeSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr = this.removeElementArr(this.territoriesArr, item);
    } else if (from == 'workflow') {
      this.workFlowStatusArr = this.removeElementArr(this.workFlowStatusArr, item);;
    }
    // console.log("territory" + JSON.stringify(this.territoriesArr));
    // console.log("workflow" + JSON.stringify(this.workFlowStatusArr));
    this.filterChartData();
  }

  onSelectAll(item, from) {
    if (from == 'territory') {
      this.territoriesArr = [];
      this.territoriesArr = item
    } else if (from == 'workflow') {
      this.workFlowStatusArr = [];
      this.workFlowStatusArr = item;
    }
    this.filterChartData();
    // console.log("territory" + JSON.stringify(this.territoriesArr));
    // console.log("workflow" + JSON.stringify(this.workFlowStatusArr));
  }

  onDeSelectAll(item, from) {
    this.territoriesArr = [];
    this.workFlowStatusArr = [];
    // console.log("onDeSelectAll" + JSON.stringify(item));
    this.filterChartData();
  }

  /**
   * This method filters the data according selected territories and workflowstatus
   */
  public filterChartData() {
    let finalArr = [];
    //console.log("case data" + JSON.stringify(this.caseData));
    if (this.territoriesArr.length == 0 && this.workFlowStatusArr.length > 0) {
      //console.log("t0 s>0");
      for (let j in this.workFlowStatusArr) {
        let workflowItem = this.workFlowStatusArr[j];
        let workflowFilterarr = this.caseData.filter(item => {
          return (item.status.toLowerCase() == workflowItem.toLowerCase() || item.status_order.toLowerCase() == workflowItem.toLowerCase());
        });
        for (let i = 0; i < workflowFilterarr.length; i++) {
          finalArr.push(workflowFilterarr[i]);
        }
        //finalArr.push(workflowFilterarr);
        //finalArr = workflowFilterarr;
      }
    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length > 0) {
      //console.log("t>1 s0");
      for (let i in this.territoriesArr) {
        let territoryItem = this.territoriesArr[i];
        let territoryFilterarr = this.caseData.filter(item => {
          console.log("territoryItem" + territoryItem);
          return item.territory == territoryItem;
        });
        for (let i = 0; i < territoryFilterarr.length; i++) {
          finalArr.push(territoryFilterarr[i]);
        }
        //finalArr.push(territoryFilterarr);
        //finalArr = territoryFilterarr;
      }
    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length == 0) {
      console.log("t0 s0");
      let cases = this.makeChartData(this.caseData);
      let chartArr = this.makeChartArr(cases)
      this.drawChart(chartArr);
      return;
    }
    else {
      //console.log("t>0 s>0");
      for (let i in this.territoriesArr) {
        let territoryItem = this.territoriesArr[i];
        let territoryFilterarr = this.caseData.filter(item => {
          return item.territory.toLowerCase() == territoryItem.toLowerCase();
        });
        //console.log("territoryFilterarr" + JSON.stringify(territoryFilterarr));
        //finalArr = territoryFilterarr;
        for (let j in this.workFlowStatusArr) {
          let workflowItem = this.workFlowStatusArr[j];
          let workflowFilterarr = territoryFilterarr.filter(item => {
            return (item.status.toLowerCase() == workflowItem.toLowerCase() || item.status_order.toLowerCase() == workflowItem.toLowerCase());
          });
          for (let i = 0; i < workflowFilterarr.length; i++) {
            finalArr.push(workflowFilterarr[i]);
          }
          //console.log("workflowFilterarr" + JSON.stringify(workflowFilterarr));
          //finalArr = workflowFilterarr;
        }
      }
    }
    let cases = this.makeChartData(finalArr);
    let chartArr = this.makeChartArr(cases)
    this.drawChart(chartArr);
    // console.log("chartArr"+JSON.stringify(chartArr));
    // console.log("final arr" + JSON.stringify(finalArr));
    // console.log("group by arr" + JSON.stringify(cases));
  }

  /**
   * Array reduce function
   * @param accumulator-array item summed value
   * @param num -current array item
   */
  public sum(accumulator, num) {
    return accumulator + num;
  }

  /**
   * This method make chart data by doing groupby them as we are getting whole data from service.
   * @param data-ungrouped data it has data like open many rows of data,inprog many rows of data 
   */
  public makeChartData(data) {
    let tempArr = [];
    let finalArr = [];
    tempArr.push(this._dataHandlerService.groupBySameKeyValues(data, 'status_order'));
    //this.caseDataGrpBy=tempArr;//using in filter data
    for (let k in tempArr[0]) {
      let elmData = tempArr[0][k]
      let medianDays = [], contractsCount = [], json = {}, statusName;
      //console.log("--hello"+JSON.stringify(tempArr[k]));
      for (let i = 0; i < elmData.length; i++) {
        //console.log("--hello1"+JSON.stringify(tempArr[k][i]));
        let elem = elmData[i];
        medianDays.push(parseInt(elem.mediandays));
        contractsCount.push(parseInt(elem.contractscount));
        statusName = elem.status_order == 'OTHER' ? 'Other' : elmData[0].status
      }
      json = { status: statusName, mediandays: medianDays.reduce(this.sum), contractscount: contractsCount.reduce(this.sum) };
      finalArr.push(json);
    }
    //console.log("makeChartData" + JSON.stringify(finalArr));
    return finalArr;
  }


  /**
   * Common method to create google chart array structure.
   * @param cases -Case data.
   */
  public makeChartArr(cases) {
    let array = [];
    array.push(['Status', 'No. of Median Days', { role: "annotation" }, { role: "style" }]);
    // ARRAY OF OBJECTS
    for (let i in cases) {
      //console.log(i);
      // Create new array above and push every object in
      array.push([cases[i].status, parseInt(cases[i].mediandays), parseInt(cases[i].contractscount), '0B91E2']);
    }
    return array;
  }

  /**
   * Use to remove array item from array
   * @param array -array of elements
   * @param itemToRemove -Item to be removed like T1,T2,Open
   */
  public removeElementArr(array, itemToRemove) {
    var index = array.indexOf(itemToRemove);
    if (index !== -1) array.splice(index, 1);
    return array;
  }

  ngOnInit() {
    this.barChartData = {
      chartType: 'BarChart',
      dataTable: [],
      options: {
        title: '',
        titleTextStyle: {
          color: '#FFFFFF',    // any HTML string color ('red', '#cc00cc')
          fontName: 'Verdana', // i.e. 'Times New Roman'
          fontSize: 18, // 12, 18 whatever you want (don't specify px)
          bold: true,    // true or false
          italic: false
        },
        width: 800, height: 500, legend: { position: 'bottom', textStyle: { color: '#FFFFFF' } },
        backgroundColor: '#083853',
        hAxis: {
          textStyle: { color: '#FFFFFF' }
        },
        vAxis: {
          textStyle: { color: '#FFFFFF' }
        },
        series: {
          0: { color: 'FF5253' }
        },
        tooltip: { isHtml: false }
      }
    };

    this.getCaseData()
      .then((res: any) => {
        this.drawChart(res);
      }, error => {
        console.log("error getCaseData " + error);
      });
    this.getTerritories()
      .then((res: any) => {
        //this.drawChart(res);
        this.sideViewDropDowns.showTerritory = true;
        this.sideViewDropDowns.territoryData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }, error => {
        console.log("error getTerritories " + error);
      });
    this.getWorkflowStatus()
      .then((res: any) => {
        //this.drawChart(res);
        this.sideViewDropDowns.showWorkFlow = true;
        this.sideViewDropDowns.workFlowData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }, error => {
        console.log("error getWorkflowStatus " + error);
      });
      
        this.sideViewDropDowns.showArrivalType = true;
        this.sideViewDropDowns.arrivalTypeData = ['SAOF','CPQ','Q2SC','Other'];
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      
      
   
  }

}


