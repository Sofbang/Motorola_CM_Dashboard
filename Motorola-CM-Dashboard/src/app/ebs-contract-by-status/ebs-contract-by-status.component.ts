import { Component, OnInit } from '@angular/core';
import { EbsService } from '../services/lookup/ebs.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import { ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import { ChartSelectEvent } from 'ng2-google-charts';

@Component({
  selector: 'app-ebs-contract-by-status',
  templateUrl: './ebs-contract-by-status.component.html',
  styleUrls: ['./ebs-contract-by-status.component.css']
})
export class EbsContractByStatusComponent implements OnInit {

  public contractsData: any = [];
  // public selectedTerritories: any = 'all';
  public ebscolumnChartData: any;
  public territories: any;
  // public caseStatusTerritories: any;
  // public dropdownListTerritory = [];
  // public dropdownListCaseStatusTerritory = [];
  // public selectedItems = [];
  // public dropdownSettings = {};
  // public sideViewDropDowns = new SideViewDropDowns();
  public territoriesArr: any = [];
  public data:any;
  public workFlowStatusArr: any = [];
  public sideViewDropDowns = new SideViewDropDowns();
  @ViewChild('openSCModal') openScModel: ElementRef;

  constructor(private _ebsService: EbsService, private _dataHandlerService: DataHandlerService) {
    this._dataHandlerService.dataFromSideView
      .subscribe(res => {
        //console.log("sub ebs" + JSON.stringify(res));
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
      this._dataHandlerService.setDataForMainLayout(true);
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
  public getContractData() {
    return new Promise((resolve, reject) => {
      let contractData;
      this._ebsService.getEBSContractState().subscribe(data => {
        this.contractsData = data;
        contractData = this.makeChartData(data);
        //console.log("contracts" + this.contracts)
      }, err => console.error(err),
        // the third argument is a function which runs on completion
        () => {
          resolve(this.makeChartArr(contractData));
        }
      )
    }).catch((error) => {
      reject(error);
      console.log('errorin getting data :', error);
    })
  }

  public getebsTerritoriesData() {
    return new Promise((resolve, reject) => {
      let territories;
      this._ebsService.getEBSTerritories().subscribe(data => {
        territories = data;
        // console.log("territories" + this.territories)
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
          array.push(otherTerritory);
          console.log(array);
          resolve(array);
        }
      )
    }).catch((error) => {
      reject(error);
      console.log('errorin getting data :', error);
    })
  }

  public getWorkflowStatus() {
    return new Promise((resolve, reject) => {
      let workflowStatus;
      this._ebsService.getEBSWorkflowStatus()
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
              array.push({ 'item_id': workflowStatus[i].to_status, 'item_text': workflowStatus[i].to_status });
            }
            resolve(array);
          }
        )
    }).catch((error) => {
      console.log('errorin getting data :', error);
      reject(error);
    })
  }



  public drawchart(res) {
    this.ebscolumnChartData = {
      chartType: 'BarChart',
      dataTable: res,
      options: {
        title: '',
        titleTextStyle: {
          color: '#FFFFFF',
          fontName: 'Verdana',
          fontSize: 18,
          bold: true,
          italic: false
        },
        width: 800, height: 500, legend: { position: 'bottom', textStyle: { color: '#444444' } },
        backgroundColor: '#FFFFFF',
        hAxis: {
          textStyle: { color: '#444444' }
        },
        vAxis: {
          textStyle: { color: '#444444' }
        },
        series: {
          0: { color: '#444444' }
        },
        tooltip: { isHtml: false, type: 'string' }
      }
    }
  }

  // ng multiselect events implemented by Vishal Sehgal 12/2/2019
  onItemSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr.push(item)
    } else if (from == 'workflow') {
      this.workFlowStatusArr.push(item);
    }
    console.log("territory" + JSON.stringify(this.territoriesArr));
    console.log("workflow" + JSON.stringify(this.workFlowStatusArr));
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
        let workflowFilterarr = this.contractsData.filter(item => {
          return (item.status == workflowItem);
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
        let territoryFilterarr = this.contractsData.filter(item => {
          //console.log("territoryItem" + territoryItem);
          return item.territory == territoryItem;
        });
        for (let i = 0; i < territoryFilterarr.length; i++) {
          finalArr.push(territoryFilterarr[i]);
        }
        //finalArr.push(territoryFilterarr);
        //finalArr = territoryFilterarr;
      }
    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length == 0) {
      //console.log("t0 s0");
      let cases = this.makeChartData(this.contractsData);
      let chartArr = this.makeChartArr(cases)
      this.drawchart(chartArr);
      return;
    }
    else {
      //console.log("t>0 s>0");
      for (let i in this.territoriesArr) {
        let territoryItem = this.territoriesArr[i];
        let territoryFilterarr = this.contractsData.filter(item => {
          return item.territory == territoryItem;
        });
        //console.log("territoryFilterarr" + JSON.stringify(territoryFilterarr));
        //finalArr = territoryFilterarr;
        for (let j in this.workFlowStatusArr) {
          let workflowItem = this.workFlowStatusArr[j];
          let workflowFilterarr = territoryFilterarr.filter(item => {
            return (item.status == workflowItem);
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
    this.drawchart(chartArr);
    // console.log("chartArr" + JSON.stringify(chartArr));
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
    tempArr.push(this._dataHandlerService.groupBySameKeyValues(data, 'status'));
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
        statusName = elmData[0].status
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
    //console.log("the make chart data is :" + JSON.stringify(cases));
    let array = [];
    array.push(['Status', 'No. of Median Days', { role: "annotation" }, { role: "style" }]);
    // ARRAY OF OBJECTS
    for (let i in cases) {
      //console.log(i);
      // Create new array above and push every object in
      array.push([cases[i].status, parseInt(cases[i].mediandays), parseInt(cases[i].contractscount), '0B91E2']);
    }
    // console.log("the final cases are as under:" + JSON.stringify(array));
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
    this.ebscolumnChartData = {
      chartType: 'BarChart',
      dataTable: [],
      options: {
        title: '',
        titleTextStyle: {
          color: '#FFFFFF',
          fontName: 'Verdana',
          fontSize: 18,
          bold: true,
          italic: false
        },
        width: 800, height: 500, legend: { position: 'bottom', textStyle: { color: '#444444' } },
        backgroundColor: '#FFFFFF',
        hAxis: {
          textStyle: { color: '#444444' }
        },
        vAxis: {
          textStyle: { color: '#444444' }
        },
        series: {
          0: { color: '#444444' }
        },
        tooltip: { isHtml: false, type: 'string' }
      }
    };

    this.getContractData()
      .then((res: any) => {
        this.drawchart(res);
      }, error => {
        console.log("error getCaseData " + error);
      });

    this.getebsTerritoriesData()
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


  }


}



