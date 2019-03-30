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
  contractTimeModel: any;
  screenHeight: any;
  screenWidth: any;
  fromModel: any;
  toModel: any;
  casetimeModel: any;
  constructor(private _dataHandlerService: DataHandlerService) {
    //calls from every component
    this._dataHandlerService.sideViewDropDownData
      .subscribe(res => {
        this.sideViewDDObj = new SideViewDropDowns();
        this.sideViewDDObj = res;
        this.resetDropDowns();
      });
    //calls from component where data reset is needed
    this._dataHandlerService.resetDropdowns
      .subscribe(result => {
        this.resetDropDowns();
      })
    this.getScreenSize();
    //calls from component getting min max limit of dates
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

  /**
   * On select event fires from html ng multiselect dropdown
   * @param item -current selected value
   * @param dropDownName -String name of dropdown which is selected
   */
  onItemSelect(item, dropDownName) {
    let jsonObj = { 'event': 'onItemSelect', 'from': dropDownName, 'data': item }
    this._dataHandlerService.setDataFromSideView(jsonObj);
  }

  /**
    * On select event fires from html ng multiselect dropdown
    * @param item -current selected value
    * @param dropDownName -String name of dropdown which is selected
    */
  onItemDeSelect(items, dropDownName) {
    let jsonObj = { 'event': 'onItemDeSelect', 'from': dropDownName, 'data': items }
    this._dataHandlerService.setDataFromSideView(jsonObj);
  }
  /**
     * On select event fires from html ng multiselect dropdown
     * @param item -current selected value
     * @param dropDownName -String name of dropdown which is selected
     */
  onSelectAll(items, dropDownName) {
    let jsonObj = { 'event': 'onSelectAll', 'from': dropDownName, 'data': items }
    this._dataHandlerService.setDataFromSideView(jsonObj);

  }
  /**
     * On select event fires from html ng multiselect dropdown
     * @param item -current selected value
     * @param dropDownName -String name of dropdown which is selected
     */
  onDeSelectAll(items, dropDownName) {
    let jsonObj = { 'event': 'onDeSelectAll', 'from': dropDownName, 'data': items }
    this._dataHandlerService.setDataFromSideView(jsonObj);
  }

  /**
   * reset all dropdowns to default 
   */
  resetDropDowns() {
    this.workflowModel = [];
    this.caseTypeModel = [];
    this.contractTypeModel = [];
    this.territoryModel = [];
    this.arrivalTypeModel = [];
    this.fromModel = null;
    this.toModel = null;
    this.casetimeModel = 'Median';
    this.contractTimeModel = 'Median';
  }

  /**
   * Make dates data for from and to dropdowns
   * @param data-min max dates 
   */
  public makeDate(data) {
    let startDate = data[0].min_date_cases;
    let endDate = data[0].max_date_cases;
    let starting = new Date(startDate);
    let ending = new Date(endDate);
    let dates = [];
    for (let i = starting.getFullYear(); i < ending.getFullYear() + 1; i++) {
      for (let j = 1; j <= 12; j++) {
        if (i === ending.getFullYear() && j === ending.getMonth() + 3) {
          break;
        }
        else if (i === 2012 && j < 4) {
          continue;
        }
        else if (j < 10) {
          let dateString = [i, '-', '0' + j, '-', '01'].join('');
          dates.push(dateString)
        }
        else {
          let dateString = [i, '-', j, '-', '01'].join('');
          dates.push(dateString);
        }
      }
    }
    this.makeDateFormat(dates);
  }

  /**
   * make from dates dropdown values in format JAN 2019
   * @param arr-array of dates  YYYY-mm-dd
   */
  public makeDateFormat(arr) {
    let dateArr = this.sortDate(arr)
    // for (let i = dateArr.length - 1; i > 0; i--) {
    //   // console.log("in the for loop", +i)
    //   let event = new Date(dateArr[i]);
    //   let options = { year: 'numeric', month: 'short' };
    //   this.fromDates.push(event.toLocaleString('en', options));
    // }
    this.fromDates = [];
    for (let i = 0; i < dateArr.length; i++) {
      // console.log("in the for loop", +i)
      let event = new Date(dateArr[i]);
      let options = { year: 'numeric', month: 'short' };
      this.fromDates.push(event.toLocaleString('en', options));
    }
  }

  /**
   * Sort the dates in ascending order
   * @param monthYear- date in YYYY-mm-dd
   */
  public sortDate(monthYear) {
    var sorted = monthYear.sort((a, b) => {
      return a - b;
    });
    return sorted;
  }
  /**
   * Fires when on select in from dd
   * @param filterVal-date value selected 
   */
  public onChangeFrom(filterVal: any) {
    this.toModel = null;
    let options = { year: 'numeric', month: 'short' };
    let date = new Date();;
    let dt = date.toLocaleString('en', options);
    console.log("dt"+dt);
    this.selectedYear = moment(filterVal).format('YY');
    this.toYear = [];
    this.selectedFrom = filterVal;
    this.n = this.fromDates.indexOf(this.selectedFrom);
    // console.log("the index is :" + this.n);
    for (let i = this.n; i <= this.n + 23; i++) {
      //if(this.fromDates[i]==dt)break;
      //console.log("jjj"+this.fromDates[i]);
      //console.log("loop"+this.fromDates[i]);
      if (this.fromDates[i] != undefined) {
        //if (this.fromDates[i] == dt) break;
        this.toYear.push(this.fromDates[i]);
      }

    }
  }

  /**
    * Fires when on select in to dd
    * @param filterVal-date value selected 
    */
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
    // this.dropdownSettingsCaseTime = {
    //   singleSelection: false,
    //   idField: 'item_id',
    //   textField: 'item_text',
    //   text: 'Median',
    //   selectAllText: 'All',
    //   unSelectAllText: 'Clear All',
    //   itemsShowLimit: 1,
    //   allowSearchFilter: true,
    //   dir: 'asc'
    // };

  }
}
