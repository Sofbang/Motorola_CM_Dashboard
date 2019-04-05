import { Component, OnInit } from '@angular/core';
import { SmartclientService } from '../services/lookup/smartclient.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { FilterFormat } from '../beans/common_bean';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import { ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import { ChartSelectEvent } from 'ng2-google-charts';
import { appheading } from '../enums/enum';
import { ChartReadyEvent } from 'ng2-google-charts';
import * as moment from 'moment';
import { sep } from 'path';
import { Title } from '@angular/platform-browser';
import { ExcelServiceService } from '../services/convert_to_excel/excel-service.service';
import { jsonpFactory } from '@angular/http/src/http_module';
import { JsonPipe } from '@angular/common';
import { last } from '@angular/router/src/utils/collection';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sc-new-cases',
  templateUrl: './sc-new-cases.component.html',
  styleUrls: ['./sc-new-cases.component.css']
})
export class ScNewCasesComponent implements OnInit {
  public columnChart: any;
  public selectedYear: any;
  public drillDownData: any;
  public casesData: any = [];
  public selectedFrom: any;
  public minmaxdates: any;
  public drillDown: any;
  public territoriesArr: any = [];
  public datesData = [];
  public newModelCounts: any;
  public newCasesData: any = [];
  public casesSrvcData = [];
  public data: any;
  public res;
  public checkDataSCNC: Boolean = false;
  public sideViewDropDowns = new SideViewDropDowns();
  public firstDay: any;
  public lastDay: any;
  public status: any;
  public monthArr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  @ViewChild('openSCModal') openScModel: ElementRef;
  constructor(private _smartclientService: SmartclientService, private _dataHandlerService: DataHandlerService, private _excelService: ExcelServiceService,private router: Router) {
    this._dataHandlerService.dataFromSideView
      .subscribe(res => {
        if(this.router.url=='/home/sc-new-cases'){

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
        //console.log("llll"+JSON.stringify(this.router.url))
        //console.log("sub ebs" + JSON.stringify(res));
      


      });
    this._dataHandlerService.setDataForMainLayout(true);

  }


  /**
  * google chart method for bar selection
  * @param event -  returns the events json with data inside the bar
  */

  public selectBar(event: ChartSelectEvent) {


    // console.log("in the selectBar" + JSON.stringify(event.selectedRowValues[0]));
    if (event.message == 'select') {

      //console.log("the drilldown data is:" + JSON.stringify(this.drillDownData));
      this.openScModel.nativeElement.click();
      let drillDownStatusnew = [];
      this.newModelCounts = event.selectedRowValues[1];
      drillDownStatusnew = event.selectedRowValues[0];
      //console.log("the data is:" + JSON.stringify(drillDownStatusnew[0]));
      this.data = event.selectedRowValues[0];
      //console.log("the data is:" + JSON.stringify(this.data));
      this.status = this.fdld(drillDownStatusnew);
      //console.log("the ld is:" + JSON.stringify(this.status));
      $('.modal .modal-dialog').css('width', $(window).width() * 0.95);//fixed
      $('.modal .modal-body').css('height', $(window).height() * 0.77);//fixed
      $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.69);
      $('tbody.SCModlTbody').css('overflow-y', 'scroll');
      $('tbody.SCModlTbody').css('overflow-x', 'hidden');
      $('tbody.SCModlTbody').css('width', '100%');

      //console.log("the fd ld is :"+JSON.stringify(status[0])+"the ld is :"+JSON.stringify(status[1]));
      this.filterChartData('drilldown');

      this.newModelCounts = ''
      this.status = '';
      //console.log("end of messsage=-selectBar");
    }
  }

  /**
   * Export to excel method used to bind data from drill down response to an excel file.
   */
  public exportToExcel() {

    //console.log("the data is:" + JSON.stringify(this.drillDownData));
    this._excelService.exportAsExcelFile(this.drillDownData, 'Smart Client New Cases');
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

  /**
 *  Getting data from API Call for Territories
 */
  public getTerritories() {
    return new Promise((resolve, reject) => {
      let territories;
      this._smartclientService.getScTerritories()
        .subscribe(data => {
          territories = data;
          //console.log("territories" + territories)
        }, err => { console.log("getScTerritories error " + err) },

          () => {
            let array = [];
            let count = 0;
            let otherTerritory;
            for (let i in territories) {
              if (territories[i].territory == 'OTHER') {
                //console.log("The other territory " + territories[i].territory)

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
      console.log('errorin getting data :', error);
      reject(error);

    })
  }

  /**
   * 
   * @param jsonobj - API Call Method for Drill Down Window passing data as an object
   */
  public getSCDrillDownData(jsonobj) {
    return new Promise((resolve, reject) => {
      this._smartclientService.getSCNewCasesDrillDown(jsonobj)
        .subscribe(res => {
          // console.log("territories" + this.territories)
          resolve(res);
        }, error => {
          reject(error);
        })
    })
  }

  /* calculating current month last day and less last years first day   */

  makeInitDataLoadObj() {

    let newCasesObj = new FilterFormat();
    let fd = new Date();
    let firstDay = moment(fd).startOf('month').format('YYYY-MM-DD');
    let last = moment(firstDay).endOf('month').format('YYYY-MM-DD');
    let result = moment(firstDay).subtract(1, 'years').format('YYYY-MM-DD');
    //console.log("ld is:"+result);
    //console.log("fd is:"+firstDay);
    //console.log("fd this year last day  is:"+last);
    newCasesObj.from_date = result;
    newCasesObj.to_date = last;
    // uncomment to pass first day of current years month
    //newCasesObj.to_date = firstDay; 
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
  public scNewCaseAllData: any;
  public datesInit = [];
  /**
   * API Call for SC New Cases 
   */
  public getSCNewCases() {
    return new Promise((resolve, reject) => {

      this._smartclientService.getScNewCases(this.makeInitDataLoadObj())
        .subscribe(res => {
          this.scNewCaseAllData = res;//to use in only territoy or arival type filter
          this.datesData = [];
          resolve(this.combiningDataForChart(res));
        }, error => {
          reject(error);
        })
    });
  }

  /**
  * Make data which graph accepts in form of ["MAR-2018",8],["APR-2018",19],["MAY-2018",31]
  * @param scDataByMonthYr 
  */
  combiningDataForChart(scDataByMonthYr) {
    let filterSCByDate = [], arr;
    //console.log("the data is:"+JSON.stringify(scDataByMonthYr));
    for (let i in scDataByMonthYr) {
      arr = []
      arr.push(scDataByMonthYr[i].bymonth);
      arr.push(parseInt(scDataByMonthYr[i].case_count));
      arr.push(parseInt(scDataByMonthYr[i].case_count));

      filterSCByDate.push(arr);
    }
    //console.log("filterSCByDate" + JSON.stringify(filterSCByDate));
    return filterSCByDate;
  }

  /**
 * This method check if From and to dropdown selected.
 */
  checkDateDropdownSelected(newCasesObj): any {
    return new Promise((resolve, reject) => {
      this._smartclientService.getScNewCases(newCasesObj)
        .subscribe(res => {
          resolve(res);
        }, error => {
          reject(error);
        })
    })
  }


  /**
   * Common method to handle all date conversion format
   * @param incominDate :date in format yyyy-MM-dd 
   */
  convertDateMoment(incominDate) {
    return moment(incominDate).format('YYYY-MM-DD');
  }

  /**
   * return array of dates range from startdate to Enddate
   * @param startDate:date in format yyyy-MM-dd 
   * @param endDate :date in format yyyy-MM-dd
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
   * Imp method removec-.ready not function
   * @param event 
   */
  public ready(event: ChartReadyEvent) {
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
   * Make data to be accepted by google chart
   * @param data :Array of data in format[['jan 2019',2],['feb 2019',5]]
   */
  public makeChartData(data) {
    let array = [];
    if (data.length == 0) {
      //console.log("the if of check for length");
      this.checkDataSCNC = true;
      array = [['Months', 'Cases Counts'], ['Jan', 0], ['Feb ', 0], ['Mar ', 0], ['Apr ', 0], ['May ', 0], ['Jun ', 0], ['Jul ', 0], ['Aug ', 0], ['Sep ', 0], ['Oct ', 0], ['Nov ', 0], ['Dec ', 0]];
      this.drawChart(array);

    } else {

      array.push(['Months', 'Cases Counts', { role: "annotation" }]);
      //console.log("the array of months data is:"+JSON.stringify(data));

      for (let i in data) {

        array.push(data[i]);
      }
      //console.log("the array of months data is:"+JSON.stringify(array));

      this.checkDataSCNC = false;
    }
    return array;
  }

  public arrivalTypesArr = [];

  /**
 * event for multiselect dropdowns
 * @param item data to be handled
 * @param from data coming from sources like territory workflow etc.
 */
  onItemSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr.push(item);
      this.filterChartData('dropdown');
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr.push(item);
      this.filterChartData('dropdown');
    }

  }

  /**
 * event for multiselect dropdowns
 * @param item data to be handled
 * @param from data coming from sources like territory workflow etc.
 */
  onItemDeSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr = this.removeElementArr(this.territoriesArr, item);
      this.filterChartData('dropdown');
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = this.removeElementArr(this.arrivalTypesArr, item);
      this.filterChartData('dropdown');
    }
  }

  /**
* event for multiselect dropdowns
* @param item data to be handled
* @param from data coming from sources like territory workflow etc.
*/
  onSelectAll(item, from) {
    if (from == 'territory') {
      this.territoriesArr = [];
      this.territoriesArr = item
      this.filterChartData('dropdown');
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = [];
      this.arrivalTypesArr = item;
      this.filterChartData('dropdown');
    }
  }

  /**
 * event for to dates dropdown
 * @param item passing data to be added to the array of dates
 */
  onToYearChange(item) {
    this.datesData = [];
    this.datesData.push(item.firstDay);
    this.datesData.push(item.lastDay);
    this.filterChartData('dropdown');
    //console.log("the added array is:" + JSON.stringify(this.datesData));

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
 * Filters data from dropdown and drill down
 * @param caseFrom check for called from drilldown or dropdown
 */
  public filterChartData(caseFrom) {
    this.drillDownData = [];
    this.newModelCounts = '';
    let finalArr = [];
    let newCasesObj = new FilterFormat();;
    if (this.datesData.length == 2) {
      newCasesObj.from_date = this.convertDateMoment(this.datesData[0]);
      newCasesObj.to_date = this.convertDateMoment(this.datesData[1]);
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
      newCasesObj.territory_selected = true;
      newCasesObj.territory_data = this.territoriesArr;
      newCasesObj.arrival_selected = false;

      if (caseFrom == 'dropdown') {
        this.checkDateDropdownSelected(newCasesObj)
          .then(result => {
            let res = this.combiningDataForChart(result);
            let chartData = this.makeChartData(res);
            this.drawChart(chartData);
          }).catch(error => {
            console.log("error in dateDropdownSelected " + error);
          });
      }
      else {
        newCasesObj.from_date = this.status[0];
        newCasesObj.to_date = this.status[1];
        //console.log("the data send is:"+JSON.stringify(newCasesObj));
        this.getSCDrillDownData(newCasesObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            res = this.calculateNssAging(res);
            //console.log("the res is:" + JSON.stringify(res));
            //console.log("the drilldowndata for ebs contracts by status is:"+JSON.stringify(this.drillDown));
            this.drillDownData = res;

          }, error => {
            console.log("error getTerritories " + error);
          });

      }

    } else if (this.territoriesArr.length == 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t0  a0");
      newCasesObj.territory_selected = false;
      newCasesObj.arrival_selected = false;

      if (caseFrom == 'dropdown') {
        this.checkDateDropdownSelected(newCasesObj)
          .then(result => {
            let res = this.combiningDataForChart(result);
            let chartData = this.makeChartData(res);
            this.drawChart(chartData);
          }).catch(error => {
            console.log("error in dateDropdownSelected " + error);
          });
      }
      else {
        newCasesObj.from_date = this.status[0];
        newCasesObj.to_date = this.status[1];

        //console.log("the data send is:"+JSON.stringify(newCasesObj));

        this.getSCDrillDownData(newCasesObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            res = this.calculateNssAging(res);
            //console.log("uuu----"+JSON.stringify(res));
            this.drillDownData = res;

          }, error => {
            console.log("error getTerritories " + error);
          });
      }

    } else if (this.territoriesArr.length == 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t0 a>0");
      newCasesObj.territory_selected = false;
      newCasesObj.arrival_selected = true;
      newCasesObj.arrival_data = this.arrivalTypesArr;

      if (caseFrom == 'dropdown') {
        this.checkDateDropdownSelected(newCasesObj)
          .then(result => {
            let res = this.combiningDataForChart(result);
            let chartData = this.makeChartData(res);
            this.drawChart(chartData);
          }).catch(error => {
            console.log("error in dateDropdownSelected " + error);
          });
      }
      else {
        newCasesObj.from_date = this.status[0];
        newCasesObj.to_date = this.status[1];
        //this.drillDownData=[];
        //console.log("the data send is:"+JSON.stringify(newCasesObj));

        this.getSCDrillDownData(newCasesObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            res = this.calculateNssAging(res);
            this.drillDownData = res;
          }, error => {
            console.log("error getTerritories " + error);
          });

      }
    }
    else if (this.territoriesArr.length > 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t>0  a>0");
      newCasesObj.territory_selected = true;
      newCasesObj.territory_data = this.territoriesArr;
      newCasesObj.arrival_selected = true;
      newCasesObj.arrival_data = this.arrivalTypesArr;
      //newCasesObj.from_date = this.status[0];
      //newCasesObj.to_date = this.status[1];
      if (caseFrom == 'dropdown') {
        this.checkDateDropdownSelected(newCasesObj)
          .then(result => {
            let res = this.combiningDataForChart(result);
            let chartData = this.makeChartData(res);
            this.drawChart(chartData);
          }).catch(error => {
            console.log("error in dateDropdownSelected " + error);
          });
      }
      else {
        newCasesObj.from_date = this.status[0];
        newCasesObj.to_date = this.status[1];

        //console.log("the data send is:"+JSON.stringify(newCasesObj));

        this.getSCDrillDownData(newCasesObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            res = this.calculateNssAging(res);
            this.drillDownData = res;

          }, error => {
            console.log("error getTerritories " + error);
          });
      }
    }
  }


  /**
 * for calculating NSS Aging
 * @param res data from API as a response
 */
  calculateNssAging(res) {
    let currentDate: any = new Date();
    //console.log("the data is:" + JSON.stringify(res));
    for (let i in res) {
      let caseCreationdate = new Date(moment(res[i].case_creation_date).format('YYYY-MM-DD'));
      let statusChangedOnDate = new Date(moment(res[i].sts_changed_on).format('YYYY-MM-DD'));
      let timeDiff = Math.abs(currentDate.getTime() - caseCreationdate.getTime());
      if (res[i].case_condition == 'CLOSED') {
        timeDiff = Math.abs(statusChangedOnDate.getTime() - caseCreationdate.getTime());
      }
      let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      //console.log("diff----"+diffDays)
      res[i]['nss_aging'] = diffDays;
      res[i].case_creation_date = res[i].case_creation_date == null ? '-' : moment(res[i].case_creation_date).format('MM-DD-YYYY');
      res[i].contract_creation_date = res[i].contract_creation_date == null ? '-' : moment(res[i].contract_creation_date).format('MM-DD-YYYY');
    }
    return res;
  }


  /**
   * metrhod for to dates filter 
   * @param filterVal returning the selected Value
   */
  public onChangeTo(filterVal: any) {
    let v = filterVal.split(' ');
    // console.log("the v is:"+v);
    let newone = v[0] + ' 1, '
    let newtwo = v[1];
    let newthree = newone + newtwo;
    // console.log("the three is :"+newthree);
    let newModDate = new Date(newthree);
    // console.log("",v.push(this.selectedFrom));
    let tb = this.selectedFrom.split(' ');
    let one = tb[0] + ' 1, ';
    let two = tb[1];
    let three = one + two;
    // console.log("the three is :"+three);
    let modDate = new Date(three);
    let FirstDay = new Date(modDate.getFullYear(), modDate.getMonth(), 1).toLocaleDateString();
    let LastDay = new Date(newModDate.getFullYear(), newModDate.getMonth() + 1, 0).toLocaleDateString();

    let fd = moment(FirstDay).format('YYYY-MM-DD');
    let ld = moment(LastDay).format('YYYY-MM-DD');
    let jsonObj = { 'event': 'onChangeTo', 'from': 'yeardropdown', 'data': { 'firstDay': fd, 'lastDay': ld } }
    this._dataHandlerService.setDataFromSideView(jsonObj);
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
*  API Call for Minimum and Maximum Dates
*/
  public getMinMaxDates() {
    return new Promise((resolve, reject) => {
      this._smartclientService.getScMinMaxDates()
        .subscribe(data => {
          this.minmaxdates = data;
          resolve(this.minmaxdates);
          // console.log("territories" + this.territories)
        }, error => {
          reject(error);
        })
    })
  }
  /**
* drawing chart for plotting chart
* @param data passed an array for drawing chart for google chart
*/
  public drawChart(data) {
    this.columnChart = {
      chartType: 'ColumnChart',
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
        width: 1100, height: 500,
        chartArea: { left: 100, top: 30, width: '50%' },
        bar: { groupWidth: "75%" },
        legend: { position: 'bottom', alignment: 'center', textStyle: { color: '#444444' } },
        backgroundColor: '#FFFFFF',
        hAxis: {
          textStyle: { color: '#444444' },
          slantedText: true,
          slantedTextAngle: 90
        },
        vAxis: {
          textStyle: { color: '#444444' },
          title: 'Number Of New Cases/Renewals',
          titleTextStyle: { italic: false }
        },
        series: {
          0: { color: '0B91E2' },
          1: { color: '#FFFFFF' }
        },
        tooltip: { isHtml: false }
      }
    };
  }

  /**
*  Getting data from API Call for ArrivalType
*/
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
  ngOnInit() {
    this.getSCNewCases()
      .then((res: any) => {
        if (reject.length == 0) {
          res = [];
        }
        let chartData = this.makeChartData(res);
        //console.log("ggggg"+JSON.stringify(chartData));
        this.drawChart(chartData);
      }, error => {
        console.log("error getSCNewCases " + error);
      });
    this.getMinMaxDates()
      .then((res: any) => {
        //console.log("res is:"+JSON.stringify(res));
        let resnew: any = res;
        //console.log("the json to be sent is:"+JSON.stringify(resnew));
        this._dataHandlerService.setMinMaxDate(resnew);
        //console.log("the json is:"+JSON.stringify());
      }).catch(error => {
        console.log("error getMinMaxDates " + error);
      })
    this.getTerritories()
      .then((res: any) => {

        this.sideViewDropDowns.showTerritory = true;
        this.sideViewDropDowns.territoryData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }).catch(error => {
        console.log("error getMinMaxDates " + error);
      })
    this.getArrivalTypeData()
      .then((res: any) => {

        //console.log("Arrival type" + JSON.stringify(res));
        this.sideViewDropDowns.showArrivalType = true;
        this.sideViewDropDowns.arrivalTypeData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }, error => {
        console.log("error getWorkflowStatus " + error);
      });


    this.sideViewDropDowns.showYearDD = true;
    this.sideViewDropDowns.compHeading = appheading.graph3;
    this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
  }

}
