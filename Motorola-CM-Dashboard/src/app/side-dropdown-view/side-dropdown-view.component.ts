import { Component, OnInit } from '@angular/core';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
import * as $ from 'jquery';
import * as moment from 'moment';
import { HostListener } from "@angular/core";
import { NgForm } from '@angular/forms';
import { ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'app-side-dropdown-view',
  templateUrl: './side-dropdown-view.component.html',
  styleUrls: ['./side-dropdown-view.component.css']
})
export class SideDropdownViewComponent implements OnInit {
  public sideViewDDObj = new SideViewDropDowns();
  public dropdownSettings = {};
  public selectedFrom: any;
  public fromDates = [];
  public toYear = [];
  public selectedYear: any;

  public selectedItemsCaseTime = [
    { 'item_id': 1, 'item_text': 'Median' },
  ];
  @ViewChild('ngFormDate') ngFormDate: NgForm;
  public n: number;
  public dropdownSettingsCaseTime = {};
  workflowModel: any;
  caseTypeModel: any;
  contractTypeModel: any;
  territoryModel: any;
  arrivalTypeModel: any;
  contractTimemodel: any;
  screenHeight: any;
  screenWidth: any;
  fromModel: any;
  toModel: any;
  casetimeModel: any;
  constructor(private _dataHandlerService: DataHandlerService) {
    this._dataHandlerService.sideViewDropDownData
      .subscribe(res => {
        this.sideViewDDObj = new SideViewDropDowns();
        this.sideViewDDObj = res;
        this.casetimeModel = 'Median';
        this.resetDropDowns();
        // console.log("subscribe inside sideview" + JSON.stringify(this.sideViewDDObj));
        // this.ngFormDate.reset();
      });
    this._dataHandlerService.resetDropdowns
      .subscribe(result => {
        this.resetDropDowns();
      })
    this.getScreenSize();
    this._dataHandlerService.SCMinMaxDates
      .subscribe(res => {
        this.makeDate(res);
      });

  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    $('.side-view-dropDowns').css('height', this.screenHeight);//to make side dropdown view to screen height
    $('.slimScrollDiv').removeAttr('style');//remove slimscroll from side menus on screen size change
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

  resetDropDowns() {
    this.workflowModel = [];
    this.caseTypeModel = [];
    this.contractTypeModel = [];
    this.territoryModel = [];
    this.arrivalTypeModel = [];
    this.contractTimemodel = [];
    this.fromModel = null;
    this.toModel = null;
  }


  public makeDate(data) {
    //console.log("the res is:"+JSON.stringify(data));
    let startDate = data[0].min_date_cases;
    let endDate = data[0].max_date_cases;
    let starting = new Date(startDate);
    let ending = new Date(endDate);
    let dates = [];
    for (let i = starting.getFullYear(); i < ending.getFullYear() + 1; i++) {
      // console.log("the getFullYear is:" + JSON.stringify(starting.getFullYear()) + "the ith index is" + JSON.stringify(i));
      for (let j = 1; j <= 12; j++) {
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
          let dateString = [i, '-', '0' + j, '-', '01'].join('');
          dates.push(dateString)
        }
        else {
          // console.log("the else part is:")
          let dateString = [i, '-', j, '-', '01'].join('');
          dates.push(dateString);
        }
      }
    }
    this.makeDateFormat(dates);
    // console.log(dates);
    // return dates;

  }

  public makeDateFormat(arr) {
    let dateArr = this.sortDate(arr)
    for (let i = dateArr.length - 1; i > 0; i--) {
      // console.log("in the for loop", +i)
      let event = new Date(dateArr[i]);
      let options = { year: 'numeric', month: 'short' };
      this.fromDates.push(event.toLocaleString('en', options));
    }
    console.log("lll"+JSON.stringify(this.fromDates));
  }
  
   public sortDate(monthYear) {
    var sorted = monthYear.sort((a, b) => {
      return a - b;
    });
    return sorted;
  }
public onChangeFrom(filterVal: any) {
    let options = { year: 'numeric', month: 'short' };
    let date=new Date();;
    let dt=date.toLocaleString('en', options);
    console.log("fff"+dt);
    this.selectedYear = moment(filterVal).format('YY');
    console.log("the year :" + JSON.stringify(this.selectedYear));
    this.toYear = [];
    this.selectedFrom = filterVal;
    this.n = this.fromDates.indexOf(this.selectedFrom);
    // console.log("the index is :" + this.n);
    for (let i = this.n; i <= this.n + 23; i++) {
      //if(this.fromDates[i]==dt)break;
      this.toYear.push(this.fromDates[i]);
    }
  }


  public onChangeTo(filterVal: any) {
    // console.log("hey hi "+filterVal);
    // console.log("the values is "+this.selectedFrom);
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
    // this.fromDates=[];
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
    this.dropdownSettingsCaseTime={
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      text:'Median',
      selectAllText: 'All',
      unSelectAllText: 'Clear All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      dir: 'asc'
     };
     
  }
}
