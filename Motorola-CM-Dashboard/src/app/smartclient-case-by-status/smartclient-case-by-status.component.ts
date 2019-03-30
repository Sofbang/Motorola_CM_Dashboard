import { Component, OnInit } from '@angular/core';
import { SmartclientService } from '../services/lookup/smartclient.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import { ViewChild, ElementRef } from '@angular/core';
import { FilterFormatEBS, FilterFormatSCNEWCASES } from '../beans/common_bean';
import * as $ from 'jquery';
import { ChartSelectEvent } from 'ng2-google-charts';
import { appheading } from '../enums/enum';
import * as moment from 'moment';
import { ExcelServiceService } from '../services/convert_to_excel/excel-service.service';

@Component({
  selector: 'app-smartclient-case-by-status',
  templateUrl: './smartclient-case-by-status.component.html',
  styleUrls: ['./smartclient-case-by-status.component.css']
})
export class SmartclientCaseByStatusComponent implements OnInit {
  public barChartData: any;
  public drillDownData: any;
  public status: any;
  //public cases: any;
  // public selectedTerritoriesCasetype: any = 'all';
  // public dropdownListCaseStatusTerritory = [];
  public territoriesArr: any = [];
  public workFlowStatusArr: any = [];
  public arrivalTypesArr: any = [];
  public drillDown: any;
  public caseData = [];
  public Total: any;
  public newModelCounts = [];
  public checkDataSCS: any = false;
  public data = [];
  public sideViewDropDowns = new SideViewDropDowns();
  @ViewChild('openSCModal') openScModel: ElementRef;
  constructor(private _smartclientService: SmartclientService, private _dataHandlerService: DataHandlerService, private _excelService: ExcelServiceService) {
    this._dataHandlerService.dataFromSideView
      .subscribe(res => {
        //console.log("suc sc" + JSON.stringify(res));
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


  public selectBarScCaseByStatus(event: ChartSelectEvent) {
    //console.log("event.." + event.selectedRowValues[0].substring(0,j));
    if (event.message == 'select') {
      this.openScModel.nativeElement.click();
      this.drillDown = [];
      let drillDownStatusnew = ''; let letters = /^[0-9a-zA-Z]\s+$/;
      let statusStr = '', j = 0;
      drillDownStatusnew = (event.selectedRowValues[0]).split(' ');
      this.status = drillDownStatusnew[0];
      // console.log("the drilldown status is:" + JSON.stringify(status));
      for (let i = event.selectedRowValues[0].length; i > 0; i--) {
        if (event.selectedRowValues[0][i] == ' ') {
          j = i;
          //console.log("i---"+j)
          break;
        }
        //console.log("hhh--"+event.selectedRowValues[0][i].match(/^[a-zA-Z]\s+$/));
      }
      this.status = (event.selectedRowValues[0].substring(0, j).trim());
      //console.log("in the selectBar"+JSON.stringify(e));
      this.newModelCounts = event.selectedRowValues[1];
      //console.log("the selectBar is:" + JSON.stringify(this.newModelCounts));
      this.data = event.selectedRowValues[0];
      console.log("the case data is:" + JSON.stringify(this.caseData));
      //console.log("the second time cases are:" + JSON.stringify(event));
      //console.log("the data is:",this.data);
      $('.modal .modal-dialog').css('width', $(window).width() * 0.95);//fixed
      $('.modal .modal-body').css('height', $(window).height() * 0.77);//fixed
      $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.69);
      $('tbody.SCModlTbody').css('overflow-y', 'scroll');
      $('tbody.SCModlTbody').css('overflow-x', 'hidden');
      // $('tbody.SCModlTbody').css('display', 'block');
      $('tbody.SCModlTbody').css('width', '100%');
      console.log("the status to be passed is:" + JSON.stringify(this.status));
      this.filterChartData('drilldown');
    }
  }

  public exportToExcel() {
    this._excelService.exportAsExcelFile(this.drillDownData, 'Smart Client Cases');
  }


  public getSCDrillDownData(status) {
    return new Promise((resolve, reject) => {
      //console.log("territories" + status)
      this._smartclientService
        .getScDrillDown(status)
        .subscribe(res => {
          //this.drillDown = res;
          resolve(res);
        }, error => {
          console.log("Error getSCDrillDownData" + error);
          reject(error);
        })
    })
  }

  public totalPerc = 0;
  public getCaseData(scObj) {
    return new Promise((resolve, reject) => {
      this._smartclientService.
        getSCByStatus(scObj)
        .subscribe(res => {
          this.totalPerc=0;
          for (let i = 0; i < res.length; i++) {
            this.totalPerc = this.totalPerc + parseInt(res[i].casecount)
          }
          resolve(res);
        }, error => {
          console.log("getEBSContractState" + error);
          reject(error);
        })
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
            if (territories.length > 0)
              array.push(otherTerritory);
            resolve(array);
          }
        )
    }).catch((error) => {
      //console.log('errorin getting data :', error);
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
      //console.log('errorin getting data :', error);
      reject(error);
    })
  }

  public getArrivalTypeData() {
    return new Promise((resolve, reject) => {
      let arrivalType;
      this._smartclientService.getScArrivalType()
        .subscribe(res => {
          let array = [];
          for (let i in res) {
            array.push({ 'item_id': res[i].arrival_type, 'item_text': res[i].arrival_type });
          }
          resolve(array);
        }, err => {
          console.error(err)
        })
    })
  }


  public drawchart(data) {
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
        width: 1100, height: 400,
        chartArea: { left: 223, top: 20, width: '50%' },
        legend: { position: 'none' },
        backgroundColor: '#FFFFFF',
        hAxis: {
          textStyle: { color: '#444444' },
          title: 'Number Of Cases',
          titleTextStyle: { italic: false }
        },
        vAxis: {
          textStyle: { color: '#444444' },
          title: 'Smart Client Status',
          titleTextStyle: { italic: false }
        },
        series: {
          0: { color: '#93C0F6' }
        },
        tooltip: { isHtml: false },
        annotations: {
          alwaysOutside: true
        }
      }
    };
  }
  // ng multiselect events implemented by Vishal Sehgal 12/2/2019
  onItemSelect(item, from) {
    if (from == 'territory') {
      console.log("inside the if of territory check:" + JSON.stringify(item));
      this.territoriesArr.push(item)
      //console.log("the terr is:" + JSON.stringify(this.territoriesArr));
    } else if (from == 'workflow') {
      this.workFlowStatusArr.push(item);
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr.push(item);
    }
    this.filterChartData('dropdown');
  }

  onItemDeSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr = this.removeElementArr(this.territoriesArr, item);
    } else if (from == 'workflow') {
      this.workFlowStatusArr = this.removeElementArr(this.workFlowStatusArr, item);
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = this.removeElementArr(this.arrivalTypesArr, item);
    }
    this.filterChartData('dropdown');
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
    this.filterChartData('dropdown');
  }

  onDeSelectAll(item, from) {
    if (from == 'territory') {
      this.territoriesArr = [];
    } else if (from == 'workflow') {
      this.workFlowStatusArr = [];
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = [];
    }
    this.filterChartData('dropdown');
  }

  /**
   * This method filters the data according selected territories and workflowstatus
   */
  public filterChartData(caseFrom) {
    let finalArr = [];
    let scObj = new FilterFormatSCNEWCASES();

    if (this.territoriesArr.length == 0 && this.arrivalTypesArr.length == 0 && this.workFlowStatusArr.length > 0) {
      //console.log("t1 s>0 a0");
      scObj.territory_selected = false;
      scObj.territory_data = [];
      scObj.arrival_selected = false;
      scObj.arrival_data = [];
      scObj.workflow_selected = true;
      scObj.workflow_data = this.workFlowStatusArr;
      if (caseFrom == 'dropdown') {
        this.getCaseData(scObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            console.log("error filterChartData getCaseData" + error)
          });

      } else {
        let arr = [];
        arr.push(this.status);
        scObj.workflow_selected = true;
        scObj.workflow_data = arr;
        this.getSCDrillDownData(scObj)
          .then((res: any) => {
            let currentDate: any = new Date();
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              let caseCreationdate = new Date(moment(res[i].case_creation_date).format('YYYY-MM-DD'));
            let timeDiff = Math.abs(currentDate.getTime() - caseCreationdate.getTime());
            let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            //console.log("diff----"+diffDays)
            res[i]['nss_aging'] = diffDays + ' days';
            res[i].case_condition
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDown = res;
          }, error => {
            console.log("error getSCDrillDownData " + error);
          });
      }
    } else if (this.workFlowStatusArr.length == 0 && this.arrivalTypesArr.length == 0 && this.territoriesArr.length > 0) {
      //console.log("t>1 s0 a0");
      scObj.territory_selected = true;
      scObj.territory_data = this.territoriesArr;
      scObj.arrival_selected = false;
      scObj.arrival_data = [];
      scObj.workflow_selected = false;
      scObj.workflow_data = [];

      if (caseFrom == 'dropdown') {
        this.getCaseData(scObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            console.log("error filterChartData getCaseData" + error)
          });
      } else {
        let arr = [];
        arr.push(this.status);
        scObj.workflow_selected = true;
        scObj.workflow_data = arr;
        this.getSCDrillDownData(scObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDown = res;
          }, error => {
            console.log("error getSCDrillDownData " + error);
          });

      }
    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length == 0 && this.arrivalTypesArr.length == 0) {
      scObj.territory_selected = false;
      scObj.territory_data = [];
      scObj.arrival_selected = false;
      scObj.arrival_data = [];
      scObj.workflow_selected = false;
      scObj.workflow_data = [];
      if (caseFrom == 'dropdown') {
        this.getCaseData(scObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            console.log("error filterChartData getCaseData" + error)
          });
      }
      else {
        let arr = [];
        arr.push(this.status);
        scObj.workflow_selected = true;
        scObj.workflow_data = arr;
        this.getSCDrillDownData(scObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDown = res;
          }, error => {
            console.log("error getSCDrillDownData " + error);
          });
      }
    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length == 0 && this.arrivalTypesArr.length > 0) {

      scObj.territory_selected = false;
      scObj.territory_data = [];
      scObj.arrival_selected = true;
      scObj.arrival_data = this.arrivalTypesArr;
      scObj.workflow_selected = false;
      scObj.workflow_data = [];
      if (caseFrom == 'dropdown') {
        this.getCaseData(scObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            console.log("error filterChartData getCaseData" + error)
          });
      }
      else {
        let arr = [];
        arr.push(this.status);
        scObj.workflow_selected = true;
        scObj.workflow_data = arr;
        this.getSCDrillDownData(scObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDown = res;
          }, error => {
            console.log("error getSCDrillDownData " + error);
          });

      }
    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length > 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t>0 s0 a>0");
      scObj.territory_selected = true;
      scObj.territory_data = this.territoriesArr;
      scObj.arrival_selected = true;
      scObj.arrival_data = this.arrivalTypesArr;
      scObj.workflow_selected = false;
      scObj.workflow_data = [];
      if (caseFrom == 'dropdown') {
        this.getCaseData(scObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            console.log("error filterChartData getCaseData" + error)
          });
      }
      else {
        let arr = [];
        arr.push(this.status);
        scObj.workflow_selected = true;
        scObj.workflow_data = arr;
        this.getSCDrillDownData(scObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDown = res;
          }, error => {
            console.log("error getSCDrillDownData " + error);
          });

      }
    } else if (this.workFlowStatusArr.length > 0 && this.territoriesArr.length == 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t0 s>0 a>0");
      scObj.territory_selected = false;
      scObj.territory_data = [];
      scObj.arrival_selected = true;
      scObj.arrival_data = this.arrivalTypesArr;
      scObj.workflow_selected = true;
      scObj.workflow_data = this.workFlowStatusArr;
      if (caseFrom == 'dropdown') {
        this.getCaseData(scObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            console.log("error filterChartData getCaseData" + error)
          });
      }
      else {

        let arr = [];
        arr.push(this.status);
        scObj.workflow_selected = true;
        scObj.workflow_data = arr;
        this.getSCDrillDownData(scObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDown = res;
          }, error => {
            console.log("error getSCDrillDownData " + error);
          });

      }
    } else if (this.workFlowStatusArr.length > 0 && this.territoriesArr.length > 0 && this.arrivalTypesArr.length == 0) {
      // console.log("t>0 s>0 a0");
      scObj.territory_selected = true;
      scObj.territory_data = this.territoriesArr;
      scObj.arrival_selected = false;
      scObj.arrival_data = [];
      scObj.workflow_selected = true;
      scObj.workflow_data = this.workFlowStatusArr;
      if (caseFrom == 'dropdown') {
        this.getCaseData(scObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            console.log("error filterChartData getCaseData" + error)
          });
      }
      else {
        let arr = [];
        arr.push(this.status);
        scObj.workflow_selected = true;
        scObj.workflow_data = arr;
        this.getSCDrillDownData(scObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDown = res;
          }, error => {
            console.log("error getSCDrillDownData " + error);
          });
      }
    }
    else {
      //console.log("t>0 s>0 a>0");    
      scObj.territory_selected = true;
      scObj.territory_data = this.territoriesArr;
      scObj.arrival_selected = true;
      scObj.arrival_data = this.arrivalTypesArr;
      scObj.workflow_selected = true;
      scObj.workflow_data = this.workFlowStatusArr;
      if (caseFrom == 'dropdown') {
        this.getCaseData(scObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            console.log("error filterChartData getCaseData" + error)
          });
      }
      else {
        let arr = [];
        arr.push(this.status);
        scObj.workflow_selected = true;
        scObj.workflow_data = arr;
        this.getSCDrillDownData(scObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDown = res;
          }, error => {
            console.log("error getSCDrillDownData " + error);
          });

      }
    }
  }

  /**
   * Common method to create google chart array structure.
   * @param cases -Case data.
   */
  public makeChartArr(cases) {
    // cases=[];
    let array = [];
    array.push(['Status', 'No. Of Cases', { role: "annotation" }, { role: "style" }]);
    if (cases.length > 0) {
      //this.drawChart(cases);
      this.checkDataSCS = false;
      let barColor = null;

      for (let i in cases) {
        let index = parseInt(i);
        if (cases[i].status1 == 'Insufficient Data' || cases[i].status1 == 'InProg Awt 3PS' || cases[i].status1 == 'InProg Awt SSC' || cases[i].status1 == 'InProg Awt Credit' || cases[i].status1 == 'InProg Awt Resource') {
          barColor = '#93C0F6';
        }
        else {
          barColor = '#3274C2';
        }
        array.push([cases[i].status1 + "  " + this.calculatePercent(cases[i].casecount, this.totalPerc), parseInt(cases[i].casecount), "Median Days - " + parseInt(cases[i].mediandays), barColor]);
      }

    } else if (cases.length == 0) {
      //cases = [['Status','Cases'],['No_Status',0]];
      this.checkDataSCS = true;
      array.push(['', 0, '', '']);
    }

    return array;
  }
  calculatePercent(remValue, totalvalue) {
    let percentage = ((parseInt(remValue) / totalvalue) * 100).toFixed(2);
    return percentage + '%';
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
    let scObj = new FilterFormatEBS();
    scObj.territory_selected = false;
    scObj.territory_data = [];
    scObj.arrival_selected = false;
    scObj.arrival_data = [];
    scObj.workflow_selected = false;
    scObj.workflow_data = [];
    this.getCaseData(scObj)
      .then((res: any) => {
        let arr = this.makeChartArr(res)
        this.drawchart(arr);
      }, error => {
        console.log("error getCaseData " + error);
      });

    this.getTerritories()
      .then((res: any) => {
        // this.drawChart(res);
        this.sideViewDropDowns.showTerritory = true;
        this.sideViewDropDowns.territoryData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }, error => {
        //console.log("error getTerritories " + error);
      });
    this.getWorkflowStatus()
      .then((res: any) => {
        //this.drawChart(res);
        this.sideViewDropDowns.showWorkFlow = true;
        this.sideViewDropDowns.workFlowData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }, error => {
        //console.log("error getWorkflowStatus " + error);
      });
    this.getArrivalTypeData()
      .then((res: any) => {
        //this.drawChart(res);
        console.log("Arrival type" + JSON.stringify(res));
        this.sideViewDropDowns.showArrivalType = true;
        this.sideViewDropDowns.arrivalTypeData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }, error => {
        //console.log("error getWorkflowStatus " + error);
      });
    // this.sideViewDropDowns.showArrivalType = true;
    this.sideViewDropDowns.showYearDD = false;
    // this.sideViewDropDowns.arrivalTypeData = ['SAOF', 'CPQ', 'Q2SC'];
    // this.sideViewDropDowns.showArrivalType = true;
    this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
    this.sideViewDropDowns.compHeading = appheading.graph1;
  }

}


