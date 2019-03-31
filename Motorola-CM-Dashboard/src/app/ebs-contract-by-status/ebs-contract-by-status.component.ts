import { Component, OnInit } from '@angular/core';
import { EbsService } from '../services/lookup/ebs.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { FilterFormatEBS } from '../beans/common_bean';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import { ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import { ChartSelectEvent } from 'ng2-google-charts';
import { appheading } from '../enums/enum';
import * as moment from 'moment';
import { ExcelServiceService } from '../services/convert_to_excel/excel-service.service';

@Component({
  selector: 'app-ebs-contract-by-status',
  templateUrl: './ebs-contract-by-status.component.html',
  styleUrls: ['./ebs-contract-by-status.component.css']
})
export class EbsContractByStatusComponent implements OnInit {

  public contractsData: any = [];
  // public selectedTerritories: any = 'all';
  public ebscolumnChartData: any;
  public drillDownData: any;
  public territories: any;
  public drillDown: any;
  public status: any;
  public checkDataEBS: any = false;
  public territoriesArr: any = [];
  public arrivalTypesArr: any = [];
  public data: any;
  public newModelCounts: any;
  public workFlowStatusArr: any = [];
  public Total: any;
  // public comesFrom='';
  // public status:any;
  public sideViewDropDowns = new SideViewDropDowns();
  @ViewChild('openSCModal') openScModel: ElementRef;

  constructor(private _ebsService: EbsService, private _dataHandlerService: DataHandlerService, private _excelService: ExcelServiceService) {
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
    if (event.message == 'select') {

      this.openScModel.nativeElement.click();
      this.drillDown = [];
      let drillDownStatusnew = ''; let status: any; let letters = /^[0-9a-zA-Z]\s+$/;
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
      this.status = (event.selectedRowValues[0].substring(0, j)).trim();
      this.newModelCounts = event.selectedRowValues[1];
      this.data = event.selectedRowValues[0];
      //this.status = this.fdld(this.data);
      //console.log("the data is:", JSON.stringify(this.data));
      $('.modal .modal-dialog').css('width', $(window).width() * 0.95);//fixed
      $('.modal .modal-body').css('height', $(window).height() * 0.77);//fixed
      $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.69);
      $('tbody.SCModlTbody').css('overflow-y', 'scroll');
      $('tbody.SCModlTbody').css('overflow-x', 'hidden');
      // $('tbody.SCModlTbody').css('display', 'block');
      $('tbody.SCModlTbody').css('width', '100%');
      // console.log("the status passed is:" + JSON.stringify(this.status));
      // this.comesFrom = 'drilldown'; 
      this.filterChartData('drilldown');
      this.newModelCounts = '';
    }
  }
  public exportToExcel() {
    // console.log("the excel data is :"+JSON.stringify(this.drillDownData));
    this._excelService.exportAsExcelFile(this.drillDownData, 'EBS Contracts By Status');

  }

  public calculatePerc(cases) {
    for (let i in cases) {
      let calcPer = ((cases[i].contractscount / this.Total) * 100).toFixed(2)
      cases[i]['status_percent'] = calcPer + '%';
    }
    return cases;
  }

  public SUM(accumulator, num) {
    return accumulator + num;
  }

  public totalPerc = 0;
  public getContractData(ebsObj) {
    return new Promise((resolve, reject) => {
      this._ebsService.getEBSContractState(ebsObj)
        .subscribe(res => {
          this.totalPerc=0;
          for (let i = 0; i < res.length; i++) {
            this.totalPerc = this.totalPerc + parseInt(res[i].contractscount)
          }
          resolve(res);
        }, error => {
          // console.log("getEBSContractState" + error);
        })
    })
  }

  public getEBSDrillDownData(status) {
    return new Promise((resolve, reject) => {
      // let jsonObj = { 'first': this.status[0], 'last': this.status[1] };
      this._ebsService.getEBSDrillDownStatus(status).subscribe(data => {
        this.drillDown = data;
        // console.log("territories" + this.territories)
      }, err => console.error(err),
        // the third argument is a function which runs on completion
        () => {
          // console.log("the drilldown data recived is:" + this.drillDown);
          resolve(this.drillDown);
        }
      )
    }).catch((error) => {
      reject(error);
      // console.log('errorin getting data :', error);
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
          if (territories.length > 0)
            array.push(otherTerritory);
          resolve(array);
        }
      )
    }).catch((error) => {
      reject(error);
      //console.log('errorin getting data :', error);
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
      // console.log('errorin getting data :', error);
      reject(error);
    })
  }

  public getArrivalType() {
    return new Promise((resolve, reject) => {
      let workflowStatus;
      this._ebsService.getEBSArrivalType()
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
              array.push({ 'item_id': workflowStatus[i].arrival_type, 'item_text': workflowStatus[i].arrival_type });
            }
            resolve(array);
          }
        )
    }).catch((error) => {
      //console.log('errorin getting data :', error);
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
          fontName: 'Arial',
          fontSize: 18,
          bold: true,
          italic: false
        },
        width: 800, height: 500,
        bar: { groupWidth: "75%" },
        chartArea: { left: 180, top: 20, width: '50%' },
        legend: { position: 'bottom', textStyle: { color: '#444444' } },
        backgroundColor: '#FFFFFF',
        hAxis: {
          textStyle: { color: '#444444' },
          title: 'Number Of Contracts',
          titleTextStyle: { italic: false }
        },
        vAxis: {
          textStyle: { color: '#444444' },
          title: 'R12 Status',
          titleTextStyle: { italic: false }
        },
        series: {
          0: { color: '0B91E2' }
        },
        tooltip: { isHtml: false, type: 'string' },
        annotations: {
          alwaysOutside: true
        }
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
    else if (from == 'arrivalType') {
      this.arrivalTypesArr.push(item);
    }
    //this.comesFrom = ;
    this.filterChartData('dropdown');
    //this.comesFrom='';
  }

  onItemDeSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr = this.removeElementArr(this.territoriesArr, item);
    } else if (from == 'workflow') {
      this.workFlowStatusArr = this.removeElementArr(this.workFlowStatusArr, item);;
    }
    else if (from == 'arrivalType') {
      this.arrivalTypesArr = this.removeElementArr(this.arrivalTypesArr, item);
    }
    //this.comesFrom = 'dropdown';
    this.filterChartData('dropdown');
    //this.comesFrom='';
  }

  onSelectAll(item, from) {
    //console.log("the selectAll is:" + JSON.stringify(item) + JSON.stringify(from));
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
    //this.comesFrom = 'dropdown';
    this.filterChartData('dropdown');
    //this.comesFrom='';
  }

  onDeSelectAll(item, from) {
    if (from == 'territory') {
      this.territoriesArr = [];
    } else if (from == 'workflow') {
      this.workFlowStatusArr = [];
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = [];
    }
    // this.comesFrom = 'dropdown';
    this.filterChartData('dropdown');
    //this.comesFrom='';

  }

  /**
   * This method filters the data according selected territories and workflowstatus
   */
  public filterChartData(comesfrom) {
    let finalArr = [];
    let ebsObj = new FilterFormatEBS();
    //console.log("in filter chatrt dataa" );

    if (this.territoriesArr.length == 0 && this.arrivalTypesArr.length == 0 && this.workFlowStatusArr.length > 0) {
      ebsObj.territory_selected = false;
      ebsObj.territory_data = [];
      ebsObj.arrival_selected = false;
      ebsObj.arrival_data = [];
      ebsObj.workflow_selected = true;
      ebsObj.workflow_data = this.workFlowStatusArr;

      if (comesfrom == 'dropdown') {
        // console.log("the comes from is:"+JSON.stringify(comesfrom));
        this.getContractData(ebsObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            //console.log("error filterChartData getContractData"+error)
          });
      } else {
        //console.log("the comes from is:t a w>0"+JSON.stringify(comesfrom));
        ebsObj.workflow_selected = true;
        ebsObj.workflow_data = this.status;
        let arr = [];
        arr.push(this.status);
        //console.log("the data is:"+JSON.stringify(ebsObj));
        ebsObj.workflow_data = arr;
        this.getEBSDrillDownData(ebsObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            // console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDownData=[];
            this.drillDownData = res;
          }, error => {
            console.log("error getTerritories " + error);
          });
        this.newModelCounts = '';

      }
    } else if (this.workFlowStatusArr.length == 0 && this.arrivalTypesArr.length == 0 && this.territoriesArr.length > 0) {
      //console.log("t>1 s0 a0");
      ebsObj.territory_selected = true;
      ebsObj.territory_data = this.territoriesArr;
      ebsObj.arrival_selected = false;
      ebsObj.arrival_data = [];
      ebsObj.workflow_selected = false;
      ebsObj.workflow_data = [];

      if (comesfrom == 'dropdown') {
        //console.log("the comes from is:"+JSON.stringify(comesfrom));
        this.getContractData(ebsObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            //console.log("error filterChartData getContractData"+error)
          });
      } else {
        //console.log("the comes from is:t >0 a w"+JSON.stringify(comesfrom));
        ebsObj.workflow_selected = true;
        ebsObj.workflow_data = this.status;
        let arr = [];
        arr.push(this.status);
        //console.log("the data is:"+JSON.stringify(ebsObj));
        ebsObj.workflow_data = arr;
        this.getEBSDrillDownData(ebsObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('MM-DD-YYYY');
            }
          }, error => {
            //console.log("error getTerritories " + error);
          });
        this.newModelCounts = '';
      }

    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length == 0 && this.arrivalTypesArr.length == 0) {
      ebsObj.territory_selected = false;
      ebsObj.territory_data = [];
      ebsObj.arrival_selected = false;
      ebsObj.arrival_data = [];
      ebsObj.workflow_selected = false;
      ebsObj.workflow_data = [];
      if (comesfrom == 'dropdown') {
        //console.log("the comes from is:"+JSON.stringify(comesfrom));
        this.getContractData(ebsObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            //console.log("error filterChartData getContractData"+error)
          });
      } else {
        //console.log("the comes from is:t w a=0"+JSON.stringify(comesfrom));
        ebsObj.workflow_selected = true;
        ebsObj.workflow_data = this.status;
        let arr = [];
        arr.push(this.status);
        //console.log("the data is:"+JSON.stringify(ebsObj));
        ebsObj.workflow_data = arr;
        this.getEBSDrillDownData(ebsObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDownData=[];
            this.drillDownData = res;
          }, error => {
            //console.log("error getTerritories " + error);
          });
        this.newModelCounts = '';

      }


    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length == 0 && this.arrivalTypesArr.length > 0) {

      ebsObj.territory_selected = false;
      ebsObj.territory_data = [];
      ebsObj.arrival_selected = true;
      ebsObj.arrival_data = this.arrivalTypesArr;
      ebsObj.workflow_selected = false;
      ebsObj.workflow_data = [];

      if (comesfrom == 'dropdown') {
        // console.log("the comes from is:"+JSON.stringify(comesfrom));
        this.getContractData(ebsObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            //console.log("error filterChartData getContractData"+error)
          });
      } else {
        //console.log("the comes from is:w t a >0"+JSON.stringify(comesfrom));
        ebsObj.workflow_selected = true;
        ebsObj.workflow_data = this.status;
        let arr = [];
        arr.push(this.status);
        //console.log("the data is:"+JSON.stringify(ebsObj));
        ebsObj.workflow_data = arr;
        this.getEBSDrillDownData(ebsObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDownData=[];
            this.drillDownData = res;
          }, error => {
            //console.log("error getTerritories " + error);
          });
        this.newModelCounts = '';

      }


    } else if (this.workFlowStatusArr.length == 0 && this.territoriesArr.length > 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t>0 s0 a>0");
      ebsObj.territory_selected = true;
      ebsObj.territory_data = this.territoriesArr;
      ebsObj.arrival_selected = true;
      ebsObj.arrival_data = this.arrivalTypesArr;
      ebsObj.workflow_selected = false;
      ebsObj.workflow_data = [];

      if (comesfrom == 'dropdown') {
        //console.log("the comes from is:"+JSON.stringify(comesfrom));
        this.getContractData(ebsObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            //console.log("error filterChartData getContractData"+error)
          });
      } else {
        // console.log("the comes from is:w t a >0"+JSON.stringify(comesfrom));
        ebsObj.workflow_selected = true;
        ebsObj.workflow_data = this.status;
        let arr = [];
        arr.push(this.status);
        //console.log("the data is:"+JSON.stringify(ebsObj));
        ebsObj.workflow_data = arr;
        this.getEBSDrillDownData(ebsObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDownData=[];
            this.drillDownData = res;
          }, error => {
            //console.log("error getTerritories " + error);
          });
        this.newModelCounts = '';

      }


    } else if (this.workFlowStatusArr.length > 0 && this.territoriesArr.length == 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t0 s>0 a>0");
      ebsObj.territory_selected = false;
      ebsObj.territory_data = [];
      ebsObj.arrival_selected = true;
      ebsObj.arrival_data = this.arrivalTypesArr;
      ebsObj.workflow_selected = true;
      ebsObj.workflow_data = this.workFlowStatusArr;

      if (comesfrom == 'dropdown') {
        // console.log("the comes from is:"+JSON.stringify(comesfrom));
        this.getContractData(ebsObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            //console.log("error filterChartData getContractData"+error)
          });
      } else {
        //console.log("the comes from is:w>0 t a"+JSON.stringify(comesfrom));
        ebsObj.workflow_selected = true;
        ebsObj.workflow_data = this.status;
        let arr = [];
        arr.push(this.status);
        //console.log("the data is:"+JSON.stringify(ebsObj));
        ebsObj.workflow_data = arr;
        this.getEBSDrillDownData(ebsObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDownData=[];
            this.drillDownData = res;
          }, error => {
            //console.log("error getTerritories " + error);
          });
        this.newModelCounts = '';

      }
    } else if (this.workFlowStatusArr.length > 0 && this.territoriesArr.length > 0 && this.arrivalTypesArr.length == 0) {
      // console.log("t>0 s>0 a0");
      ebsObj.territory_selected = true;
      ebsObj.territory_data = this.territoriesArr;
      ebsObj.arrival_selected = false;
      ebsObj.arrival_data = [];
      ebsObj.workflow_selected = true;
      ebsObj.workflow_data = this.workFlowStatusArr;

      if (comesfrom == 'dropdown') {
        //console.log("the comes from is:"+JSON.stringify(comesfrom));
        this.getContractData(ebsObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            // console.log("error filterChartData getContractData"+error)
          });
      } else {
        //console.log("the comes from is:w>0 t>0 a"+JSON.stringify(comesfrom));
        ebsObj.workflow_selected = true;
        ebsObj.workflow_data = this.status;
        let arr = [];
        arr.push(this.status);
        //console.log("the data is:"+JSON.stringify(ebsObj));
        ebsObj.workflow_data = arr;
        this.getEBSDrillDownData(ebsObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDownData=[];
            this.drillDownData = res;
          }, error => {
            //console.log("error getTerritories " + error);
          });
        this.newModelCounts = '';

      }
    }
    else {
      //console.log("t>0 s>0 a>0");
      ebsObj.territory_selected = true;
      ebsObj.territory_data = this.territoriesArr;
      ebsObj.arrival_selected = true;
      ebsObj.arrival_data = this.arrivalTypesArr;
      ebsObj.workflow_selected = true;
      ebsObj.workflow_data = this.workFlowStatusArr;

      if (comesfrom == 'dropdown') {
        // console.log("the comes from is:"+JSON.stringify(comesfrom));
        this.getContractData(ebsObj)
          .then(result => {
            let arr = this.makeChartArr(result)
            this.drawchart(arr);
          }).catch(error => {
            // console.log("error filterChartData getContractData"+error)
          });
      } else {
        //console.log("the comes from is:w>0 t>0 a>0"+JSON.stringify(comesfrom));
        ebsObj.workflow_selected = true;
        let arr = [];
        arr.push(this.status);
        //console.log("the data is:"+JSON.stringify(ebsObj));
        ebsObj.workflow_data = arr;
        this.getEBSDrillDownData(ebsObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            //console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(res));
            for (let i in res) {
              //res[i].
              res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('YYYY-MM-DD');
            }
            this.drillDownData=[];
            this.drillDownData = res;
            //   // console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(this.drillDown));
             
          }, error => {
            //console.log("error getTerritories " + error);
          });
        this.newModelCounts = '';

      }
    }
  }

  /**
   * Common method to create google chart array structure.
   * @param cases -Case data.
   */
  public makeChartArr(ebsdata) {
    // cases=[];
    //console.log("the make chart data is :" + JSON.stringify(cases));
    let array = [];
    array.push(['Status', 'No. of Contracts', { role: "annotation" }, { role: "style" }]);
    let barColor = null;
    if (ebsdata.length > 0) {
      //this.drawchart(ebsdata);
      this.checkDataEBS = false;
      for (let i in ebsdata) {
        barColor = '#4A90E2';
        array.push([ebsdata[i].status + "  " + this.calculatePercent(ebsdata[i].contractscount, this.totalPerc), parseInt(ebsdata[i].contractscount), "Median Days  " + parseInt(ebsdata[i].mediandays), barColor]);
      }
    } else if (ebsdata.length == 0) {
      this.drawchart(ebsdata);
      this.checkDataEBS = true;
      array.push(['', 0, '', '']);
    } else {
      this.checkDataEBS = true;
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
    //console.log("on init");
    let ebsObj = new FilterFormatEBS();
    ebsObj.territory_selected = false;
    ebsObj.territory_data = [];
    ebsObj.arrival_selected = false;
    ebsObj.arrival_data = [];
    ebsObj.workflow_selected = false;
    ebsObj.workflow_data = [];
    this.getContractData(ebsObj)
      .then((res: any) => {
        let arr = this.makeChartArr(res)
        this.drawchart(arr);
      }, error => {
        // console.log("error getCaseData " + error);
      });

    this.getebsTerritoriesData()
      .then((res: any) => {
        //console.log("the res is:" + JSON.stringify(res));
        //this.drawChart(res);
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
        // console.log("error getWorkflowStatus " + error);
      });
    this.getArrivalType()
      .then((res: any) => {
        //this.drawChart(res);
        this.sideViewDropDowns.showArrivalType = true;
        this.sideViewDropDowns.arrivalTypeData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }, error => {
        // console.log("error getArrivalType " + error);
      });
    // this.sideViewDropDowns.showArrivalType = true;
    // this.sideViewDropDowns.arrivalTypeData = ['SAOF', 'CPQ', 'Q2SC'];
    this.sideViewDropDowns.showYearDD = false;
    this.sideViewDropDowns.compHeading = appheading.graph2;
    this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);

  }
}



