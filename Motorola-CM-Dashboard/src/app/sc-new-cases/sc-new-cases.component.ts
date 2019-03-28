import { Component, OnInit } from '@angular/core';
import { SmartclientService } from '../services/lookup/smartclient.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
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
  public monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
    this.openScModel.nativeElement.click();

    // let drillDownStatusnew =[];
    // drillDownStatusnew = (event.selectedRowValues[0]);
    // status = drillDownStatusnew[0];
    console.log("the drilldown data is:" + JSON.stringify(event));
    // console.log("in the selectBar" + JSON.stringify(event.selectedRowValues[0]));
    if (event.message == 'select') {
      this.newModelCounts = event.selectedRowValues[1];
      this.data = event.selectedRowValues[0];
      //console.log("the data is:" + JSON.stringify(this.data));
      this.status = this.fdld(this.data);
      //console.log("the ld is:" + JSON.stringify(this.status));
      $('.modal .modal-dialog').css('width', $(window).width() * 0.95);//fixed
      $('.modal .modal-body').css('height', $(window).height() * 0.77);//fixed
      $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.69);
      $('tbody.SCModlTbody').css('overflow-y', 'scroll');
      $('tbody.SCModlTbody').css('overflow-x', 'hidden');
      $('tbody.SCModlTbody').css('width', '100%');
      // status = this.fdld(status);
      // console.log("the fd ld is :"+JSON.stringify(status[0])+"the ld is :"+JSON.stringify(status[1]));
      this.getSCDrillDownData(moment(status[0]).format('YYYY-MM-DD'), moment(status[1]).format('YYYY-MM-DD'))
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
          //console.log("the res is:" + JSON.stringify(res));
          //console.log("the drilldowndata for ebs contracts by status is:"+JSON.stringify(this.drillDown));
          this.drillDownData = res;

        }, error => {
          console.log("error getTerritories " + error);
        });
      this.drillDown = [];

    }
  }

  public exportToExcel() {
    this._excelService.exportAsExcelFile(this.drillDownData, 'Smart Client New Cases');
  }


  public fdld(data) {
    let v = data.split(' ');
    let arr = [];
    let newone = v[0] + ' 1, '
    let newtwo = v[1];
    let newthree = newone + newtwo;
    let newModDate = new Date(newthree);
    let FirstDay = new Date(newModDate.getFullYear(), newModDate.getMonth(), 1).toLocaleDateString();
    let LastDay = new Date(newModDate.getFullYear(), newModDate.getMonth() + 1, 0).toLocaleDateString();
    let fd = moment(FirstDay).format('YYYY-MM-DD');
    let ld = moment(LastDay).format('YYYY-MM-DD');
    arr.push(fd);
    arr.push(ld);
    return arr;

  }

  public getTerritories() {
    return new Promise((resolve, reject) => {
      let territories;
      this._smartclientService.getScTerritories()
        .subscribe(data => {
          territories = data;
          //console.log("territories" + territories)
        }, err => { console.log("getScTerritories error "+err)},
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
  public getSCDrillDownData(first, last) {
    return new Promise((resolve, reject) => {
      let jsonObj = { 'first': this.status[0], 'last': this.status[1] };
      this._smartclientService.getScDrillDownDates(jsonObj)
        .subscribe(data => {
          this.drillDown = data;
          // console.log("territories" + this.territories)
          resolve(this.drillDown);
        }, error => {
          reject(error);
        })
    })
  }


  public scNewCaseAllData: any;
  public datesInit=[];
  public getSCNewCases() {
    return new Promise((resolve, reject) => {
      let lastDate = this.convertDateMoment(new Date());//current date
      let firstDate = moment(new Date()).subtract(1, 'years');//earlier date
      let dateJson = { from: this.convertDateMoment(firstDate), to: lastDate };
      this._smartclientService.getScNewCases(dateJson)
        .subscribe(res => {
          this.scNewCaseAllData = res;//to use in only territoy or arival type filter
          // let lastDate = (moment(new Date()).format('YYYY-MM-DD'));//current date
          // let firstDate = (moment(new Date()).subtract(1, 'years'));//earlier date
          
          // this.datesData.push(this.convertDateMoment(firstDate));
          // this.datesData.push(lastDate);
          this.datesInit.push(this.convertDateMoment(firstDate));
          this.datesInit.push(lastDate);
          this.datesData=[];
          resolve(this.makeCount(this.datesInit, res));
        }, error => {
          reject(error);
        })
    });
  }

  /**
 * This method check if From and to dropdown selected.
 */
  checkDateDropdownSelected(datesData): any {
    return new Promise((resolve, reject) => {
      if (datesData.length > 1) {
        let lastDate = this.convertDateMoment(datesData[1]);//current date
        let firstDate = this.convertDateMoment(datesData[0]);//earlier date
        let dateJson = { from: firstDate, to: lastDate };
        this._smartclientService.getScNewCases(dateJson)
          .subscribe(res => {
            //this.scNewCaseAllData = res;//to use in only territoy or arival type filter
            resolve(res);
          }, error => {
            reject(error);
          })
      } else {
        resolve('nodateselected');
      }
    })
  }
  public makeCount(dateArr, scNewCaseAllData) {
    let datejsonArr: any = [];
    let lastDate = dateArr[1];//current date
    let firstDate = dateArr[0];//earlier date
    //console.log("make count fs" + firstDate + ' lastdate' + lastDate)
    datejsonArr = this.dateRange(firstDate, lastDate);
    //console.log("the json returned is:" + JSON.stringify(datejsonArr));
    //console.log("filter data" + JSON.stringify(this.getDataFilterByDate(datejsonArr,scNewCaseAllData)));
    return this.getDataFilterByDate(datejsonArr, scNewCaseAllData);
  }

  /**
   * Make data  according to contracts in particular month year.
   * @param datejsonArr-Lowerdate and upper date 
   * @param scNewCaseAllData -Array of data to be filtered
   */
  getDataFilterByDate(datejsonArr, scNewCaseAllData) {
    //console.log("getDataFilterByDate" + scNewCaseAllData.length);
    let filterSCByDate = [], arr, filterScData
    for (let i in datejsonArr) {
      arr = [], filterScData = [];
      filterScData = scNewCaseAllData.filter(item => {
        return this.convertDateMoment(item.case_creation_date) >= datejsonArr[i] && this.convertDateMoment(item.case_creation_date) <= this.calcLastDayMonth(datejsonArr[i]);
      })
      arr.push(this.getMonthYrByDate(datejsonArr[i]));
      arr.push(filterScData.length);
      filterSCByDate.push(arr);
    }
    return filterSCByDate;
  }


  /**
   * calculate last date of particular month by passing 
   * @param incominDate:date in format yyyy-MM-dd 
   */
  calcLastDayMonth(incominDate) {
    let date = new Date(incominDate);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return this.convertDateMoment(lastDay);
  }

  /**
   * Get month with year appended like Jan 2018,Feb 2019
   * @param incominDate:date in format yyyy-MM-dd  
   */
  getMonthYrByDate(incominDate) {
    //console.log("incoming date" + incominDate);
    let dt = new Date(incominDate);
    // console.log("date" + dt.getMonth() + ' ' + dt.getFullYear());
    return this.monthArr[dt.getMonth()] + ' ' + dt.getFullYear();
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
      array = [['Months', 'Cases Counts'], ['Jan 17', 0], ['Feb 17', 0], ['Mar 17', 0], ['Apr 17', 0], ['May 17', 0], ['Jun 17', 0], ['Jul 17', 0], ['Aug 17', 0], ['Sep 17', 0], ['Oct 17', 0], ['Nov 17', 0], ['Dec 17', 0], ['Jan 18', 0], ['Feb 18', 0], ['Mar 18', 0], ['Apr 18', 0], ['May 18', 0], ['Jun 18', 0], ['Jul 18', 0], ['Aug 18', 0], ['Sep 18', 0], ['Oct 18', 0], ['Nov 18', 0], ['Dec 18', 0]];
      this.drawChart(array);

    } else {
      array.push(['Months', 'Cases Counts']);
      for (let i in data) {
        array.push(data[i]);
      }
    }
    return array;
  }

  public arrivalTypesArr = [];
  // ng multiselect events implemented by Vishal Sehgal 12/2/2019
  onItemSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr.push(item);
      this.filterChartData();
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr.push(item);
      this.filterChartData();
    }

  }

  onItemDeSelect(item, from) {
    if (from == 'territory') {
      this.territoriesArr = this.removeElementArr(this.territoriesArr, item);
      this.filterChartData();
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = this.removeElementArr(this.arrivalTypesArr, item);
      this.filterChartData();
    }
  }

  onSelectAll(item, from) {
    if (from == 'territory') {
      this.territoriesArr = [];
      this.territoriesArr = item
      this.filterChartData();
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = [];
      this.arrivalTypesArr = item;
      this.filterChartData();
    }
  }

  onToYearChange(item) {
    this.datesData = [];
    this.datesData.push(item.firstDay);
    this.datesData.push(item.lastDay);
    this.filterChartData();
    //console.log("the added array is:" + JSON.stringify(this.datesData));

  }

  onDeSelectAll(item, from) {
    if (from == 'territory') {
      this.territoriesArr = [];
    } else if (from == 'arrivalType') {
      this.arrivalTypesArr = [];
    }
    this.filterChartData();
  }

  public filterChartData() {
    let finalArr = [];
    //console.log("case data" + JSON.stringify(this.caseData));
    if (this.territoriesArr.length > 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t>1  a0");
      if(this.datesData.length>1){
        this.datesInit=this.datesData;
      }
      this.checkDateDropdownSelected(this.datesData)
        .then(result => {
          if (result != 'nodateselected') {
            this.scNewCaseAllData = result;
          }
          for (let i in this.territoriesArr) {
            let territoryItem = this.territoriesArr[i];
            let territoryFilterarr = this.scNewCaseAllData.filter(item => {
              // console.log("territoryItem" + territoryItem);
              return item.territory == territoryItem;
            });
            for (let i = 0; i < territoryFilterarr.length; i++) {
              finalArr.push(territoryFilterarr[i]);
            }
            //finalArr.push(territoryFilterarr);
            //finalArr = territoryFilterarr;
          }

          let res = this.makeCount(this.datesInit, finalArr);
          let chartData = this.makeChartData(res);
          this.drawChart(chartData);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });

    } else if (this.territoriesArr.length == 0 && this.arrivalTypesArr.length == 0) {
      //console.log("t0  a0");
      if(this.datesData.length>1){
        this.datesInit=this.datesData;
      }
      this.checkDateDropdownSelected(this.datesData)
        .then(result => {
          if (result != 'nodateselected') {
            this.scNewCaseAllData = result;
          }
          let res = this.makeCount(this.datesInit, this.scNewCaseAllData);
          let chartData = this.makeChartData(res);
          this.drawChart(chartData);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });

    } else if (this.territoriesArr.length == 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t0 a>0");
      if(this.datesData.length>1){
        this.datesInit=this.datesData;
      }
      this.checkDateDropdownSelected(this.datesData)
        .then(result => {
          if (result != 'nodateselected') {
            this.scNewCaseAllData = result;
          }
          for (let i in this.arrivalTypesArr) {
            let arrivalTypeItem = this.arrivalTypesArr[i];
            let arrivalTypeFilterarr = this.scNewCaseAllData.filter(item => {

              return item.arrival_type == arrivalTypeItem;
            });
            for (let i = 0; i < arrivalTypeFilterarr.length; i++) {
              finalArr.push(arrivalTypeFilterarr[i]);
            }
          }

          let res = this.makeCount(this.datesInit, finalArr);
          let chartData = this.makeChartData(res);
          this.drawChart(chartData);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });

    }
    else if (this.territoriesArr.length > 0 && this.arrivalTypesArr.length > 0) {
      //console.log("t>0  a>0");
      if(this.datesData.length>1){
        this.datesInit=this.datesData;
      }
      this.checkDateDropdownSelected(this.datesData)
        .then(result => {
          if (result != 'nodateselected') {
            this.scNewCaseAllData = result;
          }
          for (let i in this.territoriesArr) {
            let territoryItem = this.territoriesArr[i];
            let territoryFilterarr = this.scNewCaseAllData.filter(item => {
              return item.territory.toLowerCase() == territoryItem.toLowerCase();
            });
            //console.log("territoryFilterarr" + JSON.stringify(territoryFilterarr));
            //finalArr = territoryFilterarr;
            for (let i in this.arrivalTypesArr) {
              let arrivalTypeItem = this.arrivalTypesArr[i];
              let arrivalTypeFilterarr = territoryFilterarr.filter(item => {
                return item.arrival_type == arrivalTypeItem;
              });
              for (let i = 0; i < arrivalTypeFilterarr.length; i++) {
                finalArr.push(arrivalTypeFilterarr[i]);
              }
            }
          }

          let res = this.makeCount(this.datesInit, finalArr);
          let chartData = this.makeChartData(res);
          this.drawChart(chartData);
        }).catch(error => {
          console.log("error in dateDropdownSelected " + error);
        });

    }
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

    this.sideViewDropDowns.showArrivalType = true;
    this.sideViewDropDowns.arrivalTypeData = ['SAOF', 'CPQ', 'Q2SC'];
    this.sideViewDropDowns.showYearDD = true;
    this.sideViewDropDowns.compHeading = appheading.graph3;
    this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
  }

}
