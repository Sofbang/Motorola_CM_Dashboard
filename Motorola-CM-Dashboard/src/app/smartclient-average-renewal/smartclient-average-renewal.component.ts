import { Component, OnInit } from '@angular/core';
import { SmartclientService } from '../services/lookup/smartclient.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import { ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import { ChartSelectEvent } from 'ng2-google-charts';
import { resolve } from 'path';
import { error } from 'util';
import { from } from 'rxjs';
import { ConstantPool } from '@angular/compiler';
import { last } from '@angular/router/src/utils/collection';
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
  public minmaxdates:any;
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

      this.getSCDrillDownData(status)
        .then((res: any) => {
          let currentDate: any = new Date();
          for (let i = 0; i < res.length; i++) {
            let caseCreationdate = new Date(moment(res[i].case_creation_date).format('YYYY-MM-DD'));
            let timeDiff = Math.abs(currentDate.getTime() - caseCreationdate.getTime());
            let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            //console.log("diff----"+diffDays)
            res[i]['nss_aging'] = diffDays + ' days';
            res[i].case_creation_date = moment(res[i].case_creation_date).format('YYYY-MM-DD');
            res[i].sts_changed_on = moment(res[i].sts_changed_on).format('YYYY-MM-DD');

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
    this._excelService.exportAsExcelFile(this.drillDownData, 'Smart Client Cases');

  }

  public calculatePerc(cases) {
    for (let i in cases) {

      //console.log("the cases are as under:"+JSON.stringify(cases));
      let calcPer = ((cases[i].contractscount / this.Total) * 100).toFixed(2)
      cases[i]['status_percent'] = calcPer + '%';
      //console.log("the values are :"+JSON.stringify(value));

    }
    //console.log("after the for loop in the calcPerc method:"+JSON.stringify(value));
    return cases;
  }

  public SUM(accumulator, num) {
    return accumulator + num;
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


  /**
   * 
   */
  public getCaseData() {
    return new Promise((resolve, reject) => {
      let cases = [];
      this._smartclientService.getSCCases().
        subscribe(data => {
          if (data.length > 0) {
            cases = this.makeChartData(data);
            //console.log("contracts" + JSON.stringify(cases));
            let arr = [];
            for (let i in cases) {
              arr.push(cases[i].contractscount)
            }
            this.Total = arr.reduce(this.SUM);
            //console.log("the total contracts are as under:"+JSON.stringify(this.Total)); 
            this.caseData = data;
            cases = this.calculatePerc(cases);
          }
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

  public getCaseDataAvg() {
    return new Promise((resolve, reject) => {
      let cases = [];
      this._smartclientService.getSCCasesAvg().
        subscribe(data => {
          if (data.length > 0) {
            cases = this.makeChartDataAvg(data);
            let arr = [];
            for (let i in cases) {
              arr.push(cases[i].contractscount)
            }
            this.Total = arr.reduce(this.SUM);
            //console.log("the total contracts are as under:"+JSON.stringify(this.Total)); 
            this.caseData = data;
            cases = this.calculatePerc(cases);
            this.caseData = data;
          }
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
  public getCaseDataYearly(dates, uri) {
    return new Promise((resolve, reject) => {
      let dates = { 'from': this.datesData[0], 'to': this.datesData[1] };
      this._smartclientService.getScDateFilteredReults(dates, uri)
        .subscribe(data => {
          //console.log("data------"+JSON.stringify(data));
          // let datesdata = data;	
          resolve(data);
        }, error => {
          console.log('error in getCaseDataYearly: ', error);
          reject(error);
        })
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
          title: 'Number Of Median Days',
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
    console.log("the data is:" + item + " item was" + "from is: " + from);
    if (from == 'territory') {
      this.territoriesArr.push(item);
      this.filterChartData();
    } else if (from == 'workflow') {
      this.workFlowStatusArr.push(item);
      this.filterChartData();
    } else if (from == 'casetime') {
      this._dataHandlerService.resetAllDropDowns(true);
      this.territoriesArr = [];
      this.workFlowStatusArr = [];
      this.arrivalTypesArr = [];
      // console.log("casetime selected Median" + from);
      if (item == 'Median') {
        console.log("in the If of Medain Days");
        this.restUrlFilterYr = 'sc_case_status_med_yr';
        this.fromMedOrAvg = 'median';
        //console.log("casetime selected Median" + this.restUrlFilterYr);
        this.getCaseData()
          .then((res: any) => {
            this.drawChart(res);
            // this.filterChartData();
          }, error => {
            console.log("error getCaseData " + error);
          });
      } else if (item == 'Average') {
        //console.log("in the else if of Medain Days" );
        this.restUrlFilterYr = 'sc_case_status_avg_yr';
        this.fromMedOrAvg = 'average';
        //console.log("casetime selected Averaage" + this.restUrlFilterYr);
        this.getCaseDataAvg()
          .then((res: any) => {

            this.drawChart(res);
            //this.filterChartData();
          }, error => {
            console.log("error getCaseDataAvg " + error);
          });
      }
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr.push(item);
      this.filterChartData();
    }
    // this.filterChartData();
    // console.log("territory" + JSON.stringify(this.territoriesArr));
    // console.log("workflow" + JSON.stringify(this.workFlowStatusArr));

  }

  onItemDeSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr = this.removeElementArr(this.territoriesArr, item);
    } else if (from == 'workflow') {
      this.workFlowStatusArr = this.removeElementArr(this.workFlowStatusArr, item);;
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = this.removeElementArr(this.arrivalTypesArr, item);
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
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = [];
      this.arrivalTypesArr = item;
    }
    this.filterChartData();
    // console.log("territory" + JSON.stringify(this.territoriesArr));
    // console.log("workflow" + JSON.stringify(this.workFlowStatusArr));
  }

  /**
   * Calls when to dropdown change have both from and to date
   * @param item 
   */
  onToYearChange(item) {
    //  console.log("the item is:", item);
    this.datesData = [];
    this.datesData.push(item.firstDay);
    this.datesData.push(item.lastDay);
    //console.log("the dates data is:" + JSON.stringify(this.datesData));
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
    // 
    // console.log("onDeSelectAll" + JSON.stringify(item));
    this.filterChartData();
  }

  /**
   * This method check if From and to dropdown selected.
   */
  checkDateDropdownSelected(datesData, restUrlFilterYr): any {
    return new Promise((resolve, reject) => {
      if (datesData.length > 1) {
        this.getCaseDataYearly(datesData, restUrlFilterYr)
          .then((res: any) => {
            resolve(res);
          }, error => {
            console.log("error getCaseData " + error);
            reject(error);
          });
      } else {
        resolve('nodateselected');
      }
    })
  }



  public filterChartData() {
    let finalArr = [];
    //console.log("case data" + JSON.stringify(this.caseData));
    if (this.territoriesArr.length == 0 && this.workFlowStatusArr.length > 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t0 ws>0 a0");
      this.checkDateDropdownSelected(this.datesData, this.restUrlFilterYr)
        .then(result => {
          if (result != 'nodateselected') {
            this.caseData = result;
          }
          for (let j in this.workFlowStatusArr) {
            let workflowItem = this.workFlowStatusArr[j];
            let workflowFilterarr = this.caseData.filter(item => {
              return (item.status.toLowerCase() == workflowItem.toLowerCase() || item.status_order.toLowerCase() == workflowItem.toLowerCase());
            });
            for (let i = 0; i < workflowFilterarr.length; i++) {
              finalArr.push(workflowFilterarr[i]);
            }
          }
          let cases = this.fromMedOrAvg == 'median' ? this.makeChartData(finalArr) : this.makeChartDataAvg(finalArr);
          cases = this.calculatePerc(cases);
          let chartArr = this.makeChartArr(cases);
          this.drawChart(chartArr);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });

    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length > 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t>1 ws0 a0");
      this.checkDateDropdownSelected(this.datesData, this.restUrlFilterYr)
        .then(result => {
          if (result != 'nodateselected') {
            this.caseData = result;
          }
          for (let i in this.territoriesArr) {
            let territoryItem = this.territoriesArr[i];
            let territoryFilterarr = this.caseData.filter(item => {
              // console.log("territoryItem" + territoryItem);
              return item.territory == territoryItem;
            });
            for (let i = 0; i < territoryFilterarr.length; i++) {
              finalArr.push(territoryFilterarr[i]);
            }
            //finalArr.push(territoryFilterarr);
            //finalArr = territoryFilterarr;
          }
          // let cases = this.makeChartData(finalArr);
          let cases = this.fromMedOrAvg == 'median' ? this.makeChartData(finalArr) : this.makeChartDataAvg(finalArr);
          cases = this.calculatePerc(cases);
          let chartArr = this.makeChartArr(cases)
          this.drawChart(chartArr);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });
    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length == 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t0 s0 a0");
      this.checkDateDropdownSelected(this.datesData, this.restUrlFilterYr)
        .then(result => {
          if (result != 'nodateselected') {
            this.caseData = result;
          }
          let cases = this.fromMedOrAvg == 'median' ? this.makeChartData(this.caseData) : this.makeChartDataAvg(this.caseData);
          cases = this.calculatePerc(cases);
          let chartArr = this.makeChartArr(cases)
          this.drawChart(chartArr);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });
    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length > 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t>0 s0 a>0");
      this.checkDateDropdownSelected(this.datesData, this.restUrlFilterYr)
        .then(result => {
          if (result != 'nodateselected') {
            this.caseData = result;
          }
          for (let i in this.territoriesArr) {
            let territoryItem = this.territoriesArr[i];
            let territoryFilterarr = this.caseData.filter(item => {
              return item.territory.toLowerCase() == territoryItem.toLowerCase();
            });
            //console.log("territoryFilterarr" + JSON.stringify(territoryFilterarr));
            //finalArr = territoryFilterarr;
            for (let j in this.arrivalTypesArr) {
              let arrivalTypeItem = this.arrivalTypesArr[j];
              let arrrTypeFilterAarr = territoryFilterarr.filter(item => {
                return (item.status.toLowerCase() == arrivalTypeItem.toLowerCase() || item.status_order.toLowerCase() == arrivalTypeItem.toLowerCase());
              });
              for (let i = 0; i < arrrTypeFilterAarr.length; i++) {
                finalArr.push(arrrTypeFilterAarr[i]);
              }

            }
          }
          let cases = this.fromMedOrAvg == 'median' ? this.makeChartData(finalArr) : this.makeChartDataAvg(finalArr);
          cases = this.calculatePerc(cases);
          let chartArr = this.makeChartArr(cases)
          this.drawChart(chartArr);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });
    } else if (this.workFlowStatusArr.length > 0 && this.territoriesArr.length == 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t0 s>0 a>0");
      this.checkDateDropdownSelected(this.datesData, this.restUrlFilterYr)
        .then(result => {
          if (result != 'nodateselected') {
            this.caseData = result;
          }
          for (let j in this.workFlowStatusArr) {
            let workflowItem = this.workFlowStatusArr[j];
            let workflowFilterarr = this.caseData.filter(item => {
              return (item.status.toLowerCase() == workflowItem.toLowerCase() || item.status_order.toLowerCase() == workflowItem.toLowerCase());
            });
            for (let i in this.arrivalTypesArr) {
              let arrivalTypeItem = this.arrivalTypesArr[i];
              let arrivalTypeFilterarr = workflowFilterarr.filter(item => {
                return item.arrival_type == arrivalTypeItem;
              });
              for (let i = 0; i < arrivalTypeFilterarr.length; i++) {
                finalArr.push(arrivalTypeFilterarr[i]);
              }
            }
          }
          let cases = this.fromMedOrAvg == 'median' ? this.makeChartData(finalArr) : this.makeChartDataAvg(finalArr);
          cases = this.calculatePerc(cases);
          let chartArr = this.makeChartArr(cases)
          this.drawChart(chartArr);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });

    } else if (this.workFlowStatusArr.length > 0 && this.territoriesArr.length > 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t>0 s>0 a0");
      this.checkDateDropdownSelected(this.datesData, this.restUrlFilterYr)
        .then(result => {
          if (result != 'nodateselected') {
            this.caseData = result;
          }
          for (let i in this.territoriesArr) {
            let territoryItem = this.territoriesArr[i];
            let territoryFilterarr = this.caseData.filter(item => {
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
            }
            //console.log("workflowFilterarr" + JSON.stringify(workflowFilterarr));
            //finalArr = workflowFilterarr;
          }
          let cases = this.fromMedOrAvg == 'median' ? this.makeChartData(finalArr) : this.makeChartDataAvg(finalArr);
          cases = this.calculatePerc(cases);
          let chartArr = this.makeChartArr(cases)
          this.drawChart(chartArr);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });

    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length == 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t0 s0 a>0");
      this.checkDateDropdownSelected(this.datesData, this.restUrlFilterYr)
        .then(result => {
          if (result != 'nodateselected') {
            this.caseData = result;
          }
          for (let i in this.arrivalTypesArr) {
            let arrivalTypeItem = this.arrivalTypesArr[i];
            let arrivalTypeFilterarr = this.caseData.filter(item => {

              return item.arrival_type == arrivalTypeItem;
            });
            for (let i = 0; i < arrivalTypeFilterarr.length; i++) {
              finalArr.push(arrivalTypeFilterarr[i]);
            }
          }
          //console.log("workflowFilterarr" + JSON.stringify(workflowFilterarr));
          //finalArr = workflowFilterarr;

          let cases = this.fromMedOrAvg == 'median' ? this.makeChartData(finalArr) : this.makeChartDataAvg(finalArr);
          cases = this.calculatePerc(cases);
          let chartArr = this.makeChartArr(cases)
          this.drawChart(chartArr);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });
    }
    else if (this.workFlowStatusArr.length > 0 && this.territoriesArr.length > 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t>0 s>0 a>0");
      this.checkDateDropdownSelected(this.datesData, this.restUrlFilterYr)
        .then(result => {
          if (result != 'nodateselected') {
            this.caseData = result;
          }
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
              for (let i in this.arrivalTypesArr) {
                let arrivalTypeItem = this.arrivalTypesArr[i];
                let arrivalTypeFilterarr = workflowFilterarr.filter(item => {
                  return item.arrival_type == arrivalTypeItem;
                });
                for (let i = 0; i < arrivalTypeFilterarr.length; i++) {
                  finalArr.push(arrivalTypeFilterarr[i]);
                }
              }
              // for (let i = 0; i < workflowFilterarr.length; i++) {
              
            }
          }
          // let cases = this.makeChartData(finalArr);
          let cases = this.fromMedOrAvg == 'median' ? this.makeChartData(finalArr) : this.makeChartDataAvg(finalArr);
          cases = this.calculatePerc(cases);
          let chartArr = this.makeChartArr(cases)
          this.drawChart(chartArr);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });
    }
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
     * This method make chart data by doing groupby them as we are getting whole data from service.
     * @param data-ungrouped data it has data like open many rows of data,inprog many rows of data 
     */
  public makeChartDataAvg(data) {
    let tempArr = [];
    let finalArr = [];
    tempArr.push(this._dataHandlerService.groupBySameKeyValues(data, 'status_order'));
    //this.caseDataGrpBy=tempArr;//using in filter data
    for (let k in tempArr[0]) {
      let elmData = tempArr[0][k]
      let averageDays = [], contractsCount = [], json = {}, statusName;
      //console.log("--hello"+JSON.stringify(tempArr[k]));
      for (let i = 0; i < elmData.length; i++) {
        //console.log("--hello1"+JSON.stringify(tempArr[k][i]));
        let elem = elmData[i];
        averageDays.push(parseInt(elem.averagedays));
        contractsCount.push(parseInt(elem.contractperstatus));
        statusName = elem.status_order == 'OTHER' ? 'Other' : elmData[0].status
      }
      //console.log("makeChartDataAvg "+statusName+"contractsCount "+contractsCount);
      json = { status: statusName, averagedays: averageDays.reduce(this.sum), contractscount: contractsCount.reduce(this.sum) };
      finalArr.push(json);
    }
    //console.log("makeChartDataAvg" + JSON.stringify(finalArr));
    return finalArr;
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
        // let index=parseInt(i);
        // if(cases[i].status=='Insufficient Data' || cases[i].status =='InProg Awt 3PS' || cases[i].status =='InProg Awt SSC' || cases[i].status =='InProg Awt Credit' || cases[i].status == 'InProg Awt Resource'){
        barColor = '#4A90E2';
        // }else if(cases[i].status =='InProg Awt 3PS'){
        //   barColor='#93C0F6';
        // }else if(cases[i].status =='InProg Awt SSC'){
        //   barColor='#4A90E2';
        // }else if(cases[i].status =='InProg Awt Credit'){
        //   barColor='#618CF7';
        // }else if(cases[i].status == 'InProg Awt Resource'){
        //   barColor='#164985';
        // }else{
        //   barColor='#3274C2';
        // }
        //console.log(i);
        // Create new array above and push every object in
        //array.push([cases[i].status+"  "+cases[i].status_percent,  this.fromMedOrAvg == 'median' ? "Median Days - " + parseInt(cases[i].mediandays) : "Average Days - " + parseInt(cases[i].averagedays),parseInt(cases[i].contractscount), '0B91E2']);
        array.push([cases[i].status + "  " + cases[i].status_percent, this.fromMedOrAvg == 'median' ? parseInt(cases[i].mediandays) : parseInt(cases[i].averagedays), " No. Of Cases - " + parseInt(cases[i].contractscount), barColor]);

      }
      //console.log("the array is :", array);
      return array;

    } else if (cases.length == 0) {
      this.drawChart(cases);
      this.checkDataSC = true;
      array.push(['', 0, '', '']);
      return array;
    } else {

      this.checkDataSC = true;
    }
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


  public getMinMaxDates(){
    return new Promise((resolve, reject) => {
       this._smartclientService.getScMinMaxDates().subscribe(data => {
         this.minmaxdates = data;
         // console.log("territories" + this.territories)
       }, err => console.error(err),
         // the third argument is a function which runs on completion
         () => {
           console.log("the drilldown data recived is:"+JSON.stringify(this.drillDown));
           resolve(this.minmaxdates);
         }
       )
     }).catch((error) => {
       reject(error);
       console.log('errorin getting data :', error);
     })
   }

  ngOnInit() {
    this.getCaseData()
      .then((res: any) => {
        if (res.length > 0) {
          this.drawChart(res);
          // this.checkData = false;
        } else if (res.length == 0) {
          // alert("there is no data to bind to chart");
          res = [['Status', 'Cases'], ['No Status', 0], ['No Status', 0], ['No Status', 0]];
          this.drawChart(res);
          // this.checkData = true;

        } else {
          // this.checkData = true;
        }

        this.drawChart(res);
      }, error => {
        console.log("error getCaseData " + error);
      });

      this.getMinMaxDates().then((res:any) =>{
        //console.log("res is:"+JSON.stringify(res));
        let resnew:any=res;
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


