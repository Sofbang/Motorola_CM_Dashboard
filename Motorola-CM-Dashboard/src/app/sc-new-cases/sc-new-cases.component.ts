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
  constructor(private _smartclientService: SmartclientService, private _dataHandlerService: DataHandlerService, private _excelService: ExcelServiceService) {
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
        } else if (event == 'onchangeto') {
          this.onToYearChange(incomingData);
        }
      });
    this._dataHandlerService.setDataForMainLayout(true);

  }

  public selectBar(event: ChartSelectEvent) {


    // drillDownStatusnew = (event.selectedRowValues[0]);
    // status = drillDownStatusnew[0];
    // console.log("in the selectBar" + JSON.stringify(event.selectedRowValues[0]));
    if (event.message == 'select') {
      //this.drillDownData=[];
      //console.log("the drilldown data is:" + JSON.stringify(this.drillDownData));
      this.openScModel.nativeElement.click();
      let drillDownStatusnew = [];
      this.newModelCounts = event.selectedRowValues[1];
      drillDownStatusnew = event.selectedRowValues[0];
      //console.log("the data is:" + JSON.stringify(drillDownStatusnew[0]));
      this.data = event.selectedRowValues[0];
      //console.log("the data is:" + JSON.stringify(this.data));
      this.status = this.fdld(drillDownStatusnew);
      console.log("the ld is:" + JSON.stringify(this.status));
      $('.modal .modal-dialog').css('width', $(window).width() * 0.95);//fixed
      $('.modal .modal-body').css('height', $(window).height() * 0.77);//fixed
      $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.69);
      $('tbody.SCModlTbody').css('overflow-y', 'scroll');
      $('tbody.SCModlTbody').css('overflow-x', 'hidden');
      $('tbody.SCModlTbody').css('width', '100%');
      // status = this.fdld(status);
      //console.log("the fd ld is :"+JSON.stringify(status[0])+"the ld is :"+JSON.stringify(status[1]));
      this.filterChartData('drilldown');
      //this.drillDown = [];
      this.newModelCounts = ''
      this.status = '';
      console.log("end of messsage=-selectBar");
    }
  }

  public exportToExcel() {

    // for(let i in this.drillDownData){
    //  this.drillDownData[i].to_status.replace('_','Case Status');
    //   //this.drillDownData.replace('_',' ');

    // }
    console.log("the data is:" + JSON.stringify(this.drillDownData));
    this._excelService.exportAsExcelFile(this.drillDownData, 'Smart Client New Cases');
  }



  public fdld(data) {
    let month = data.split('-')[0];
    let year = data.split('-')[1];
    let date = year + '-' + (this.monthArr.indexOf(month) + 1) + '-01';
    console.log("ddd" + this.convertDateMoment(date));
    let newDate = this.convertDateMoment(date)
    var dates = new Date(newDate);
    var firstDay = new Date(dates.getFullYear(), dates.getMonth(), 1);
    var lastDay = new Date(dates.getFullYear(), dates.getMonth() + 1, 0);
    console.log("the firstDay is:" + firstDay);
    console.log("the lastDay is:" + lastDay);
    let datesArr = [];

    datesArr.push(this.convertDateMoment(firstDay));
    datesArr.push(this.convertDateMoment(lastDay));

    let v = data.split(' ');
    //console.log("the v is:"+moment(data).format('yyyy-MM-dd'));
    let arr = [];
    let newone = '01-' + v[0];
    let newtwo = v[1];
    let newthree = newone + newtwo;
    console.log("the newone is:" + newone);
    console.log("hhhhhhkk" + this.convertDateMoment(newtwo));
    console.log("the date is:" + JSON.stringify(newthree));
    let newModDate = new Date(newthree.replace('undefined', ''));
    let FirstDay = new Date(newModDate.getFullYear(), newModDate.getMonth(), 1).toLocaleDateString();
    let LastDay = new Date(newModDate.getFullYear(), newModDate.getMonth() + 1, 0).toLocaleDateString();
    let fd = moment(FirstDay).format('YYYY-MM-DD');
    let ld = moment(LastDay).format('YYYY-MM-DD');
    arr.push(fd);
    arr.push(ld);
    console.log("arr" + arr);
    return datesArr;

  }

  public getTerritories() {
    return new Promise((resolve, reject) => {
      let territories;
      this._smartclientService.getScTerritories()
        .subscribe(data => {
          territories = data;
          //console.log("territories" + territories)
        }, err => { console.log("getScTerritories error " + err) },
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
      // console.log('errorin getting data :', error);
      reject(error);

    })
  }
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


  public scNewCaseAllData: any;
  public datesInit = [];
  public getSCNewCases() {
    return new Promise((resolve, reject) => {
      let lastDate = this.convertDateMoment(new Date());//current date
      let firstDate = moment(new Date()).subtract(1, 'years');//earlier date
      let newCasesObj = new FilterFormat();
      newCasesObj.from_date = this.convertDateMoment(firstDate);
      newCasesObj.to_date = lastDate;
      newCasesObj.territory_selected = false;
      newCasesObj.territory_data = [];
      newCasesObj.arrival_selected = false;
      newCasesObj.arrival_data = [];
      this._smartclientService.getScNewCases(newCasesObj)
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
    for (let i in scDataByMonthYr) {
      arr = []
      arr.push(scDataByMonthYr[i].bymonth);
      arr.push(parseInt(scDataByMonthYr[i].case_count));
      filterSCByDate.push(arr);
    }
    console.log("filterSCByDate" + JSON.stringify(filterSCByDate));
    return filterSCByDate;
  }

  /**
 * This method check if From and to dropdown selected.
 */
  checkDateDropdownSelected(newCasesObj): any {
    return new Promise((resolve, reject) => {
      this._smartclientService.getScNewCases(newCasesObj)
        .subscribe(res => {
          //this.scNewCaseAllData = res;//to use in only territoy or arival type filter
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
      console.log("the if of check for length");
      this.checkDataSCNC = true;
      array = [['Months', 'Cases Counts'], ['Jan', 0], ['Feb ', 0], ['Mar ', 0], ['Apr ', 0], ['May ', 0], ['Jun ', 0], ['Jul ', 0], ['Aug ', 0], ['Sep ', 0], ['Oct ', 0], ['Nov ', 0], ['Dec ', 0]];
      this.drawChart(array);

    } else {
      array.push(['Months', 'Cases Counts']);
      for (let i in data) {
        array.push(data[i]);
      }
      this.checkDataSCNC = false;
    }
    return array;
  }

  public arrivalTypesArr = [];
  // ng multiselect events implemented by Vishal Sehgal 12/2/2019
  onItemSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr.push(item);
      this.filterChartData('dropdown');
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr.push(item);
      this.filterChartData('dropdown');
    }

  }

  onItemDeSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr = this.removeElementArr(this.territoriesArr, item);
      this.filterChartData('dropdown');
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = this.removeElementArr(this.arrivalTypesArr, item);
      this.filterChartData('dropdown');
    }
  }

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

  onToYearChange(item) {
    this.datesData = [];
    this.datesData.push(item.firstDay);
    this.datesData.push(item.lastDay);
    this.filterChartData('dropdown');
    //console.log("the added array is:" + JSON.stringify(this.datesData));

  }

  onDeSelectAll(item, from) {
    if (from == 'territory') {
      this.territoriesArr = [];
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = [];
    }
    this.filterChartData('dropdown');
  }

  public filterChartData(caseFrom) {
    this.drillDownData = [];
    this.newModelCounts = '';
    let finalArr = [];
    let newCasesObj = new FilterFormat();;
    if (this.datesData.length == 2) {
      newCasesObj.from_date = this.convertDateMoment(this.datesData[0]);
      newCasesObj.to_date = this.convertDateMoment(this.datesData[1]);
    } else {
      let lastDate = this.convertDateMoment(new Date());//current date
      let firstDate = moment(new Date()).subtract(1, 'years');//earlier date
      newCasesObj.from_date = this.convertDateMoment(firstDate);
      newCasesObj.to_date = lastDate;
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
        //this.drillDownData=[];
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
      newCasesObj.from_date = this.status[0];
      newCasesObj.to_date = this.status[1];
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
        this.getSCDrillDownData(newCasesObj)
          .then((res: any) => {
            this.newModelCounts = res.length;
            res = this.calculateNssAging(res);
            console.log("uuu----"+JSON.stringify(res));
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
      newCasesObj.from_date = this.status[0];
      newCasesObj.to_date = this.status[1];
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
      newCasesObj.from_date = this.status[0];
      newCasesObj.to_date = this.status[1];
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

  calculateNssAging(res) {
    let currentDate: any = new Date();
    console.log("the data is:" + JSON.stringify(res));
    for (let i = 0; i < res.length; i++) {
      //console.log("the res" + JSON.stringify(res));
      let caseCreationdate = new Date(moment(res[i].case_creation_date).format('YYYY-MM-DD'));
      let timeDiff = Math.abs(currentDate.getTime() - caseCreationdate.getTime());
      let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      //console.log("diff----"+diffDays)
      res[i]['nss_aging'] = diffDays + ' days';
      res[i].case_creation_date = res[i].case_creation_date == null ? '-' : moment(res[i].case_creation_date).format('YYYY-MM-DD');
      res[i].contract_start_date = res[i].contract_start_date == null ? '-' : moment(res[i].contract_start_date).format('YYYY-MM-DD');

    }
    return res;
  }

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

  public clearAll() {
    console.log("after the modal is closed:");
    this.drillDownData = [];
    console.log("the dd data is:" + JSON.stringify(this.drillDownData));
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
        //this.drawChart(res);
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
        //this.drawChart(res);
        this.sideViewDropDowns.showTerritory = true;
        this.sideViewDropDowns.territoryData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }).catch(error => {
        console.log("error getMinMaxDates " + error);
      })
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

    //this.sideViewDropDowns.showArrivalType = true;
    //this.sideViewDropDowns.arrivalTypeData = ['SAOF', 'CPQ', 'Q2SC'];
    this.sideViewDropDowns.showYearDD = true;
    this.sideViewDropDowns.compHeading = appheading.graph3;
    this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
  }

}
