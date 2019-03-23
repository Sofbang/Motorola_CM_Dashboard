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
// import {moment} from 'moment';


@Component({
  selector: 'app-sc-new-cases',
  templateUrl: './sc-new-cases.component.html',
  styleUrls: ['./sc-new-cases.component.css']
})
export class ScNewCasesComponent implements OnInit {
  public columnChart: any;
  public casesData: any = [];
  public selectedFrom: any;
  public drillDown:any;
  public territoriesArr: any = [];
  public datesData=[];
  public newModelCounts:any;
  public newCasesData: any = [];
  public casesSrvcData=[];
  public data:any;
  public res;
  public checkDataSCNC: Boolean = false;
  public sideViewDropDowns = new SideViewDropDowns();
  public jancount=0;
  public febcount=0;
  public marcount=0;
  public aprcount=0;
  public maycount=0;
  public juncount=0;
  public julcount=0;
  public augcount=0;
  public sepcount=0;
  public octcount=0;
  public novcount=0;
  public deccount=0;
  public arrr=[];
  public firstDay:any;
  public lastDay:any;

  @ViewChild('openSCModal') openScModel: ElementRef;


  constructor(private _smartclientService: SmartclientService, private _dataHandlerService:DataHandlerService) {
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
        }else if (event == 'onchangeto') {
          this.onToYearChange(incomingData);
        }
      });
      this._dataHandlerService.setDataForMainLayout(true);

   }

   public selectBar(event: ChartSelectEvent) {
    this.openScModel.nativeElement.click();

    let drillDownStatusnew =[];let status:any;
    drillDownStatusnew = (event.selectedRowValues[0]).split(' ');
    status = drillDownStatusnew[0];
    console.log("the drilldown status is:"+JSON.stringify(status));
    // console.log("in the selectBar" + JSON.stringify(event.selectedRowValues[0]));
    if(event.message=='select'){

    this.newModelCounts = event.selectedRowValues[1];
    this.data = event.selectedRowValues[0];
    $('.modal .modal-dialog').css('width', $(window).width() * 0.95);//fixed
    $('.modal .modal-body').css('height', $(window).height() * 0.77);//fixed
    $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.69);
    $('tbody.SCModlTbody').css('overflow-y', 'scroll');
    $('tbody.SCModlTbody').css('overflow-x', 'hidden');
    $('tbody.SCModlTbody').css('width', '100%');

    this.getSCDrillDownData(status)
    .then((res:any) => {
      //console.log("the drilldowndata for ebs contracts by status is:"+JSON.stringify(res.length));
      // for(let i in res){
         
      //    this.drillDown.push({'NSS_Aging': moment(res[i].contract_creation_date).format('YYY-MM-DD')});

      // }
      console.log("the drilldowndata for ebs contracts by status is:"+JSON.stringify(this.drillDown));

    }, error => {
      console.log("error getTerritories " + error);
    });
    this.drillDown=[];

    }
  }

  public ready(event: ChartReadyEvent) {
   

  }

  public getSCDrillDownData(status){
    return new Promise((resolve, reject) => {
      this._smartclientService.getScDrillDown(status).subscribe(data => {
        this.drillDown = data;
        // console.log("territories" + this.territories)
      }, err => console.error(err),
        // the third argument is a function which runs on completion
        () => {
          console.log("the drilldown data recived is:"+this.drillDown);
          resolve(this.drillDown);
        }
      )
    }).catch((error) => {
      reject(error);
      console.log('errorin getting data :', error);
    })

  }



  public getSCNewCases(){
    return new Promise((resolve, reject) => {
          this._smartclientService.getScNewCases().subscribe(data => {
            this.newCasesData = this.makeCount(data);  
            this.casesSrvcData=data;
       }, err => console.error(err),
            () => {
              resolve(this.newCasesData);
            }
          )
        }).catch((error) => {
          reject(error);
        })

  }

  public makeCount(data){
    this.arrr=[];
    this.jancount=0;
    this.febcount=0;
    this.marcount=0;
    this.aprcount=0;
    this.maycount=0;
    this.juncount=0;
    this.julcount=0;
    this.augcount=0;
    this.sepcount=0;
    this.octcount=0;
    this.novcount=0;
    this.deccount=0;
    console.log("the data is:"+JSON.stringify(data));
    console.log("the array is:"+JSON.stringify(this.arrr))
       for(let j in data){
        console.log("1")
        if(moment(data[j].case_creation_date).format('MMM')=='Jan'){
          // console.log("2")
          
          this.jancount=this.jancount+1;
        }else if(moment(data[j].case_creation_date).format('MMM')=='Feb'){
          // console.log("3")
          
          this.febcount=this.febcount+1;
        }else if(moment(data[j].case_creation_date).format('MMM')=='Mar'){
          // console.log("4")
         
          this.marcount=this.marcount+1;
        }else if(moment(data[j].case_creation_date).format('MMM')=='Apr'){
          // console.log("5")
      
          this.aprcount=this.aprcount+1;
        }else if(moment(data[j].case_creation_date).format('MMM')=='May'){
          // console.log("6")
        
          this.maycount=this.maycount+1;
        }else if(moment(data[j].case_creation_date).format('MMM')=='Jun'){
          // console.log("7")
         
          this.juncount=this.juncount+1;
        }else if(moment(data[j].case_creation_date).format('MMM')=='Jul'){
          // console.log("8")
          
          this.julcount=this.julcount+1;
        }else if(moment(data[j].case_creation_date).format('MMM')=='Aug'){
          // console.log("9")
          
          this.augcount=this.augcount+1;
        }else if(moment(data[j].case_creation_date).format('MMM')=='Sep'){
          // console.log("10")
          
          this.sepcount=this.sepcount+1;
        }else if(moment(data[j].case_creation_date).format('MMM')=='Oct'){
          // console.log("11")
          
          this.octcount=this.octcount+1;
        }else if(moment(data[j].case_creation_date).format('MMM')=='Nov'){
          // console.log("12")
          
          this.novcount=this.novcount+1;
        }else if(moment(data[j].case_creation_date).format('MMM')=='Dec'){
          // console.log("13");
          
          this.deccount=this.deccount+1;
        }else{
          // alert("there is no such condition successful");
        }
    }
    console.log(this.jancount,this.febcount,this.marcount,this.aprcount,this.maycount,this.juncount,this.julcount,this.augcount,this.sepcount,this.octcount,this.novcount,this.deccount);
    this.arrr.push(this.jancount,this.febcount,this.marcount,this.aprcount,this.maycount,this.juncount,this.julcount,this.augcount,this.sepcount,this.octcount,this.novcount,this.deccount);
    // console.log("the data to be returned is:"+JSON.stringify(this.arrr));
    // if(this.arrr.length==0 || this.arrr!==undefined){
    //   console.log("in the if of length of array checks");
    //    this.checkDataSCNC=true;
    // }else{
    //   console.log("in the else of length of array checks");
    // }
    return this.arrr;

    // this.arrr=[];
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
            array.push(otherTerritory);
            resolve(array);
          }
        )
    }).catch((error) => {
      // console.log('errorin getting data :', error);
      reject(error);

    })
  }


   /**
     * Array reduce function
     * @param accumulator-array item summed value
     * @param num -current array item
     */
    public sum(accumulator, num) {
      return accumulator + num;
    }

    public makeChartData(data){
      let array=[];
      // data=[];
      console.log("the data rec is :"+JSON.stringify(data.length));
      // let array =[['Months','Cases Counts'],['Jan',data[0]],['Feb',data[1]],['Mar',data[2]],['Apr',data[3]],['May',data[4]],['Jun',data[5]],['Jul',data[6]],['Aug',data[7]],['Sep',data[8]],['Oct',data[9]],['Nov',data[10]],['Dec',data[11]]];
      for(let i in data){

        if(data[i]==0){
          console.log("the if of check for length");
          this.checkDataSCNC=true;
          array =[['Months','Cases Counts'],['Jan',0],['Feb',0],['Mar',0],['Apr',0],['May',0],['Jun',0],['Jul',0],['Aug',0],['Sep',0],['Oct',0],['Nov',0],['Dec',0]];
          this.drawChart(array);
          
        }else {
          console.log("the else if of check for length");
          array=[['Months','Cases Counts'],['Jan',data[0]],['Feb',data[1]],['Mar',data[2]],['Apr',data[3]],['May',data[4]],['Jun',data[5]],['Jul',data[6]],['Aug',data[7]],['Sep',data[8]],['Oct',data[9]],['Nov',data[10]],['Dec',data[11]]];
          this.drawChart(array);
          this.checkDataSCNC= false;
  
        }
        

      }
      
      //this.drawChart(array);
    }


    public filterChartData() {
      let finalArr = [];
     if(this.territoriesArr.length > 0){
        if (this.datesData.length > 0) {
        var result = this.casesSrvcData.filter(items=>{
         return moment(items.case_creation_date).format('YYYY-MM-DD') >= this.firstDay &&   moment(items.case_creation_date).format('YYYY-MM-DD') <= this.lastDay;
        })
       
       for (let j in this.territoriesArr) {
          let workflowItem = this.territoriesArr[j]
        var terrfilter = result.filter(items => {
          // console.log("in the territories array filter")
          return items.territory==workflowItem
        })
        for (let i = 0; i < terrfilter.length; i++) {
          finalArr.push(terrfilter[i]);
        }
      }
        // console.log("the filtered results length is:"+JSON.stringify(finalArr.length));
        // console.log("the filtered results from territory filter is:"+JSON.stringify(finalArr));
        finalArr = this.makeCount(finalArr);
        // console.log("the resultant array to be bind to the graph length is:"+JSON.stringify(finalArr.length));
        // console.log("the resultant array to be bind to the graph is:"+JSON.stringify(finalArr));
        this.makeChartData(finalArr);

      
      }else {

        console.log("in multiple territory select:"+JSON.stringify(this.territoriesArr));
        // alert("in multiple territory select:"+JSON.stringify(this.territoriesArr.length));
         let finalArr=[];
         for (let j in this.territoriesArr) {
        let terr = this.territoriesArr[j];
        var terrfilter = this.casesSrvcData.filter(items => {
          // console.log("in the territories array filter")
          return items.territory==terr
        })
         console.log("the filtered results from territory length is:"+JSON.stringify(terrfilter.length));
           for (let i = 0; i < terrfilter.length; i++) {
          finalArr.push(terrfilter[i]);
        }
      }
        console.log("the filtered results length is:"+JSON.stringify(finalArr.length));
        // console.log("the filtered results from territory filter is:"+JSON.stringify(finalArr));
        finalArr = this.makeCount(finalArr);
        // console.log("the resultant array to be bind to the graph length is:"+JSON.stringify(finalArr.length));
        // console.log("the resultant array to be bind to the graph is:"+JSON.stringify(finalArr));
        this.makeChartData(finalArr);
    
      }

      
      
    }
    else{
         console.log("the check no.2 is:");
         if (this.datesData.length > 0) {
          var result = this.casesSrvcData.filter(items=>{
           return moment(items.case_creation_date).format('YYYY-MM-DD') >= this.firstDay &&   moment(items.case_creation_date).format('YYYY-MM-DD') <= this.lastDay;
          })
          // console.log("the result after dates are filtered are as under:"+JSON.stringify(result));
          // console.log("the length of filter are as under:"+JSON.stringify(result.length));
          result = this.makeCount(result);
          // console.log("the result returned is as under:"+JSON.stringify(result));
          // console.log("the result is as under:"+JSON.stringify(result.length));
          this.makeChartData(result);
        
      }else {
        for (let j in this.territoriesArr) {
          let workflowItem = this.territoriesArr[j];
        var terrfilter = this.casesSrvcData.filter(items => {
          // console.log("in the territories array filter")
          return items.territory==workflowItem
        })

        for (let i = 0; i < terrfilter.length; i++) {
          finalArr.push(terrfilter[i]);
        }
      }
        // console.log("the filtered results length is:"+JSON.stringify(finalArr.length));
        // console.log("the filtered results from territory filter is:"+JSON.stringify(finalArr));
        finalArr = this.makeCount(finalArr);
        // console.log("the resultant array to be bind to the graph length is:"+JSON.stringify(finalArr.length));
        // console.log("the resultant array to be bind to the graph is:"+JSON.stringify(finalArr));
        this.makeChartData(finalArr);
        
      
      }
    }
      
      
    }
  
    public onChangeTo(filterVal: any) {
      // console.log("hey hi "+filterVal);
      // console.log("the values is "+this.selectedFrom);
      var v = filterVal.split(' ');
      // console.log("the v is:"+v);
      var newone = v[0] + ' 1, '
      var newtwo = v[1];
      var newthree = newone + newtwo;
      // console.log("the three is :"+newthree);
      var newModDate = new Date(newthree);
      // console.log("",v.push(this.selectedFrom));
      var tb = this.selectedFrom.split(' ');
      var one = tb[0] + ' 1, ';
      var two = tb[1];
      var three = one + two;
      // console.log("the three is :"+three);
      var modDate = new Date(three);
      var FirstDay = new Date(modDate.getFullYear(), modDate.getMonth(), 1).toLocaleDateString();
      var LastDay = new Date(newModDate.getFullYear(), newModDate.getMonth() + 1, 0).toLocaleDateString();
  
  
      var fd = moment(FirstDay).format('YYYY-MM-DD');
      var ld = moment(LastDay).format('YYYY-MM-DD');
      // console.log("the first one is:"+fd);
      // console.log("the last is:"+ld);
      // console.log("the d is :",d)
      // console.log("the moment is:",temp);
  
      //console.log("the first day is:",FirstDay);
      //console.log("last :",LastDay);
      let jsonObj = { 'event': 'onChangeTo', 'from': 'yeardropdown', 'data': { 'firstDay': fd, 'lastDay': ld } }
      this._dataHandlerService.setDataFromSideView(jsonObj);
      //this.getDateFilteredResults(FirstDay,LastDay);
  
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
        chartArea:{left:100,top:30,width:'50%'},
        legend: { position: 'bottom',alignment:'center', textStyle: { color: '#444444' } },
        backgroundColor: '#FFFFFF',
        hAxis: {
          textStyle: { color: '#444444' },
         
        },
        vAxis: {
          textStyle: { color: '#444444' },
          title:'Number Of New Cases/Renewals',
          slantedText: true,  
          slantedTextAngle: 90 
        },
        series: {
          0: { color: '0B91E2' },
          1: { color: '#FFFFFF' }
        },
        tooltip: { isHtml: false }
      }
    };
  }

  // ng multiselect events implemented by Vishal Sehgal 12/2/2019
    onItemSelect(item, from) {
      if (from == 'territory') {
        this.territoriesArr.push(item);
        this.filterChartData();
      } 
      // else if (from == 'workflow') {
      //   this.workFlowStatusArr.push(item);
      //   this.filterChartData();
      // } 
      // this.filterChartData();
      // console.log("territory" + JSON.stringify(this.territoriesArr));
      // console.log("workflow" + JSON.stringify(this.workFlowStatusArr));
      // console.log("the added array is:"+JSON.stringify(this.territoriesArr));
      // this.drawChart(this.territoriesArr);

    }
  
    onItemDeSelect(item, from) {
      if (from == 'territory') {
        this.territoriesArr = this.removeElementArr(this.territoriesArr, item);
        this.filterChartData();
      }
      // else if (from == 'workflow') {
      //   this.workFlowStatusArr = this.removeElementArr(this.workFlowStatusArr, item);;
      // }
      // console.log("territory" + JSON.stringify(this.territoriesArr));
      // console.log("workflow" + JSON.stringify(this.workFlowStatusArr));
      console.log("the added array is:"+JSON.stringify(this.territoriesArr));
      // this.drawChart(this.territoriesArr);
    }
  
    onSelectAll(item, from) {
      if (from == 'territory') {
        this.territoriesArr = [];
        this.territoriesArr = item
        this.filterChartData();
      } 
      // else if (from == '') {
      //   this.workFlowStatusArr = [];
      //   this.workFlowStatusArr = item;
      // }
      // console.log("territory" + JSON.stringify(this.territoriesArr));
      // console.log("workflow" + JSON.stringify(this.workFlowStatusArr));
      // console.log("the added array is:"+JSON.stringify(this.territoriesArr));
      // this.drawChart(this.territoriesArr);
    }
  
    onToYearChange(item) {
      this.firstDay=item.firstDay;
      this.lastDay=item.lastDay;
      console.log("the item rec is:"+JSON.stringify(this.firstDay));
      console.log("the last one is:"+JSON.stringify(this.lastDay));
      this.datesData.push(item.firstDay);
      this.datesData.push(item.lastDay);
      this.filterChartData();
      // console.log("the added array is:"+JSON.stringify( this.datesData));
      
    }
  
    onDeSelectAll(item, from) {
      this.territoriesArr = [];
      // this.workFlowStatusArr = [];
      // console.log("onDeSelectAll" + JSON.stringify(item));
      this.filterChartData();
      // console.log("the added array is:"+JSON.stringify(this.territoriesArr));
      // this.drawChart(this.territoriesArr);
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
    this.getSCNewCases()
    .then((res:any) => {
      // console.log("the data returned by promise is :"+JSON.stringify(res));
      if (res.length == 0) {
        res = [['Months', 'No. Of Cases'], ['', ], ['', 0], ['', 0]];
        this.drawChart(res);
        this.checkDataSCNC = true;
     } else if (res.length > 0) {
        // alert("there is no data to bind to chart");
        res=[['Months','Cases Counts'],['Jan',this.arrr[0]],['Feb',this.arrr[1]],['Mar',this.arrr[2]],['Apr',this.arrr[3]],['May',this.arrr[4]],['Jun',this.arrr[5]],['Jul',this.arrr[6]],['Aug',this.arrr[7]],['Sep',this.arrr[8]],['Oct',this.arrr[9]],['Nov',this.arrr[10]],['Dec',this.arrr[11]]];
        this.drawChart(res);
        this.checkDataSCNC = false;
     } else {
        this.checkDataSCNC = true;
      }

    }, error => {
        // console.log("error getCaseData " + error);
    });


    this.getTerritories()
      .then((res: any) => {
        //this.drawChart(res);
        this.sideViewDropDowns.showTerritory = true;
        this.sideViewDropDowns.territoryData = res;
        this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
      }, error => {
        // console.log("error getTerritories " + error);
      });

    this.sideViewDropDowns.showTerritory = true;
    this.sideViewDropDowns.showArrivalType=true;
    this.sideViewDropDowns.showYearDD=true;
    this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
    this.sideViewDropDowns.compHeading=appheading.graph3;
    
   

  }

}
