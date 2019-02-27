import { Component, OnInit } from '@angular/core';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import * as $ from 'jquery';
import * as moment from 'moment';
import { HostListener } from "@angular/core";
@Component({
  selector: 'app-side-dropdown-view',
  templateUrl: './side-dropdown-view.component.html',
  styleUrls: ['./side-dropdown-view.component.css']
})
export class SideDropdownViewComponent implements OnInit {
  public sideViewDDObj = new SideViewDropDowns();
  public dropdownSettings = {};
  public selectedFrom: any;
  public fianldates = [];
  public toYear = [];
  public n: number;
  screenHeight: any;
  screenWidth: any;
  constructor(private _dataHandlerService: DataHandlerService) {
    this._dataHandlerService.sideViewDropDownData
      .subscribe(res => {
        this.sideViewDDObj = res;
        //console.log("subscribe inside sideview" + JSON.stringify(this.sideViewDDObj));
      });
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    $('.side-view-dropDowns').css('height', this.screenHeight);//to make side dropdown view to screen height
  }
  onItemSelect(item, dropDownName) {
    let jsonObj = { 'event': 'onItemSelect', 'from': dropDownName, 'data': item }
    this._dataHandlerService.setDataFromSideView(jsonObj);
  }

  onItemDeSelect(items, dropDownName) {
    let jsonObj = { 'event': 'onItemDeSelect', 'from': dropDownName, 'data': items }
    this._dataHandlerService.setDataFromSideView(jsonObj);
  }

  onSelectAll(items, dropDownName) {
    let jsonObj = { 'event': 'onSelectAll', 'from': dropDownName, 'data': items }
    this._dataHandlerService.setDataFromSideView(jsonObj);

  }
  onDeSelectAll(items, dropDownName) {
    let jsonObj = { 'event': 'onDeSelectAll', 'from': dropDownName, 'data': items }
    this._dataHandlerService.setDataFromSideView(jsonObj);
  }

  public makeDate() {

    var startDate = '2017-01-01';
    var endDate = '2018-12-01';
    var starting = new Date(startDate);
    var ending = new Date(endDate);
    var dates = [];
    for (var i = starting.getFullYear(); i < ending.getFullYear() + 1; i++) {
      // console.log("the getFullYear is:" + JSON.stringify(starting.getFullYear()) + "the ith index is" + JSON.stringify(i));
      for (var j = 1; j <= 12; j++) {
        // console.log("inside the jth loop:" + j)
        if (i === ending.getFullYear() && j === ending.getMonth() + 3) {
          // console.log("inside the first if" + JSON.stringify(ending.getFullYear()))
          break;
        }
        else if (i === 2012 && j < 4) {
          // console.log("the else if firt time part :")
          continue;
        }
        else if (j < 10) {
          // console.log("the else if second time is:")
          var dateString = [i, '-', '0' + j, '-', '01'].join('');
          dates.push(dateString)
        }
        else {
          // console.log("the else part is:")
          var dateString = [i, '-', j, '-', '01'].join('');
          dates.push(dateString);
        }
      }
    }
    this.makeDateFormat(dates);
    // console.log(dates);
    // return dates;

  }

  public makeDateFormat(arr) {

    // console.log("inside the makeDateFormat Method:" + JSON.stringify(arr));
    for (let i in arr) {
      // console.log("in the for loop", +i)
      var event = new Date(arr[i]);
      // console.log("the event var data is :" + event);
      var options = { year: 'numeric', month: 'short' };
      this.fianldates.push(event.toLocaleString('en', options));
      // console.log("the dates are as under:" + this.fianldates);


    }
    // console.log("the final one is :" + JSON.stringify(this.fianldates));


  }

  public onChangeFrom(filterVal: any) {
    this.toYear = [];

    // console.log("the value for newval is:" + JSON.stringify(filterVal));
    this.selectedFrom = filterVal;
    // console.log("the selectedFrom Value is:" + JSON.stringify(this.selectedFrom));

    this.n = this.fianldates.indexOf(this.selectedFrom);
    // console.log("the index is :" + this.n);
    for (let i = this.n + 1; i <= this.n + 11; i++) {
      // console.log("inside the for loop :")
      this.toYear.push(this.fianldates[i]);
      //  console.log("after the push is done"+JSON.stringify(this.toYear));
      //  this.toYear=[];


    }
    //  console.log("the final to year is:"+JSON.stringify(this.toYear));






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

  // public getDateFilteredResults(startDate, endDate){
  //   return new Promise((resolve,reject) => {
  //     let dateFilteredData;
  //     this._smartclientService.getScDateFilteredReults()
  //     .subscribe(data => {
  //       dateFilteredData = this.makeChartData(data);
  //       this.dateFilteredDataResults = data;
  //     }, err => console.error(err),
  //     () => {
  //       resolve(this.makeChartArr(dateFilteredData));

  //     }
  //    )
  //   }).catch((error) => {
  //     console.log('error in getting data:',error);
  //     reject(error);
  //   })
  // }


  ngOnInit() {
    //dropdown settings
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'All',
      unSelectAllText: 'Clear All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      dir: 'asc'
    };

    this.makeDate();

    //$('.side-view-dropDowns').css('height', this.screenHeight);//to make side dropdown view to screen height
  }


}
