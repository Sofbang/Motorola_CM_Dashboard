import { Component, OnInit } from '@angular/core';
import { SmartclientService } from '../services/lookup/smartclient.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import { ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import { ChartSelectEvent } from 'ng2-google-charts';
import { appheading } from '../enums/enum';

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
  public Total: any;
  public newModelCounts = [];
  public checkDataSCS: any = false;
  public data = [];
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
    this._dataHandlerService.setDataForMainLayout(true);
  }

  public exportToExcel() {
    console.log("in the export to excel function");
  }



  public selectBarScCaseByStatus(event: ChartSelectEvent) {

    this.openScModel.nativeElement.click();

    console.log("event.." + JSON.stringify(event));
    if (event.message == 'select') {



      //console.log("in the selectBar"+JSON.stringify(e));
      this.newModelCounts = event.selectedRowValues[1];
      console.log("the selectBar is:" + JSON.stringify(this.newModelCounts));
      this.data = event.selectedRowValues[0];
      console.log("the second time cases are:" + JSON.stringify(event));
      //console.log("the data is:",this.data);
      $('.modal .modal-dialog').css('width', $(window).width() * 0.95);//fixed
      $('.modal .modal-body').css('height', $(window).height() * 0.77);//fixed
      $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.69);
      $('tbody.SCModlTbody').css('overflow-y', 'scroll');
      $('tbody.SCModlTbody').css('overflow-x', 'hidden');
      // $('tbody.SCModlTbody').css('display', 'block');
      $('tbody.SCModlTbody').css('width', '100%');


    }
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
          console.log("the cases data is :" + JSON.stringify(cases));
          let arr = [];
          for (let i in cases) {
            arr.push(cases[i].contractscount);

          }
          this.Total = arr.reduce(this.sum);
          // console.log("the contractscount are as under:"+JSON.stringify(arr));
          // console.log("the total cases are :"+JSON.stringify(this.Total));
          this.caseData = data;
          cases = this.calculatePerc(cases);
          //console.log("contracts cases with percentages:" + JSON.stringify(cases));
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

  public calculatePerc(cases) {

    for (let i in cases) {

      console.log("the cases are as under:" + JSON.stringify(cases));
      let calcPer = ((cases[i].contractscount / this.Total) * 100).toFixed(2)
      cases[i]['status_percent'] = calcPer + '%';
      //console.log("the values are :"+JSON.stringify(value));

    }
    console.log("after the for loop in the calcPerc method:" + JSON.stringify(cases));
    return cases;
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
          fontName: 'Arial', // i.e. 'Times New Roman'
          fontSize: 18, // 12, 18 whatever you want (don't specify px)
          bold: true,    // true or false
          italic: false
        },
        width: 1200, height: 500,
        chartArea: { left: 225, top: 20, width: '50%' },
        legend: { position: 'bottom', alignment: 'center', textStyle: { color: '#444444' } },
        backgroundColor: '#FFFFFF',
        hAxis: {
          textStyle: { color: '#444444' }
        },
        vAxis: {
          textStyle: { color: '#444444' },
          title:'Smart Client Status',
          slantedText: true,  
          slantedTextAngle: 90 
        },
        series: {
          0: { color: '#93C0F6' }
        },
        tooltip: { isHtml: false }
      }
    };
  }
  // ng multiselect events implemented by Vishal Sehgal 12/2/2019
  onItemSelect(item, from) {
    console.log("the item returned is :" + JSON.stringify(item));
    if (from == 'territory') {
      console.log("inside the if of territory check:" + JSON.stringify(item));
      this.territoriesArr.push(item)
      console.log("the terr is:" + JSON.stringify(this.territoriesArr));
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
    console.log("the finalarr:" + JSON.stringify(finalArr));
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
      cases = this.calculatePerc(cases);
      let chartArr = this.makeChartArr(cases);
      // if(chartArr.length>0){
      //   this.checkDataSCS = false;
  
      // }else{
      //   alert("no data to be bind to  graph");
      //   this.checkDataSCS = true;
  
      // }
      this.drawChart(chartArr);
      return;
    }
    else {
      console.log("t>0 s>0");
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
    console.log("the cases data before the finalArr is:" + JSON.stringify(cases));
    // console.log("the caeses before binding are :"+JSON.stringify(cases));
    cases = this.calculatePerc(cases);

    let chartArr = this.makeChartArr(cases);
    // if(chartArr.length>0){
    //   this.checkDataSCS = false;

    // }else{
    //   alert("no data to be bind to  graph");
    //   this.checkDataSCS = true;

    // }
    this.drawChart(chartArr);
    // finalArr=[];
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
    // cases=[];
    let array = [];
    array.push(['Status', 'No. Of Cases', { role: "annotation" }, { role: "style" }]);
    if (cases.length > 0) {
      this.drawChart(cases);
      this.checkDataSCS = false;

      let barColor = null;

      for (let i in cases) {
        let index = parseInt(i);
        if(cases[i].status=='Insufficient Data' || cases[i].status =='InProg Awt 3PS' ||  cases[i].status =='InProg Awt SSC' || cases[i].status =='InProg Awt Credit' || cases[i].status == 'InProg Awt Resource'){
          barColor='#93C0F6';
        // }else if(cases[i].status =='InProg Awt 3PS'){
        //   barColor='#93C0F6';
        // }else if(cases[i].status =='InProg Awt SSC'){
        //   barColor='#4A90E2';
        // }else if(cases[i].status =='InProg Awt Credit'){
        //   barColor='#618CF7';
        // }else if(cases[i].status == 'InProg Awt Resource'){
        //   barColor='#164985';
        // }
        }
        else{
          barColor='#3274C2';
        }
        //console.log(i);
        // Create new array above and push every object in
        array.push([cases[i].status + "  " + cases[i].status_percent, parseInt(cases[i].contractscount), "Median Days - " + parseInt(cases[i].mediandays), barColor]);
      }
      return array;

    } else if (cases.length == 0) {
      //cases = [['Status','Cases'],['No_Status',0]];
      this.drawChart(cases);
      this.checkDataSCS = true;
      array.push(['', 0,'','']);
      return array;

    } else {

      this.checkDataSCS = true;
    }

    // array.push(['Status', 'No. Of Cases', { role: "annotation" }, { role: "style" }]);
    // ARRAY OF OBJECTS
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
    this.getCaseData()
      .then((res: any) => {
        if (res.length > 0) {
          this.drawChart(res);
          // this.checkDataSCS = false;
        } else if (res.length == 0) {
          // alert("there is no data to bind to chart");
          res = [['Status', 'Cases'], ['No Status', 0], ['No Status', 0], ['No Status', 0]];
          this.drawChart(res);
          // this.checkDataSCS = true;

        } else {
          // this.checkDataSCS = true;
        }

        // this.drawChart(res);
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
    this.sideViewDropDowns.showYearDD = false;
    // this.sideViewDropDowns.arrivalTypeData = ['SAOF','CPQ','Q2SC','Other'];
    this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
    this.sideViewDropDowns.compHeading = appheading.graph1;



  }

}


