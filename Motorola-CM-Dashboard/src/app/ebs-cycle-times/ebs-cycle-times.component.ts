import { Component, OnInit } from '@angular/core';
import { EbsService } from '../services/lookup/ebs.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import { ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import { ChartSelectEvent } from 'ng2-google-charts';
import { appheading } from '../enums/enum';
import { ExcelServiceService } from '../services/convert_to_excel/excel-service.service';
import * as moment from 'moment';

@Component({
  selector: 'app-ebs-cycle-times',
  templateUrl: './ebs-cycle-times.component.html',
  styleUrls: ['./ebs-cycle-times.component.css']
})
export class EbsCycleTimesComponent implements OnInit {
  public cycleTimesData: any = [];
  public contractsData = [];

  public arrivalTypesArr: any = [];
  public minmaxdates:any;
  public ebscolumnChartData: any;
  public drillDown:any;
  public territories: any;
  public territoriesArr: any = [];
  public data:any;
  public newModelCounts:any;
  public workFlowStatusArr: any = [];
  public sideViewDropDowns = new SideViewDropDowns();
  public checkData:Boolean=false;
  public status: any;
  public drillDownData: any;
  public restUrlFilterYr: string = 'ebs_cycle_times';

  public monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  @ViewChild('openSCModal') openScModel: ElementRef;

  constructor(private _ebsService: EbsService, private _dataHandlerService: DataHandlerService, private _excelService:ExcelServiceService) {
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

    // let drillDownStatusnew =[];let status:any;
    // drillDownStatusnew = (event.selectedRowValues[0]).split(' ');
    // status = drillDownStatusnew[0];
    // console.log("the drilldown status is:"+JSON.stringify(status));
    // console.log("in the selectBar"+JSON.stringify(event.selectedRowValues[0]));
    if(event.message=='select'){
      this.newModelCounts = event.selectedRowValues[1];
      this.data = event.selectedRowValues[0];
      //console.log("the data is:" + JSON.stringify(this.data));
      this.status = this.fdld(this.data);
    
    // console.log("the data is:",this.data);
    $('.modal .modal-dialog').css('width', $(window).width() * 0.95);//fixed
    $('.modal .modal-body').css('height', $(window).height() * 0.77);//fixed
    $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.69);
    $('tbody.SCModlTbody').css('overflow-y', 'scroll');
    $('tbody.SCModlTbody').css('overflow-x', 'hidden');
    // $('tbody.SCModlTbody').css('display', 'block');
    $('tbody.SCModlTbody').css('width', '100%');

    this.getDrillDownData(moment(status[0]).format('YYYY-MM-DD'), moment(status[1]).format('YYYY-MM-DD'))
    .then((res:any) => {
      
      //console.log("the drilldowndata for ebs contracts by status is:"+JSON.stringify(res));

      for (let i in res) {
        //res[i].
        res[i].contract_creation_date = moment(res[i].case_creation_date).format('YYYY-MM-DD');
        res[i].sts_changed_on = moment(res[i].sts_changed_on).format('YYYY-MM-DD');
        //this.drillDown(moment(res[i].contract_creation_date).format('YYY-MM-DD'));
      }
      console.log("the drilldowndata for ebs contracts by status is:" + JSON.stringify(this.drillDown));
      this.drillDownData = res;

    }, error => {
      //console.log("error getTerritories " + error);
    });
    this.drillDown=[];
    }
  }
  public exportToExcel(){
   
  
    this._excelService.exportAsExcelFile(this.drillDownData, 'EBS Cycle Times');

  }

  
  public fdld(data) {
    var v = data.split(' ');
    let arr = [];
    var newone = v[0] + ' 1, '
    var newtwo = v[1];
    var newthree = newone + newtwo;
    var newModDate = new Date(newthree);
    var FirstDay = new Date(newModDate.getFullYear(), newModDate.getMonth(), 1).toLocaleDateString();
    var LastDay = new Date(newModDate.getFullYear(), newModDate.getMonth() + 1, 0).toLocaleDateString();
    var fd = moment(FirstDay).format('YYYY-MM-DD');
    var ld = moment(LastDay).format('YYYY-MM-DD');
    arr.push(fd);
    arr.push(ld);
    return arr;

  }


  public datesData = [];
  public datesInit=[];
  public getCycleTimes() {
      let json:any;
      let date = new Date();
      let lastDate = (moment(date).format('YYYY-MM-DD'));
      console.log("the last date is:"+JSON.stringify(lastDate));
      let firstDate = (moment(date).subtract(1, 'years'))
      console.log("the first date is: "+JSON.stringify(moment(firstDate).format('YYYY-MM-DD')));
      let countEnd=[];
      json={ 'from':moment(firstDate).format('YYYY-MM-DD'),'to':lastDate}
      return new Promise((resolve, reject) => {
      this._ebsService.getEBSCycleTimes(json).subscribe(data => {
        this.cycleTimesData = data;
        console.log("the data is:"+JSON.stringify(this.cycleTimesData)); 
        this.datesData=[];
        this.datesInit.push(moment(firstDate).format('YYYY-MM-DD'));
        this.datesInit.push(lastDate);
        resolve(this.makeCount(this.datesInit,data));
        
      }, error => {
        reject(error);
      })
  });
}

  public makeCount(datesData,cycleTimesData) {
    let datejsonArr: any = [];
    let lastDate = datesData[1];
    let firstDate = datesData[0];
    datejsonArr = this.dateRange(moment(firstDate).format('YYYY-MM-DD'), lastDate);
    
    return this.getDataFilterByDate(datejsonArr,cycleTimesData);
  }

  getDataFilterByDate(datejsonArr,cycleTimesData) {
    let filterSCByDate = [],arr,filterScData
    for (let i in datejsonArr) {
       arr = [],filterScData=[];
       filterScData = cycleTimesData.filter(item => {
        return this.convertDateMoment(item.contract_creation_date) >= datejsonArr[i] && this.convertDateMoment(item.contract_creation_date) <= this.calcLastDayMonth(datejsonArr[i]);
      })
      arr.push(this.getMonthYrByDate(datejsonArr[i]));
      arr.push(filterScData.length);
      filterSCByDate.push(arr);
    }
    return filterSCByDate;
  }


  calcLastDayMonth(incominDate) {
    let date = new Date(incominDate);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return this.convertDateMoment(lastDay);
  }

  getMonthYrByDate(incominDate) {
   
    var dt = new Date(incominDate);
  
    return this.monthArr[dt.getMonth()] + ' ' + dt.getFullYear();
  }

  convertDateMoment(incominDate) {
    return moment(incominDate).format('YYYY-MM-DD');
  }


 
  public getebsTerritoriesData() {
    return new Promise((resolve, reject) => {
      let territories;
      this._ebsService.getEBSTerritories().subscribe(data => {
        territories = data;
        
      }, err => console.error(err),
        
        () => {
          let array = [];
          let count = 0;
          let otherTerritory;
          for (let i in territories) {
            if (territories[i].territory == 'OTHER') {
             
              otherTerritory = { 'item_id': territories[i].territory, 'item_text': territories[i].territory };
            } else {
              array.push({ 'item_id': territories[i].territory, 'item_text': territories[i].territory });
            }
          }
          array.push(otherTerritory);
         
          resolve(array);
        }
      )
    }).catch((error) => {
      reject(error);
     
    })
  }

 public getContractsDataAvg(){
  return new Promise((resolve, reject) => {
    let cases = [];
    this._ebsService.getEBSContractsAvg().
      subscribe(data => {
        if (data.length > 0) {
          cases = this.makeChartDataAvg(data);
          let arr = [];
          // for (let i in cases) {
          //   arr.push(cases[i].contractscount)
          // }
          // this.Total = arr.reduce(this.SUM);
          //console.log("the total contracts are as under:"+JSON.stringify(this.Total)); 
          this.contractsData = data;
          cases = this.contractsData;
          // cases = this.calculatePerc(cases);
          //this.caseData = data;
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
        bar: {groupWidth: "75%"},
        chartArea:{left:75,top:20,width:'75%'},
        legend: { position: 'bottom',alignment:'center', textStyle: { color: '#444444' } },
        backgroundColor: '#FFFFFF',
        hAxis: {
          textStyle: { color: '#444444' },
            
          slantedText: true,
          slantedTextAngle: 90
          
        },
        vAxis: {
          textStyle: { color: '#444444' },
          title:'Median Days',
          titleTextStyle:{italic: false}
          
        },
        series: {
          0: { color: '#3274C2' },
          

        },
        tooltip: { isHtml: false, type: 'string' }
      }
    }
  }

  public fromMedOrAvg = 'median';

    // ng multiselect events implemented by Vishal Sehgal 12/2/2019
    onItemSelect(item, from) {
      console.log("the item is:"+JSON.stringify(item)+JSON.stringify(from));
      if (from == 'territory') {
        this.territoriesArr.push(item)
        console.log("terrr is:"+JSON.stringify(this.territoriesArr));
        this.filterChartData();

      } else if (from == 'arrivalType') {
        this.arrivalTypesArr.push(item);
        console.log("terrr is:"+JSON.stringify(this.territoriesArr));
        this.filterChartData();

      }
      else if (from == 'contracttime') {
        this._dataHandlerService.resetAllDropDowns(true);
        this.territoriesArr = [];
        this.workFlowStatusArr = [];
        this.arrivalTypesArr = [];
        // console.log("casetime selected Median" + from);
        if (item == 'Median') {
          console.log("in the If of Medain Days");
          this.restUrlFilterYr = 'ebs_cycle_times';
          this.fromMedOrAvg = 'median';
          //console.log("casetime selected Median" + this.restUrlFilterYr);
          this.getCycleTimes()
            .then((res: any) => {
              let resnew = this.makeCount(this.datesInit, res);
              let chartData = this.makeChartData(res);
              this.drawchart(chartData);
              //this.drawchart(res);
              // this.filterChartData();
            }, error => {
              console.log("error getCaseData " + error);
            });
        } else if (item == 'Average') {
          //console.log("in the else if of Medain Days" );
          this.restUrlFilterYr = 'ebs_contract_state_avg';
          this.fromMedOrAvg = 'average';
          //console.log("casetime selected Averaage" + this.restUrlFilterYr);
          this.getContractsDataAvg()
            .then((res: any) => {
              let resnew = this.makeCount(this.datesInit, res);
              let chartData = this.makeChartData(res);
              this.drawchart(chartData);
              //this.drawchart(resnew);
              //this.filterChartData();
            }, error => {
              console.log("error getCaseDataAvg " + error);
            });
        }
      //console.log("territory" + JSON.stringify(this.territoriesArr));
     // console.log("workflow" + JSON.stringify(this.workFlowStatusArr));
      this.filterChartData();
      }
     }
  
    onItemDeSelect(item, from) {
      if (from == 'territory') {
        this.territoriesArr = this.removeElementArr(this.territoriesArr, item);
        this.filterChartData();
      } else if (from == 'arrivalType') {
        this.workFlowStatusArr = this.removeElementArr(this.arrivalTypesArr, item);
        this.filterChartData();
      }
      // console.log("territory" + JSON.stringify(this.territoriesArr));
      // console.log("workflow" + JSON.stringify(this.workFlowStatusArr));
      
    }
  
    onSelectAll(item, from) {
      if (from == 'territory') {
        this.territoriesArr = [];
        this.territoriesArr = item;
        this.filterChartData();

      } else if (from == 'arrivalType') {
        this.arrivalTypesArr = [];
        this.arrivalTypesArr = item;
        this.filterChartData();

      }
    
      // console.log("territory" + JSON.stringify(this.territoriesArr));
      // console.log("workflow" + JSON.stringify(this.workFlowStatusArr));
    }
  
    onDeSelectAll(item, from) {
      if (from == 'territory') {
        this.territoriesArr = [];
      } else if (from == 'arrivalType') {
        this.arrivalTypesArr = [];
      }
      this.filterChartData();
      
      // console.log("onDeSelectAll" + JSON.stringify(item));
      
    }


    onToYearChange(item) {
      console.log("the item is:", item);
      this.datesData = [];
      this.datesData.push(item.firstDay);
      this.datesData.push(item.lastDay);
      //console.log("the dates data is:" + JSON.stringify(this.datesData));
      this.filterChartData();
    }
  
    /**
     * This method filters the data according selected territories and workflowstatus
     */
    public filterChartData() {
      let finalArr = [];
      console.log("arrival"+this.arrivalTypesArr.length);
      console.log("terror"+this.territoriesArr.length);
      //console.log("case data" + JSON.stringify(this.caseData));
      if (this.territoriesArr.length > 0 && this.arrivalTypesArr.length == 0) {
        console.log("t>1  a0");
        if(this.datesData.length>1){
          this.datesInit=this.datesData;
        }
        this.checkDateDropdownSelected(this.datesData)
          .then(result => {
            if (result != 'nodateselected') {
              this.cycleTimesData = result;
            }
            for (let i in this.territoriesArr) {
              let territoryItem = this.territoriesArr[i];
              let territoryFilterarr = this.cycleTimesData.filter(item => {
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
            this.drawchart(chartData);
          }).catch(error => {
            console.log("error in dateDropdownSelected " + error);
          });
  
      } else if (this.territoriesArr.length == 0 && this.arrivalTypesArr.length == 0) {
        console.log("t0  a0");
        if(this.datesData.length>1){
          this.datesInit=this.datesData;
        }
        this.checkDateDropdownSelected(this.datesData)
          .then(result => {
            if (result != 'nodateselected') {
              this.cycleTimesData = result;
            }
            let res = this.makeCount(this.datesInit, this.cycleTimesData);
            let chartData = this.makeChartData(res);
            this.drawchart(chartData);
          }).catch(error => {
            console.log("error in dateDropdownSelected " + error);
          });
  
      } else if (this.territoriesArr.length == 0 && this.arrivalTypesArr.length > 0) {
        console.log("t0 a>0");
        if(this.datesData.length>1){
          this.datesInit=this.datesData;
        }
        this.checkDateDropdownSelected(this.datesData)
          .then(result => {
            if (result != 'nodateselected') {
              this.cycleTimesData = result;
            }
            for (let i in this.arrivalTypesArr) {
              let arrivalTypeItem = this.arrivalTypesArr[i];
              let arrivalTypeFilterarr = this.cycleTimesData.filter(item => {
  
                return item.arrival_type == arrivalTypeItem;
              });
              for (let i = 0; i < arrivalTypeFilterarr.length; i++) {
                finalArr.push(arrivalTypeFilterarr[i]);
              }
            }
  
            let res = this.makeCount(this.datesInit, finalArr);
            let chartData = this.makeChartData(res);
            this.drawchart(chartData);
          }).catch(error => {
            console.log("error in dateDropdownSelected " + error);
          });
  
      }
      else if (this.territoriesArr.length > 0 && this.arrivalTypesArr.length > 0) {
        console.log("t>0  a>0");
        if(this.datesData.length>1){
          this.datesInit=this.datesData;
        }
        this.checkDateDropdownSelected(this.datesData)
          .then(result => {
            if (result != 'nodateselected') {
              this.cycleTimesData = result;
            }
            for (let i in this.territoriesArr) {
              let territoryItem = this.territoriesArr[i];
              let territoryFilterarr = this.cycleTimesData.filter(item => {
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
            this.drawchart(chartData);
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
  
   
  
    public makeChartData(data) {
      let array = [];
      if (data.length == 0) {
        console.log("the if of check for length");
        this.checkData = true;
        array = [['Months', 'Cases Counts'], ['Jan 17', 0], ['Feb 17', 0], ['Mar 17', 0], ['Apr 17', 0], ['May 17', 0], ['Jun 17', 0], ['Jul 17', 0], ['Aug 17', 0], ['Sep 17', 0], ['Oct 17', 0], ['Nov 17', 0], ['Dec 17', 0], ['Jan 18', 0], ['Feb 18', 0], ['Mar 18', 0], ['Apr 18', 0], ['May 18', 0], ['Jun 18', 0], ['Jul 18', 0], ['Aug 18', 0], ['Sep 18', 0], ['Oct 18', 0], ['Nov 18', 0], ['Dec 18', 0]];
        this.drawchart(array);
  
      } else {
        array.push(['Months', 'Cases Counts']);
        for (let i in data) {
          array.push(data[i]);
        }
      }
      return array;
    }

    public dateRange(startDate, endDate) {
      let start      = startDate.split('-');
      let end        = endDate.split('-');
      let startYear  = parseInt(start[0]);
      let endYear    = parseInt(end[0]);
      let dates      = [];
    
      for(var i = startYear; i <= endYear; i++) {
        var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
        var startMon = i === startYear ? parseInt(start[1])-1 : 0;
        for(var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j+1) {
          var month = j+1;
          var displayMonth = month < 10 ? '0'+month : month;
          dates.push([i, displayMonth, '01'].join('-'));
        }
      }
      return dates;
    }
  
    /**
     * Common method to create google chart array structure.
     * @param cases -Case data.
     */
    public makeChartArr(cases) {
      cases=[];
      //console.log("the make chart data is :" + JSON.stringify(cases));
      let array = [];
      array.push(['Status', 'No. of Contracts', { role: "annotation" }, { role: "style" }]);
      let barColor=null;
      if(cases.length==0){
        this.drawchart(cases);
        this.checkData = true;
        array.push(['', 0, '', '']);
      }else if(cases.length > 0){
        this.drawchart(cases);
        this.checkData = false;
      }else {
        this.checkData = true;
      }
      // ARRAY OF OBJECTS
      for (let i in cases) {
        // let index=parseInt(i);
        barColor='#4A90E2';


      // if(index % 2 == 0){
      //   barColor='#4A90E2';
      // }
      // else{
      //   barColor='#93C0F6';
      // }
        //console.log(i);
        // Create new array above and push every object in
        array.push([cases[i].status,parseInt(cases[i].contractscount),parseInt(cases[i].mediandays), barColor]);
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

    public getDrillDownData(first,last){
      return new Promise((resolve, reject) => {
        let jsonObj = { 'first': this.status[0], 'last': this.status[1] };
        this._ebsService.getEBSDrillDown(jsonObj).subscribe(data => {
          this.drillDown = data;
          // console.log("territories" + this.territories)
        }, err => console.error(err),
          // the third argument is a function which runs on completion
          () => {
          //  console.log("the drilldown data recived is:"+this.drillDown);
            resolve(this.drillDown);
          }
        )
      }).catch((error) => {
        reject(error);
        //console.log('errorin getting data :', error);
      })
  
    }

    public getMinMaxDates(){
      return new Promise((resolve, reject) => {
         this._ebsService.getEBSMinMaxDates().subscribe(data => {
           this.minmaxdates = data;
           // console.log("territories" + this.territories)
         }, err => console.error(err),
           // the third argument is a function which runs on completion
           () => {
             //console.log("the drilldown data recived is:"+JSON.stringify(this.drillDown));
             resolve(this.minmaxdates);
           }
         )
       }).catch((error) => {
         reject(error);
         //console.log('errorin getting data :', error);
       })
     }

     checkDateDropdownSelected(datesData): any {
      return new Promise((resolve, reject) => {
        console.log("length is:"+datesData.length);
        if (datesData.length > 1) {
          let lastDate = this.convertDateMoment(datesData[1]);//current date
          let firstDate = this.convertDateMoment(datesData[0]);//earlier date
          let dateJson = { from: firstDate, to: lastDate };
          this._ebsService.getEBSCycleTimes(dateJson)
            .subscribe(res => {
              //this.cycleTimesData = res;//to use in only territoy or arival type filter
              resolve(res);
            }, error => {
              reject(error);
            })
        } else {
          resolve('nodateselected');
        }
      })
    }
  

    


  ngOnInit() {
    this.getCycleTimes()
      .then((res: any) => {
        if (res.length == 0) {
          res = [['Months', 'No. Of Cases'], ['', ], ['', 0], ['', 0]];
          this.drawchart(res);
          this.checkData = true;
       } else if (res.length > 0) {
          // alert("there is no data to bind to chart");
          //res=[['Months','Cases Counts'],['Jan 2017',res[0]],['Feb 2017',res[1]],['Mar 2017',res[2]],['Apr 2017',res[3]],['May 2017',res[4]],['Jun 2017',res[5]],['Jul 2017',res[6]],['Aug 2017',res[7]],['Sep 2017',this.arrr[8]],['Oct 2017',this.arrr[9]],['Nov 2017',this.arrr[10]],['Dec 2017',this.arrr[11]]];
          this.drawchart(res);
          this.checkData = false;
       } else {
          this.checkData = true;
        }
        console.log("th ebs cycle times data is:"+JSON.stringify(res));
        res.splice(0,0,['Months','No. Of Contracts']);
        this.drawchart(res);
      }, error => {
        console.log("error getCaseData " + error);
      });


       this.getMinMaxDates().then((res:any)=>{
        console.log("the dates are :"+JSON.stringify(res));
        let resnew:any=res;
        this._dataHandlerService.setMinMaxDate(resnew);

       })
    this.getebsTerritoriesData()
      .then((res: any) => {
        // if(res.length>=0){
        //   this.checkData = false;
        // }else{
        //   alert("there is no data to bind to chart")
        //   this.checkData = true;

        // }
        //this.drawChart(res);
        this.sideViewDropDowns.showTerritory = true;
        this.sideViewDropDowns.territoryData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }, error => {
        console.log("error getTerritories " + error);
      });

    // this.getWorkflowStatus()
    //   .then((res: any) => {
    //     //this.drawChart(res);
    //     this.sideViewDropDowns.showWorkFlow = true;
    //     this.sideViewDropDowns.workFlowData = res;
    //     this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
    //   }, error => {
    //     console.log("error getWorkflowStatus " + error);
    //   });
      //this.sideViewDropDowns.showContracType=true;
      this.sideViewDropDowns.showArrivalType=true;
      this.sideViewDropDowns.showContractTime=true;
      this.sideViewDropDowns.showYearDD=true;
      this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);



      this.sideViewDropDowns.compHeading=appheading.garph4;
      let caseTimeData = [{ 'item_id': 1, 'item_text': 'Median' },
      { 'item_id': 2, 'item_text': 'Average' }];
      //let caseTimeData = ['Median' , 'Average' ];
      this.sideViewDropDowns.contractTimeData = caseTimeData;
      this.sideViewDropDowns.arrivalTypeData = ['SAOF', 'CPQ', 'Q2SC'];

  }
     
}
