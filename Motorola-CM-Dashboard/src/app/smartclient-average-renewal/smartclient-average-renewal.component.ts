import { Component, OnInit } from '@angular/core';
import { SmartclientService } from '../services/lookup/smartclient.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { FilterFormatSCNEWCASES } from '../beans/common_bean';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import { ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import { ChartSelectEvent } from 'ng2-google-charts';
// import { resolve } from 'path';
// import { error } from 'util';
// import { from } from 'rxjs';
// import { ConstantPool } from '@angular/compiler';
// import { last } from '@angular/router/src/utils/collection';
import { appheading } from '../enums/enum';
import { ExcelServiceService } from '../services/convert_to_excel/excel-service.service';

import * as moment from 'moment';

@Component({
  selector: 'app-smartclient-average-renewal',
  templateUrl: './smartclient-average-renewal.component.html',
  styleUrls: ['./smartclient-average-renewal.component.css']
})
export class SmartclientAverageRenewalComponent implements OnInit {
  public drillDownData: any;
  public minmaxdates: any;
  public barChartData: any;
  public Total: any;
  public drillDown: any;
  public territoriesArr: any = [];
  public workFlowStatusArr: any = [];
  public arrivalTypesArr: any = [];
  public caseData = [];
  public dateFilteredDataResults = [];
  public dateData = [];
  public datesData = [];
  public fianldates = [];
  public toYear = [];
  public selectedFrom = {};
  public data: any;
  public final = [];
  public newModelCounts: any;
  public checkDataSC: any = false;
  public sideViewDropDowns = new SideViewDropDowns();
  public restUrlFilterYr: string = 'sc_case_status_med_yr';
  @ViewChild('openSCModal') openScModel: ElementRef;
  @ViewChild('FromTo') FromTo;

  constructor(private _smartclientService: SmartclientService, private _dataHandlerService: DataHandlerService, private _excelService: ExcelServiceService) {
    this._dataHandlerService.dataFromSideView
      .subscribe(res => {
        //console.log("suc smartclient avg-ren" + JSON.stringify(res));

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
        } else if (event == 'onchangeto') {
          this.onToYearChange(incomingData);
        }
      });
    this._dataHandlerService.setDataForMainLayout(true);

  }

  public selectBar(event: ChartSelectEvent) {

    this.openScModel.nativeElement.click();

    let drillDownStatusnew = ''; let status: any; let letters = /^[0-9a-zA-Z]\s+$/;
    let statusStr = '', j = 0;
    drillDownStatusnew = (event.selectedRowValues[0]).split(' ');
    status = drillDownStatusnew[0];
    // console.log("the drilldown status is:" + JSON.stringify(status));
    for (let i = event.selectedRowValues[0].length; i > 0; i--) {
      if (event.selectedRowValues[0][i] == ' ') {
        j = i;
        //console.log("i---"+j)
        break;
      }
      //console.log("hhh--"+event.selectedRowValues[0][i].match(/^[a-zA-Z]\s+$/));
    }
    status = event.selectedRowValues[0].substring(0, j);
    if (event.message == 'select') {


      this.newModelCounts = event.selectedRowValues[2];
      this.data = event.selectedRowValues[0];
      //console.log("the data is:", this.data);
      $('.modal .modal-dialog').css('width', $(window).width() * 0.95);//fixed
      $('.modal .modal-body').css('height', $(window).height() * 0.77);//fixed
      $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.69);
      $('tbody.SCModlTbody').css('overflow-y', 'scroll');
      $('tbody.SCModlTbody').css('overflow-x', 'hidden');
      // $('tbody.SCModlTbody').css('display', 'block');
      $('tbody.SCModlTbody').css('width', '100%');
      console.log("the status is:" + JSON.stringify(status));
      this.getSCDrillDownData(status)
        .then((res: any) => {
          console.log("the srill ress:" + JSON.stringify(res));
          let currentDate: any = new Date();
          for (let i = 0; i < res.length; i++) {
            let caseCreationdate = new Date(moment(res[i].case_open_date).format('YYYY-MM-DD'));
            let timeDiff = Math.abs(currentDate.getTime() - caseCreationdate.getTime());
            let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            //console.log("diff----"+diffDays)
            res[i]['nss_aging'] = diffDays + ' days';
            res[i].case_open_date = res[i].case_open_date == null ? '-' : moment(res[i].case_open_date).format('YYYY-MM-DD');
            res[i].contracts_start_date = res[i].contracts_start_date == null ? '-' : moment(res[i].contracts_start_date).format('YYYY-MM-DD');

          }
          //console.log("the drilldowndata for ebs contracts by status is:"+JSON.stringify(this.drillDown));
          this.drillDownData = res;
        }, error => {
          console.log("error getTerritories " + error);
        });
      this.drillDown = [];

    }
  }

  public exportToExcel() {
    console.log("the data is:" + JSON.stringify(this.drillDownData));
    this._excelService.exportAsExcelFile(this.drillDownData, 'Smart Client Cases');

  }
  


  public getSCDrillDownData(status) {
    return new Promise((resolve, reject) => {
      this._smartclientService.getScDrillDown(status).subscribe(data => {
        this.drillDown = data;
        // console.log("territories" + this.territories)
      }, err => console.error(err),
        // the third argument is a function which runs on completion
        () => {
          //console.log("the drilldown data recived is:"+this.drillDown);
          resolve(this.drillDown);
        }
      )
    }).catch((error) => {
      reject(error);
      console.log('errorin getting data :', error);
    })

  }

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
            if (territories.length > 0)
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
            if (workflowStatus.length > 0)
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

  public drawChart(data) {
    //this.barChartData.dataTable = data;
    this.barChartData = {
      chartType: 'BarChart',
      dataTable: data,
      options: {
        title: '',
        titleTextStyle: {
          color: '#FFFFFF',    // any HTML string color ('red', '#cc00cc')
          fontName: 'Arial', // i.e. 'Times New Roman'
          fontSize: 18, // 12, 18 whatever you want (don't specify px)
          bold: true,    // true or false
          italic: false
        },
        width: 800, height: 500,
        chartArea: { left: 225, top: 20, width: '50%' },
        legend: { position: 'bottom', textStyle: { color: '#444444' } },
        backgroundColor: '#FFFFFF',
        hAxis: {
          textStyle: { color: '#444444' },
          title: this.fromMedOrAvg == 'median' ? 'Number Of Median Days' : 'Number Of Average Days' ,
          titleTextStyle: { italic: false }
        },
        vAxis: {
          textStyle: { color: '#444444' },
          title: 'Smart Client Status',
          titleTextStyle: { italic: false }
        },
        series: {
          0: { color: '#93C0F6' },
        },
        tooltip: { isHtml: false },
        annotations: {
          alwaysOutside: true
        }
      }
    };
  }

  public fromMedOrAvg = 'median';
  // ng multiselect events implemented by Vishal Sehgal 12/2/2019
  onItemSelect(item, from) {
 //console.log("onItemSelect"+item,"from"+from);
    this.contractTimeSelect=false;
    if (from == 'territory') {
      this.territoriesArr.push(item);
      //this.filterChartData();
    } else if (from == 'workflow') {
      this.workFlowStatusArr.push(item);
      //this.filterChartData();
    } else if (from == 'casetime') {
      this._dataHandlerService.resetAllDropDowns(true);
      this.territoriesArr = [];
      this.workFlowStatusArr = [];
      this.arrivalTypesArr = [];
      this.contractTimeSelect=true;
      // console.log("casetime selected Median" + from);
      if (item == 'Median') {
        this.fromMedOrAvg = 'median';
      } else if (item == 'Average') {
        this.fromMedOrAvg = 'average';
      }
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr.push(item);
    }
    this.filterChartData();
  }

  onItemDeSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr = this.removeElementArr(this.territoriesArr, item);
    } else if (from == 'workflow') {
      this.workFlowStatusArr = this.removeElementArr(this.workFlowStatusArr, item);;
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = this.removeElementArr(this.arrivalTypesArr, item);
    }
    this.filterChartData();
  }

  onSelectAll(item, from) {
    if (from == 'territory') {
      this.territoriesArr = [];
      this.territoriesArr = item
    } else if (from == 'workflow') {
      this.workFlowStatusArr = [];
      this.workFlowStatusArr = item;
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = [];
      this.arrivalTypesArr = item;
    }
    this.filterChartData();
  }

  /**
   * Calls when to dropdown change have both from and to date
   * @param item 
   */
  onToYearChange(item) {
    this.datesData = [];
    this.datesData.push(item.firstDay);
    this.datesData.push(item.lastDay);
    this.filterChartData();
  }

  onDeSelectAll(item, from) {
    if (from == 'territory') {
      this.territoriesArr = [];
    } else if (from == 'workflow') {
      this.workFlowStatusArr = [];
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = [];
    }
    this.filterChartData();
  }
  public totalPerc=0;
  /**
   * This method check if From and to dropdown selected.
   */
  getScCycleTimesData(cycleTimeObj): any {
    return new Promise((resolve, reject) => {
      this._smartclientService.getSCCycleTimes(cycleTimeObj)
        .subscribe(res => {
          for(let i=0;i<res.length;i++){
            this.totalPerc=this.totalPerc+parseInt(res[i].casecount)
          }
          resolve(res);
        }, error => {
          console.log(" errorgetScCycleTimesData" + error);
          reject(error);
        })
    })
  }
  public contractTimeSelect;
  checkDateDropdownSelected(filterDataObj): any {
    return new Promise((resolve, reject) => {
      let newObj = this.contractTimeSelect ? this.makeInitDataLoadObj() : filterDataObj;
      this._smartclientService.getSCCycleTimes(newObj)
        .subscribe(res => {
          this.totalPerc=0;
          for(let i=0;i<res.length;i++){
            this.totalPerc=this.totalPerc+parseInt(res[i].casecount)
          }
          //  console.log("the data after ebs cycle times is:"+JSON.stringify(res));
          //this.cycleTimesData = res;//to use in only territoy or arival type filter
          resolve(res);
        }, error => {
          reject(error);
        })
    })
  }
  makeInitDataLoadObj() {
    let lastDate = this.convertDateMoment(new Date());//current date
    let firstDate = moment(new Date()).subtract(1, 'years');//earlier date
    let cycleTimeObj = new FilterFormatSCNEWCASES();
    cycleTimeObj.from_date = this.convertDateMoment(firstDate);
    cycleTimeObj.to_date = lastDate;
    cycleTimeObj.territory_selected = false;
    cycleTimeObj.territory_data = [];
    cycleTimeObj.arrival_selected = false;
    cycleTimeObj.arrival_data = [];
    cycleTimeObj.workflow_selected = false;
    cycleTimeObj.workflow_data = [];
    return cycleTimeObj;
  }
  convertDateMoment(incominDate) {
    return moment(incominDate).format('YYYY-MM-DD');
  }

  public filterChartData() {
    let cycleTimeObj = new FilterFormatSCNEWCASES();
    if (this.datesData.length == 2) {
      cycleTimeObj.from_date = this.convertDateMoment(this.datesData[0]);
      console.log("the from:" + JSON.stringify(cycleTimeObj.from_date));
      cycleTimeObj.to_date = this.convertDateMoment(this.datesData[1]);
      console.log("the from:" + JSON.stringify(cycleTimeObj.to_date));
    } else {
      let lastDate = this.convertDateMoment(new Date());//current date
      let firstDate = moment(new Date()).subtract(1, 'years');//earlier date
      cycleTimeObj.from_date = this.convertDateMoment(firstDate);
      cycleTimeObj.to_date = lastDate;
    }
    //console.log("case data" + JSON.stringify(this.caseData));
    if (this.territoriesArr.length == 0 && this.workFlowStatusArr.length > 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t0 ws>0 a0");
      cycleTimeObj.territory_selected = false;
      cycleTimeObj.territory_data = [];
      cycleTimeObj.arrival_selected = false;
      cycleTimeObj.arrival_data = [];
      cycleTimeObj.workflow_selected = true;
      cycleTimeObj.workflow_data = this.workFlowStatusArr;
      this.checkDateDropdownSelected(cycleTimeObj)
        .then(result => {
          let chartData = this.makeChartArr(result);
          this.drawChart(chartData);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });

    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length > 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t>1 ws0 a0");
      cycleTimeObj.territory_selected = true;
      cycleTimeObj.territory_data = this.territoriesArr;
      cycleTimeObj.arrival_selected = false;
      cycleTimeObj.arrival_data = [];
      cycleTimeObj.workflow_selected = false;
      cycleTimeObj.workflow_data = [];

      this.checkDateDropdownSelected(cycleTimeObj)
        .then(result => {
          let chartData = this.makeChartArr(result);
          this.drawChart(chartData);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });
    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length == 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t0 s0 a0");
      cycleTimeObj.territory_selected = false;
      cycleTimeObj.territory_data = [];
      cycleTimeObj.arrival_selected = false;
      cycleTimeObj.arrival_data = [];
      cycleTimeObj.workflow_selected = false;
      cycleTimeObj.workflow_data = [];
      this.checkDateDropdownSelected(cycleTimeObj)
        .then(result => {
          let chartData = this.makeChartArr(result);
          this.drawChart(chartData);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });
    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length > 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t>0 s0 a>0");
      cycleTimeObj.territory_selected = true;
      cycleTimeObj.territory_data = this.territoriesArr;
      cycleTimeObj.arrival_selected = true;
      cycleTimeObj.arrival_data = this.arrivalTypesArr;
      cycleTimeObj.workflow_selected = false;
      cycleTimeObj.workflow_data = [];
      this.checkDateDropdownSelected(cycleTimeObj)
        .then(result => {
          let chartData = this.makeChartArr(result);
          this.drawChart(chartData);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });
    } else if (this.workFlowStatusArr.length > 0 && this.territoriesArr.length == 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t0 s>0 a>0");
      cycleTimeObj.territory_selected = false;
      cycleTimeObj.territory_data = [];
      cycleTimeObj.arrival_selected = true;
      cycleTimeObj.arrival_data = this.arrivalTypesArr;
      cycleTimeObj.workflow_selected = true;
      cycleTimeObj.workflow_data = this.workFlowStatusArr;
      this.checkDateDropdownSelected(cycleTimeObj)
        .then(result => {
          let chartData = this.makeChartArr(result);
          this.drawChart(chartData);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });

    } else if (this.workFlowStatusArr.length > 0 && this.territoriesArr.length > 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t>0 s>0 a0");
      cycleTimeObj.territory_selected = true;
      cycleTimeObj.territory_data = this.territoriesArr;
      cycleTimeObj.arrival_selected = false;
      cycleTimeObj.arrival_data = [];
      cycleTimeObj.workflow_selected = true;
      cycleTimeObj.workflow_data = this.workFlowStatusArr;
      this.checkDateDropdownSelected(cycleTimeObj)
        .then(result => {
          let chartData = this.makeChartArr(result);
          this.drawChart(chartData);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });

    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length == 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t0 s0 a>0");
      cycleTimeObj.territory_selected = false;
      cycleTimeObj.territory_data = [];
      cycleTimeObj.arrival_selected = true;
      cycleTimeObj.arrival_data = this.arrivalTypesArr;
      cycleTimeObj.workflow_selected = false;
      cycleTimeObj.workflow_data = [];
      this.checkDateDropdownSelected(cycleTimeObj)
        .then(result => {
          let chartData = this.makeChartArr(result);
          this.drawChart(chartData);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });
    }
    else if (this.workFlowStatusArr.length > 0 && this.territoriesArr.length > 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t>0 s>0 a>0");
      cycleTimeObj.territory_selected = true;
      cycleTimeObj.territory_data = this.territoriesArr;
      cycleTimeObj.arrival_selected = true;
      cycleTimeObj.arrival_data = this.arrivalTypesArr;
      cycleTimeObj.workflow_selected = true;
      cycleTimeObj.workflow_data = this.workFlowStatusArr;
      this.checkDateDropdownSelected(cycleTimeObj)
        .then(result => {
          let chartData = this.makeChartArr(result);
          this.drawChart(chartData);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });
    }
  }

  /**
 * Common method to create google chart array structure.
 * @param cases -Case data.
 */
  public makeChartArr(cases) {
    //console.log("the data is :" + JSON.stringify(cases.length));
    // cases=[];
    let array = [];
    array.push(['Status', this.fromMedOrAvg == 'median' ? 'No. of Median Days' : 'No. Of Average Days', { role: "annotation" }, { role: "style" }]);
    if (cases.length > 0) {
      this.drawChart(cases);
      this.checkDataSC = false;
      let barColor = null;
      // console.log("the color new array for cases are as under:"+JSON.stringify(cases));
      for (let i in cases) {
      barColor = '#4A90E2';
        array.push([cases[i].status1 + "  " + this.calculatePercent(cases[i].casecount,this.totalPerc), this.fromMedOrAvg == 'median' ? parseInt(cases[i].mediandays) : parseInt(cases[i].averagedays), " No. Of Cases - " + parseInt(cases[i].casecount), barColor]);
      }

    } else {
      this.checkDataSC = true;
      array.push(['', 0, '', '']);
    }
    return array;
  }
  calculatePercent(remValue,totalvalue){
    let percentage=((parseInt(remValue)/totalvalue)*100).toFixed(2);
  return percentage+'%';
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


  public getMinMaxDates() {
    return new Promise((resolve, reject) => {
      this._smartclientService.getScMinMaxDates().subscribe(data => {
        this.minmaxdates = data;
        // console.log("territories" + this.territories)
      }, err => console.error(err),
        // the third argument is a function which runs on completion
        () => {
          console.log("the drilldown data recived is:" + JSON.stringify(this.drillDown));
          resolve(this.minmaxdates);
        }
      )
    }).catch((error) => {
      reject(error);
      console.log('errorin getting data :', error);
    })
  }

  ngOnInit() {
    this.getScCycleTimesData(this.makeInitDataLoadObj())
      .then((res: any) => {
        let chartData = this.makeChartArr(res);
        this.drawChart(chartData);
      }, error => {
        console.log("error getCaseData " + error);
      });

    this.getMinMaxDates().then((res: any) => {
      //console.log("res is:"+JSON.stringify(res));
      let resnew: any = res;
      //console.log("the json to be sent is:"+JSON.stringify(resnew));
      this._dataHandlerService.setMinMaxDate(resnew);
      //console.log("the json is:"+JSON.stringify());
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

    this.sideViewDropDowns.showCaseTime = true;
    let caseTimeData = [{ 'item_id': 1, 'item_text': 'Median' },
    { 'item_id': 2, 'item_text': 'Average' }];
    //let caseTimeData = ['Median' , 'Average' ];
    this.sideViewDropDowns.caseTimeData = caseTimeData;
    this.sideViewDropDowns.showArrivalType = true;
    this.sideViewDropDowns.arrivalTypeData = ['SAOF', 'CPQ', 'Q2SC'];
    this.sideViewDropDowns.showYearDD = true;
    this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
    this.sideViewDropDowns.compHeading = appheading.graph5;
  }

}


