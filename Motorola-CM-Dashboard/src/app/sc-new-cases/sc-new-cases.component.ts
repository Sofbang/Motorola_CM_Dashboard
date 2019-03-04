import { Component, OnInit } from '@angular/core';
import { SmartclientService } from '../services/lookup/smartclient.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import { ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import { ChartSelectEvent } from 'ng2-google-charts';
import { appheading } from '../enums/enum';
import { ChartErrorEvent } from 'ng2-google-charts';


@Component({
  selector: 'app-sc-new-cases',
  templateUrl: './sc-new-cases.component.html',
  styleUrls: ['./sc-new-cases.component.css']
})
export class ScNewCasesComponent implements OnInit {
  public columnChart: any;
  public newModelCounts:any;
  public data:any;
  public res=[['Month','Number_Of_New_Cases '],['',0],['',0],['',0],['',0],['',0],['',0]];
  public sideViewDropDowns = new SideViewDropDowns();
  @ViewChild('openSCModal') openScModel: ElementRef;


  constructor(private _smartclientService: SmartclientService, private _dataHandlerService:DataHandlerService) {
    // this._dataHandlerService.dataFromSideView
    //   .subscribe(res => {
    //     //console.log("sub ebs" + JSON.stringify(res));
    //     let incomingData = res.data, event = res.event.toLowerCase(), from = res.from;
    //     if (event == 'onitemselect') {
    //       this.onItemSelect(incomingData, from)
    //     } else if (event == 'onitemdeselect') {
    //       this.onItemDeSelect(incomingData, from)
    //     } else if (event == 'onselectall') {
    //       this.onSelectAll(incomingData, from);
    //     }
    //     else if (event == 'ondeselectall') {
    //       this.onDeSelectAll(incomingData, from);
    //     }
    //   });
      this._dataHandlerService.setDataForMainLayout(true);

   }

   public selectBar(event: ChartSelectEvent) {
    console.log("in the selectBar" + JSON.stringify(event.selectedRowValues[0]));
    this.newModelCounts = event.selectedRowValues[1];
    this.data = event.selectedRowValues[0];
    console.log("the data is:", this.data);
    this.openScModel.nativeElement.click();
    $('.modal .modal-dialog').css('width', $(window).width() * 0.95);//fixed
    $('.modal .modal-body').css('height', $(window).height() * 0.77);//fixed
    $('tbody.SCModlTbody').css('max-height', $(window).height() * 0.69);
    $('tbody.SCModlTbody').css('overflow-y', 'scroll');
    $('tbody.SCModlTbody').css('overflow-x', 'hidden');
    // $('tbody.SCModlTbody').css('display', 'block');
    $('tbody.SCModlTbody').css('width', '100%');

  }

  // public checkZero(event: ChartErrorEvent) {
   
    // your logic
    // console.log("the event is:"+JSON.stringify(event.message='hi i am here'));
    // var re = this.res.filter(items => {
    //   return items.Number_Of_New_Cases >=0 
    // })
  // }


  public NSSAging(){
   let arr = [2,3]
   alert("the array is:[2,3]");
   let calc = arr[1]-arr[0];
   console.log("the diff is :"+JSON.stringify(calc));
   alert("the calculated NSS Aging is:"+calc);
  }

  public checkZeroVals(){
    // if (emptyData.getNumberOfRows() === 0) {
    //   emptyData.addRows([
    //     ['', 0, null, 'No Data Copy']
    //   ]);
    // }
    console.log("iniside the check method:")
    if(this.columnChart.dataTable){
      console.log("in the if of checkMethod:")
      this.res.push(['', 0, null, 'No Data Copy']);
      console.log("the res is:"+JSON.stringify(this.res))
    }

  }
   

  ngOnInit() {
    this.columnChart = {
      chartType: 'ColumnChart',
      dataTable: this.res,
      
      options: {
        title: '',
        titleTextStyle: {
          color: '#FFFFFF',    // any HTML string color ('red', '#cc00cc')
          fontName: 'Verdana', // i.e. 'Times New Roman'
          fontSize: 18, // 12, 18 whatever you want (don't specify px)
          bold: true,    // true or false
          italic: false
        },
        annotations: {
          stem: {
            color: 'transparent',
            length: 120
          }
        },
        width: 1200, height: 500,
        chartArea:{left:100,top:30,width:'50%'},
        legend: { position: 'bottom',alignment:'center', textStyle: { color: '#444444' } },
        backgroundColor: '#FFFFFF',
        hAxis: {
          textStyle: { color: '#444444' }
        },
        vAxis: {
          textStyle: { color: '#444444' }
        },
        series: {
          0: { color: '0B91E2' },
          1: { color: '#FFFFFF' }
        },
        tooltip: { isHtml: false }
      }
    };
    this.sideViewDropDowns.showTerritory = true;
    this.sideViewDropDowns.showArrivalType=true;
    this.sideViewDropDowns.showYearDD=true;
    this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);
    console.log("the res array is:"+JSON.stringify(this.res));
    this.sideViewDropDowns.compHeading=appheading.graph3;
    this.checkZeroVals();


  }

}
