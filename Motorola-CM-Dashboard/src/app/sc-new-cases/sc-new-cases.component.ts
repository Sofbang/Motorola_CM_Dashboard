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


@Component({
  selector: 'app-sc-new-cases',
  templateUrl: './sc-new-cases.component.html',
  styleUrls: ['./sc-new-cases.component.css']
})
export class ScNewCasesComponent implements OnInit {
  public columnChart: any;
  public drillDownData:any;
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
  public jancount17=0;
  public febcount17=0;
  public marcount17=0;
  public aprcount17=0;
  public maycount17=0;
  public juncount17=0;
  public julcount17=0;
  public augcount17=0;
  public sepcount17=0;
  public octcount17=0;
  public novcount17=0;
  public deccount17=0;
  public jancount18=0;
  public febcount18=0;
  public marcount18=0;
  public aprcount18=0;
  public maycount18=0;
  public juncount18=0;
  public julcount18=0;
  public augcount18=0;
  public sepcount18=0;
  public octcount18=0;
  public novcount18=0;
  public deccount18=0;
  public arrr=[];
  public firstDay:any;
  public lastDay:any;
  public  status:any;


  @ViewChild('openSCModal') openScModel: ElementRef;


  constructor(private _smartclientService: SmartclientService, private _dataHandlerService:DataHandlerService,private _excelService:ExcelServiceService) {
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

    // let drillDownStatusnew =[];
    // drillDownStatusnew = (event.selectedRowValues[0]);
    // status = drillDownStatusnew[0];
    console.log("the drilldown data is:"+JSON.stringify(event));
    // console.log("in the selectBar" + JSON.stringify(event.selectedRowValues[0]));
    if(event.message=='select'){

    this.newModelCounts = event.selectedRowValues[1];
    this.data = event.selectedRowValues[0];
    console.log("the data is:"+JSON.stringify(this.data));
    this.status = this.fdld(this.data);
    console.log("the ld is:"+JSON.stringify(this.status));
    $('.modal .modal-dialog').css('width', $(window).width() * 0.95);//fixed
    $('.modal .modal-body').css('height', $(window).height() * 0.77);//fixed
    $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.69);
    $('tbody.SCModlTbody').css('overflow-y', 'scroll');
    $('tbody.SCModlTbody').css('overflow-x', 'hidden');
    $('tbody.SCModlTbody').css('width', '100%');
    // status = this.fdld(status);
    // console.log("the fd ld is :"+JSON.stringify(status[0])+"the ld is :"+JSON.stringify(status[1]));
    this.getSCDrillDownData(moment(status[0]).format('YYYY-MM-DD'),moment(status[1]).format('YYYY-MM-DD'))

    .then((res:any) => {
      var dat = new Date();

     
      for(let i in res){
         
        res[i].case_creation_date=moment(res[i].case_creation_date).format('YYYY-MM-DD');
        res[i].sts_changed_on=moment(res[i].sts_changed_on).format('YYYY-MM-DD');

      }
      //console.log("the drilldowndata for ebs contracts by status is:"+JSON.stringify(this.drillDown));
      this.drillDownData = res;

    }, error => {
      console.log("error getTerritories " + error);
    });
    this.drillDown=[];

    }
  }

  public exportToExcel() {
    this._excelService.exportAsExcelFile(this.drillDownData, 'Smart Client New Cases');
  }
  

  public fdld(data){
    var v = data.split(' ');
    let arr=[];
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

  public ready(event: ChartReadyEvent) {
   

  }

  public getSCDrillDownData(first,last){
    return new Promise((resolve, reject) => {
      let jsonObj= {'first':this.status[0],'last':this.status[1]};
      this._smartclientService.getScDrillDownDates(jsonObj).subscribe(data => {
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
    this.jancount17=0;
    this.febcount17=0;
    this.marcount17=0;
    this.aprcount17=0;
    this.maycount17=0;
    this.juncount17=0;
    this.julcount17=0;
    this.augcount17=0;
    this.sepcount17=0;
    this.octcount17=0;
    this.novcount17=0;
    this.deccount17=0;
    console.log("the data is:"+JSON.stringify(data));
    console.log("the array is:"+JSON.stringify(this.arrr))
       for(let j in data){
        console.log("1")
        if(moment(data[j].case_creation_date).format('MMM-YY')=='Jan-17'){
          // console.log("2")
          
          this.jancount17=this.jancount17+1;
        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Feb-17'){
          // console.log("3")
          
          this.febcount17=this.febcount17+1;
        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Mar-17'){
          // console.log("4")
         
          this.marcount17=this.marcount17+1;
        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Apr-17'){
          // console.log("5")
      
          this.aprcount17=this.aprcount17+1;
        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='May-17'){
          // console.log("6")
        
          this.maycount17=this.maycount17+1;
        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Jun-17'){
          // console.log("7")
         
          this.juncount17=this.juncount17+1;
        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Jul-17'){
          // console.log("8")
          
          this.julcount17=this.julcount17+1;
        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Aug-17'){
          // console.log("9")
          
          this.augcount17=this.augcount17+1;
        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Sep-17'){
          // console.log("10")
          
          this.sepcount17=this.sepcount17+1;
        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Oct-17'){
          // console.log("11")
          
          this.octcount17=this.octcount17+1;
        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Nov-17'){
          // console.log("12")
          
          this.novcount17=this.novcount17+1;
        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Dec-17'){
          // console.log("13");
          
          this.deccount17=this.deccount17+1;
        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Jan-18'){
          this.jancount18=this.jancount18+1;

        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Feb-18'){
          this.febcount18=this.febcount18+1;

        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Mar-18'){
          this.marcount18=this.marcount18+1;

        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Apr-18'){
          this.aprcount18=this.aprcount18+1;

        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='May-18'){
          this.maycount18=this.maycount18+1;

        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Jun-18'){
          this.juncount18=this.juncount18+1;

        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Jul-18'){
          this.julcount18=this.julcount18+1;

        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Aug-18'){
          this.augcount18=this.augcount18+1;

        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Sep-18'){
          this.sepcount18=this.sepcount18+1;

        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Oct-18'){
          this.octcount18=this.octcount18+1;

        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Nov-18'){
          this.novcount18=this.novcount18+1;

        }else if(moment(data[j].case_creation_date).format('MMM-YY')=='Dec-18'){
          this.deccount18=this.deccount18+1;

        }else{

        }
    }
    console.log(this.jancount17,this.febcount17,this.marcount17,this.aprcount17,this.maycount17,this.juncount17,this.julcount17,this.augcount17,this.sepcount17,this.octcount17,this.novcount17,this.deccount17,this.jancount18,this.febcount18,this.marcount18,this.aprcount18,this.maycount18,this.juncount18,this.julcount18,this.augcount18,this.sepcount18,this.octcount18,this.novcount18,this.deccount18);
    this.arrr.push(this.jancount17,this.febcount17,this.marcount17,this.aprcount17,this.maycount17,this.juncount17,this.julcount17,this.augcount17,this.sepcount17,this.octcount17,this.novcount17,this.deccount17,this.jancount18,this.febcount18,this.marcount18,this.aprcount18,this.maycount18,this.juncount18,this.julcount18,this.augcount18,this.sepcount18,this.octcount18,this.novcount18,this.deccount18);
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
          array =[['Months','Cases Counts'],['Jan 17',0],['Feb 17',0],['Mar 17',0],['Apr 17',0],['May 17',0],['Jun 17',0],['Jul 17',0],['Aug 17',0],['Sep 17',0],['Oct 17',0],['Nov 17',0],['Dec 17',0],['Jan 18',0],['Feb 18',0],['Mar 18',0],['Apr 18',0],['May 18',0],['Jun 18',0],['Jul 18',0],['Aug 18',0],['Sep 18',0],['Oct 18',0],['Nov 18',0],['Dec 18',0]];
          this.drawChart(array);
          
        }else {
          console.log("the else if of check for length");
          array=[['Months','Cases Counts'],['Jan 17',data[0]],['Feb 17',data[1]],['Mar 17',data[2]],['Apr 17',data[3]],['May 17',data[4]],['Jun 17',data[5]],['Jul 17',data[6]],['Aug 17',data[7]],['Sep 17',data[8]],['Oct 17',data[9]],['Nov 17',data[10]],['Dec 17',data[11]],['Jan 18',data[12]],['Feb 18',data[13]],['Mar 18',data[14]],['Apr 18',data[15]],['May 18',data[16]],['Jun 18',data[17]],['Jul 18',data[18]],['Aug 18',data[19]],['Sep 18',data[20]],['Oct 18',data[21]],['Nov 18',data[22]],['Dec 18',data[23]]];
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
        bar: {groupWidth: "75%"},
        legend: { position: 'bottom',alignment:'center', textStyle: { color: '#444444' } },
        backgroundColor: '#FFFFFF',
        hAxis: {
          textStyle: { color: '#444444' },
          slantedText: true,  
          slantedTextAngle: 90 
        },
        vAxis: {
          textStyle: { color: '#444444' },
          title:'Number Of New Cases/Renewals',
          titleTextStyle:{italic: false}
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
        res=[['Months','Cases Counts'],['Jan 2017',this.arrr[0]],['Feb 2017',this.arrr[1]],['Mar 2017',this.arrr[2]],['Apr 2017',this.arrr[3]],['May 2017',this.arrr[4]],['Jun 2017',this.arrr[5]],['Jul 2017',this.arrr[6]],['Aug 2017',this.arrr[7]],['Sep 2017',this.arrr[8]],['Oct 2017',this.arrr[9]],['Nov 2017',this.arrr[10]],['Dec 2017',this.arrr[11]],['Jan 2018',this.arrr[12]],['Feb 2018',this.arrr[13]],['Mar 2018',this.arrr[14]],['Apr 2018',this.arrr[15]],['May 2018',this.arrr[16]],['Jun 2018',this.arrr[17]],['Jul 2018',this.arrr[18]],['Aug 2018',this.arrr[19]],['Sep 2018',this.arrr[20]],['Oct 2018',this.arrr[21]],['Nov 2018',this.arrr[22]],['Dec 2018',this.arrr[23]]];
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
