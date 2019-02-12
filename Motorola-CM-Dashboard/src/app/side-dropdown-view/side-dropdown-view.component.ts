import { Component, OnInit } from '@angular/core';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
@Component({
  selector: 'app-side-dropdown-view',
  templateUrl: './side-dropdown-view.component.html',
  styleUrls: ['./side-dropdown-view.component.css']
})
export class SideDropdownViewComponent implements OnInit {
  public sideViewDDObj = new SideViewDropDowns();
  public dropdownSettings = {};
  constructor(private _dataHandlerService: DataHandlerService) {
    this._dataHandlerService.sideViewDropDownData
      .subscribe(res => {

        this.sideViewDDObj = res;
        console.log("subscribe inside sideview" + JSON.stringify(this.sideViewDDObj));
      });
  }



  // ng multiselect events implemented by Vishal Sehgal 12/2/2019
  onItemSelect(item: any) {
    let jsonObj = { 'from': 'onItemSelect', 'data': item }
    this._dataHandlerService.setDataFromSideView(jsonObj);
  }

  onItemDeSelect(items: any) {
    let jsonObj = { 'from': 'onItemDeSelect', 'data': items }
    this._dataHandlerService.setDataFromSideView(jsonObj);
  }

  onSelectAll(items: any) {
    let jsonObj = { 'from': 'onSelectAll', 'data': items }
    this._dataHandlerService.setDataFromSideView(jsonObj);

  }
  onDeSelectAll(items: any) {
    let jsonObj = { 'from': 'onDeSelectAll', 'data': items }
    this._dataHandlerService.setDataFromSideView(jsonObj);
  }
  ngOnInit() {
    //dropdown settings
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 6,
      allowSearchFilter: true,
      dir: 'asc'
    };
  }

}
