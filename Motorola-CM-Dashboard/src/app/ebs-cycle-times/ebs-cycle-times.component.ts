import { Component, OnInit } from '@angular/core';
import { EbsService } from '../services/lookup/ebs.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { FilterFormat } from '../beans/common_bean';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import { ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import { ChartSelectEvent } from 'ng2-google-charts';
import { appheading } from '../enums/enum';
import { ExcelServiceService } from '../services/convert_to_excel/excel-service.service';
import * as moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ebs-cycle-times',
  templateUrl: './ebs-cycle-times.component.html',
  styleUrls: ['./ebs-cycle-times.component.css']
})
export class EbsCycleTimesComponent implements OnInit {
  public cycleTimesData: any = [];
  public contractsData = [];

  public arrivalTypesArr: any = [];
  public minmaxdates: any;
  public ebscolumnChartData: any;
  public drillDown: any;
  public territories: any;
  public territoriesArr: any = [];
  public data: any;
  public newModelCounts: any;
  public workFlowStatusArr: any = [];
  public sideViewDropDowns = new SideViewDropDowns();
  public checkData: Boolean = false;
  public status: any;
  public drillDownData: any;
  public restUrlFilterYr: string = 'ebs_cycle_times';

  public monthArr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  @ViewChild('openSCModal') openScModel: ElementRef;

  constructor(private _ebsService: EbsService, private _dataHandlerService: DataHandlerService, private _excelService: ExcelServiceService,private router: Router) {
    this._dataHandlerService.dataFromSideView
      .subscribe(res => {
         if(this.router.url=='/home/ebs-cycle-times'){

          //console.log("llll"+JSON.stringify(this.router.url))
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
        } else if (event == 'onchangeto') {
          this.onToYearChange(incomingData);
        }

         }
         
      });
    this._dataHandlerService.setDataForMainLayout(true);
  }

  /**
   * google chart method for bar selection
   * @param event -  returns the events json with data inside the bar
   */

  public selectBar(event: ChartSelectEvent) {

    if (event.message == 'select') {
      this.openScModel.nativeElement.click();
      let drillDownStatusnew = [];
      this.newModelCounts = event.selectedRowValues[1];
      drillDownStatusnew = event.selectedRowValues[0];
      this.data = event.selectedRowValues[0];
      //console.log("the data is:" + JSON.stringify(this.data));
      this.status = this.fdld(drillDownStatusnew);
      // console.log("fd ld is:" + JSON.stringify(this.status));
      // console.log("the data is:",this.data);
      $('.modal .modal-dialog').css('width', $(window).width() * 0.93);//fixed
      $('.modal .modal-body').css('height', $(window).height() * 0.77);//fixed
      $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.67);
      $('tbody.SCModlTbody').css('overflow-y', 'scroll');
      $('tbody.SCModlTbody').css('overflow-x', 'hidden');
      $('tbody.SCModlTbody').css('width', '100%');
      this.filterChartData('drilldown');
      this.newModelCounts = '';
    }
  }

  /**
   * Export to excel method used to bind data from drill down response to an excel file.
   */
  public exportToExcel() {

    this._excelService.exportAsExcelFile(this.drillDownData, 'EBS Cycle Times');
  }




  /**
 * calculating current month last day and less last years first day
 * @param data passed data for calculating month last day and less last years first day
 */
  public fdld(data) {

    let datesArr = [];


    let firstDay = moment(data).startOf('month').format('YYYY-MM-DD');
    let lastDay = moment(data).endOf('month').format('YYYY-MM-DD');

    datesArr.push(firstDay);
    datesArr.push(lastDay);

    return datesArr;
  }
  public datesData = [];
  public getCycleTimes() {
    return new Promise((resolve, reject) => {
      this._ebsService.getEBSCycleTimes(this.makeInitDataLoadObj())
        .subscribe(res => {
          this.cycleTimesData = res;
          resolve(res);
        }, error => {
          reject(error);
        })
    });
  }

  /**
 * dates conversion
 * @param incominDate dates for conversion into YYYY-MM-DD Format 
 */
  convertDateMoment(incominDate) {
    return moment(incominDate).format('YYYY-MM-DD');
  }

  /**
 *  Getting data from API Call for Territories
 */
  public getebsTerritoriesData() {
    return new Promise((resolve, reject) => {
      let territories = [];
      this._ebsService.getEBSTerritories().subscribe(data => {
        territories = data;
        let array = [];
        let otherTerritory;
        for (let i in territories) {
          if (territories[i].territory == 'OTHER') {

            otherTerritory = { 'item_id': territories[i].territory, 'item_text': territories[i].territory };
          } else {
            array.push({ 'item_id': territories[i].territory, 'item_text': territories[i].territory });
          }
        }
        if (territories.length > 0)
          array.push(otherTerritory);
        resolve(array);
      }, error => {
        console.log("error getebsTerritoriesData" + error);
        reject(error);
      })
    })
  }

  /**
*   API Call for ArrivalType
*/
  public getArrivalType() {
    return new Promise((resolve, reject) => {
      let workflowStatus;
      this._ebsService.getEBSArrivalType()
        .subscribe(data => {
          let array = [];
          for (let i in data) {
            array.push({ 'item_id': data[i].arrival_type, 'item_text': data[i].arrival_type });
          }
          resolve(array);
        }, error => {
          console.log("getArrivalType error" + error);
          reject(error);
        })
    })
  }

  /**
* drawing chart for plotting chart
* @param data passed an array for drawing chart for google chart
*/
  public drawchart(res) {
    this.ebscolumnChartData = {
      chartType: 'ComboChart',
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
        seriesType: 'bars',
        width: 1000, height: 500,
        bar: { groupWidth: "75%" },
        chartArea: { left: 75, top: 20, width: '75%' },
        legend: 'none',
        backgroundColor: '#FFFFFF',
        hAxis: {
          textStyle: { color: '#444444' },

          slantedText: true,
          slantedTextAngle: 90

        },
        vAxis: {
          textStyle: { color: '#444444' },
          title: this.fromMedOrAvg == 'median' ? 'Median Days' : 'Average Days',
          titleTextStyle: { italic: false }

        },
        series: {
          0: { color: '#3274C2' },


        },
        tooltip: { isHtml: false, type: 'string' }
      }
    }
  }

  public fromMedOrAvg = 'median'; //using in setting data in graph
  public contractTimeSelect = false;


  /**
 * event for multiselect dropdowns
 * @param item data to be handled
 * @param from data coming from sources like territory workflow etc.
 */
  onItemSelect(item, from) {
    //console.log("the item is:"+JSON.stringify(item)+JSON.stringify(from));
    if (from == 'territory') {
      this.territoriesArr.push(item);
      this.contractTimeSelect = false;
      // console.log("terrr is:"+JSON.stringify(this.territoriesArr));
      this.filterChartData('dropdown');
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr.push(item);
      this.contractTimeSelect = false;
      /// console.log("terrr is:"+JSON.stringify(this.territoriesArr));
      this.filterChartData('dropdown');
    }
    else if (from == 'contractTime') {
      // console.log("in contract time :"+JSON.stringify(from));
      //console.log("the item is :"+JSON.stringify(item));
      this._dataHandlerService.resetAllDropDowns(true);
      this.territoriesArr = [];
      this.arrivalTypesArr = [];
      this.contractTimeSelect = true;
      if (item == 'Median') {
        //console.log("casetime selected Median" + from);
        this.fromMedOrAvg = 'median';
      } else if (item == 'Average') {
        // console.log("casetime selected Median" + from);
        this.fromMedOrAvg = 'average';
      }
      this.filterChartData('dropdown');
    }
  }

  /* calculating current month last day and less last years first day   */

  makeInitDataLoadObj() {


    let newCasesObj = new FilterFormat();
    let fd = new Date();
    let firstDay = moment(fd).startOf('month').format('YYYY-MM-DD');
    let last = moment(firstDay).endOf('month').format('YYYY-MM-DD');
    let result = moment(firstDay).subtract(1, 'years').format('YYYY-MM-DD');
    newCasesObj.from_date = result;
    newCasesObj.to_date = last;

    newCasesObj.territory_selected = false;
    newCasesObj.territory_data = [];
    newCasesObj.arrival_selected = false;
    newCasesObj.arrival_data = [];
    //console.log("makeInitDataLoadObj firstDate"+this.convertDateMoment(result));
    //console.log("makeInitDataLoadObj lastdate"+this.convertDateMoment(last));
    // uncomment to pass first day of current years month
    //console.log("makeInitDataLoadObj lastdate"+this.convertDateMoment(firstDay));
    return newCasesObj;




  }


  /**
 * event for multiselect dropdowns
 * @param item data to be handled
 * @param from data coming from sources like territory workflow etc.
 */
  onItemDeSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr = this.removeElementArr(this.territoriesArr, item);
    } else if (from == 'arrivalType') {
      this.workFlowStatusArr = this.removeElementArr(this.arrivalTypesArr, item);
    }
    this.filterChartData('dropdown');
  }

  /**
  * event for multiselect dropdowns
  * @param item data to be handled
  * @param from data coming from sources like territory workflow etc.
  */
  onSelectAll(item, from) {
    if (from == 'territory') {
      this.territoriesArr = [];
      this.territoriesArr = item;

    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = [];
      this.arrivalTypesArr = item;

    }
    this.filterChartData('dropdown');
  }

  /**
 * event for multiselect dropdowns
 * @param item data to be handled
 * @param from data coming from sources like territory workflow etc.
 */
  onDeSelectAll(item, from) {
    if (from == 'territory') {
      this.territoriesArr = [];
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = [];
    }
    this.filterChartData('dropdown');
  }


  /**
 * event for to dates dropdown
 * @param item passing data to be added to the array of dates
 */
  onToYearChange(item) {
    // console.log("the item is:", item);
    this.datesData = [];
    this.datesData.push(item.firstDay);
    this.datesData.push(item.lastDay);
    //console.log("the dates data is:" + JSON.stringify(this.datesData));
    this.contractTimeSelect = false;
    this.filterChartData('dropdown');
  }
  /**
* This method check if From and to dropdown selected.
*/
  checkDateDropdownSelected(filterDataObj): any {
    return new Promise((resolve, reject) => {
      let newObj = this.contractTimeSelect ? this.makeInitDataLoadObj() : filterDataObj;
      this._ebsService.getEBSCycleTimes(newObj)
        .subscribe(res => {
          resolve(res);
        }, error => {
          reject(error);
        })
    })
  }
  /**
   * Filters data from dropdown and drill down
   * @param caseFrom check for called from drilldown or dropdown
   */
  public filterChartData(comesfrom) {
    this.drillDownData = [];
    this.newModelCounts = '';
    let newCasesObj = new FilterFormat();
    if (this.datesData.length == 2) {
      newCasesObj.from_date = this.convertDateMoment(this.datesData[0]);
      //console.log("the from:"+JSON.stringify(newCasesObj.from_date));
      newCasesObj.to_date = this.convertDateMoment(this.datesData[1]);
      //console.log("the from:"+JSON.stringify(newCasesObj.to_date));
    } else {
      let fd = new Date();
      let firstDay = moment(fd).startOf('month').format('YYYY-MM-DD');
      let last = moment(firstDay).endOf('month').format('YYYY-MM-DD');
      let result = moment(firstDay).subtract(1, 'years').format('YYYY-MM-DD');

      newCasesObj.from_date = result;
      newCasesObj.to_date = last;
    }
    //console.log("case data" + JSON.stringify(this.caseData));
    if (this.territoriesArr.length > 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t>1  a0");
      this.drillDown = [];
      newCasesObj.territory_selected = true;
      newCasesObj.territory_data = this.territoriesArr;
      newCasesObj.arrival_selected = false;
      if (comesfrom == 'dropdown') {
        this.checkDateDropdownSelected(newCasesObj)
          .then(result => {
            let chartData = this.makeChartData(result);
            this.drawchart(chartData);
          }).catch(error => {
            console.log("error in dateDropdownSelected " + error);
          });
      }
      else {
        newCasesObj.from_date = moment(this.status[0]).format('YYYY-MM-DD');
        newCasesObj.to_date = moment(this.status[1]).format('YYYY-MM-DD');

        this.getDrillDownData(newCasesObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            this.drillDownData = res;
          }, error => {
            console.log("error getDrillDownData " + error);
          });
      }
    } else if (this.territoriesArr.length == 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t0  a0");
      this.drillDown = [];
      newCasesObj.territory_selected = false;
      newCasesObj.arrival_selected = false;

      if (comesfrom == 'dropdown') {
        this.checkDateDropdownSelected(newCasesObj)
          .then(result => {
            //let res = this.combiningDataForChart(result);
            let chartData = this.makeChartData(result);
            this.drawchart(chartData);
          }).catch(error => {
            console.log("error in dateDropdownSelected " + error);
          });

      }
      else {
        newCasesObj.from_date = moment(this.status[0]).format('YYYY-MM-DD');
        newCasesObj.to_date = moment(this.status[1]).format('YYYY-MM-DD');
        this.getDrillDownData(newCasesObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            this.drillDownData = res;
          }, error => {
            console.log("error getDrillDownData " + error);
          });
      }
    } else if (this.territoriesArr.length == 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t0 a>0");
      this.drillDown = [];
      newCasesObj.territory_selected = false;
      newCasesObj.arrival_selected = true;
      newCasesObj.arrival_data = this.arrivalTypesArr;

      if (comesfrom == 'dropdown') {
        this.checkDateDropdownSelected(newCasesObj)
          .then(result => {
            let chartData = this.makeChartData(result);
            this.drawchart(chartData);
          }).catch(error => {
            console.log("error in dateDropdownSelected " + error);
          });
      }
      else {
        newCasesObj.from_date = moment(this.status[0]).format('YYYY-MM-DD');
        newCasesObj.to_date = moment(this.status[1]).format('YYYY-MM-DD');
        this.getDrillDownData(newCasesObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            this.drillDownData = res;
          }, error => {
            console.log("error getDrillDownData " + error);
          });

      }
    }
    else if (this.territoriesArr.length > 0 && this.arrivalTypesArr.length > 0) {
      // console.log("t>0  a>0");
      this.drillDown = [];
      newCasesObj.territory_selected = true;
      newCasesObj.territory_data = this.territoriesArr;
      newCasesObj.arrival_selected = true;
      newCasesObj.arrival_data = this.arrivalTypesArr;
      if (comesfrom == 'dropdown') {
        this.checkDateDropdownSelected(newCasesObj)
          .then(result => {
            // let res = this.combiningDataForChart(result);
            let chartData = this.makeChartData(result);
            this.drawchart(chartData);
          }).catch(error => {
            console.log("error in dateDropdownSelected " + error);
          });

      }
      else {
        newCasesObj.from_date = moment(this.status[0]).format('YYYY-MM-DD');
        newCasesObj.to_date = moment(this.status[1]).format('YYYY-MM-DD');
        this.getDrillDownData(newCasesObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            this.drillDownData = res;
          }, error => {
            console.log("error getDrillDownData " + error);
          });

      }
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
   * common method for converting acceptable data format to be passed to draw chart method
   * @param data passed data for conversion
   */
  public makeChartData(data) {
    //console.log("makeChartData"+JSON.stringify(data));
    let array = [];
    array.push(['Month', this.fromMedOrAvg == 'median' ? 'No. of Median Days' : 'No. Of Average Days', { role: "annotation" }, { role: "style" }]);
    if (data.length == 0) {
      // console.log("the if of check for length");
      this.checkData = true;
      array = [['Month', 'Contracts Count'], ['Jan', 0], ['Feb', 0], ['Mar', 0], ['Apr', 0], ['May', 0], ['Jun', 0], ['Jul', 0], ['Aug', 0], ['Sep', 0], ['Oct', 0], ['Nov', 0], ['Dec', 0]];
      this.drawchart(array);

    } else {
      let barColor = '#4A90E2';
      for (let i in data) {
        array.push([data[i].by_month, this.fromMedOrAvg == 'median' ? parseInt(data[i].median_days) : parseInt(data[i].average_numofdays), parseInt(data[i].contract_count), barColor]);
      }
      this.checkData = false;
    }
    return array;
  }

  /**
   * creating dynamic dates
   * @param startDate passing start date bound
   * @param endDate passing end date bound
   */
  public dateRange(startDate, endDate) {
    let start = startDate.split('-');
    let end = endDate.split('-');
    let startYear = parseInt(start[0]);
    let endYear = parseInt(end[0]);
    let dates = [];

    for (let i = startYear; i <= endYear; i++) {
      let endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
      let startMon = i === startYear ? parseInt(start[1]) - 1 : 0;
      for (let j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
        let month = j + 1;
        let displayMonth = month < 10 ? '0' + month : month;
        dates.push([i, displayMonth, '01'].join('-'));
      }
    }
    return dates;
  }

  /**
   * Use to remove array item from array
   * @param array -array of elements
   * @param itemToRemove -Item to be removed like T1,T2,Open
   */
  public removeElementArr(array, itemToRemove) {
    let index = array.indexOf(itemToRemove);
    if (index !== -1) array.splice(index, 1);
    return array;
  }

  /**
   * API Call Method for Drill Down Window 
   * @param jsonobj - passing data as an object
   */
  public getDrillDownData(jsonobj) {
    return new Promise((resolve, reject) => {
      this._ebsService.getEBCCycleTimesDrillDown(jsonobj)
        .subscribe(res => {
          //console.log("the res recievd is:"+JSON.stringify(res));
          for (let i in res) {
            res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('MM-DD-YYYY');
            res[i].contract_start_date = res[i].contract_start_date == null ? '-' : moment(res[i].contract_start_date).format('MM-DD-YYYY');
            res[i].contract_age = res[i].contract_age == null ? '-' : res[i].contract_age;
            res[i].contract_number_modifier = res[i].contract_number_modifier == null ? '-' : res[i].contract_number_modifier;
          }
          resolve(res);
        }, error => {
          console.log("getDrillDownData error" + error);
          reject(error);
        })
    })

  }

  /**
*  Getting data from API Call for Minimum and Maximum Dates
*/
  public getMinMaxDates() {
    return new Promise((resolve, reject) => {
      this._ebsService.getEBSMinMaxDates().subscribe(data => {
        this.minmaxdates = data;
        // console.log("territories" + this.territories)
      }, err => console.error(err),
        () => {
          //console.log("the drilldown data recived is:"+JSON.stringify(this.drillDown));
          resolve(this.minmaxdates);
        }
      )
    }).catch((error) => {
      reject(error);
      console.log('errorin getting data :', error);
    })
  }

  ngOnInit() {
    this.getCycleTimes()
      .then((res: any) => {
        let chartData = this.makeChartData(res);
        this.drawchart(chartData);


      }, error => {
        console.log("error getCaseData " + error);
      });


    this.getMinMaxDates().then((res: any) => {
      //  console.log("the dates are :"+JSON.stringify(res));
      let resnew: any = res;
      this._dataHandlerService.setMinMaxDate(resnew);

    })
    this.getebsTerritoriesData()
      .then((res: any) => {
        this.sideViewDropDowns.showTerritory = true;
        this.sideViewDropDowns.territoryData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }, error => {
        console.log("error getTerritories " + error);
      });
    this.getArrivalType()
      .then((res: any) => {
        this.sideViewDropDowns.showArrivalType = true;
        this.sideViewDropDowns.arrivalTypeData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }, error => {
        console.log("error getArrivalType " + error);
      });
    this.sideViewDropDowns.showContractTime = true;
    this.sideViewDropDowns.showYearDD = true;
    this.sideViewDropDowns.compHeading = appheading.garph4;
    let caseTimeData = [{ 'item_id': 1, 'item_text': 'Median' },
    { 'item_id': 2, 'item_text': 'Average' }];
    this.sideViewDropDowns.contractTimeData = caseTimeData;
    this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
  }

}
