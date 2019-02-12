import { Component, OnInit } from '@angular/core';
import { EbsService } from '../services/lookup/ebs.service';
import { reject } from 'q';
import { SideViewDropDowns } from '../beans/sideBarDropdown';
import { DataHandlerService } from '../services/data-handler/data-handler.service';
@Component({
  selector: 'app-ebs-contract-by-status',
  templateUrl: './ebs-contract-by-status.component.html',
  styleUrls: ['./ebs-contract-by-status.component.css']
})
export class EbsContractByStatusComponent implements OnInit {

  public contracts: any;
  public selectedTerritories: any = 'all';
  public columnChartData: any;
  public caseStatusTerritories: any;
  public dropdownListTerritory = [];
  public dropdownListCaseStatusTerritory = [];
  public selectedItems = [];
  public dropdownSettings = {};
  public sideViewDropDowns = new SideViewDropDowns();
  constructor(private _ebsService: EbsService, private _dataHandlerService: DataHandlerService) {
    this._dataHandlerService.dataFromSideView
      .subscribe(res => {
        let incomingData = res.data
        if (res.from == 'onItemSelect') {
          this.onItemSelect(incomingData)
        } else if (res.from == 'onItemDeSelect') {
          this.onItemDeSelect(incomingData)
        } else if (res.from == 'onSelectAll') {
          this.onSelectAll(incomingData);
        }
        //deselect all
        else {
          this.onDeSelectAll(incomingData);
        }
      });
  }
  /**
   * calling the Angular Lookup Service Method getContracts() implemented by Vishal Sehgal as on 8/2/2019
   * 
   */
  public getData() {
    return new Promise((resolve, reject) => {
      this._ebsService.getContracts(this.selectedTerritories).subscribe(data => {
        this.contracts = data;
        console.log("contracts" + this.contracts)
      }, err => console.error(err),
        // the third argument is a function which runs on completion
        () => {
          let array = [];
          array.push(['Status', 'No. of Contracts', { role: "annotation" }, { role: "style" }]);
          // ARRAY OF OBJECTS
          for (let i in this.contracts) {
            console.log(i);
            // Create new array above and push every object in
            array.push([this.contracts[i].status, parseInt(this.contracts[i].contractscount), parseInt(this.contracts[i].mediandays), 'FF5253']);
          }
          console.log(array);
          resolve(array);
        }
      )
    }).catch((error) => {
      reject(error);
      console.log('errorin getting data :', error);
    })
  }

  public getCaseStatusTerritoriesData() {
    return new Promise((resolve, reject) => {
      this._ebsService.getCaseStatusTerritories().subscribe(data => {
        this.caseStatusTerritories = data;
        console.log("territories" + this.caseStatusTerritories)
      }, err => console.error(err),
        // the third argument is a function which runs on completion
        () => {
          let array = [];
          let count = 0;
          let otherTerritory = '';
          for (let i in this.caseStatusTerritories) {
            if (this.caseStatusTerritories[i].territory == 'OTHER') {
              console.log("The other territory " + this.caseStatusTerritories[i].territory)
              otherTerritory = this.caseStatusTerritories[i].territory
            } else {
              array.push({ 'item_id': this.caseStatusTerritories[i].territory, 'item_text': this.caseStatusTerritories[i].territory });
            }
          }
          array.push(otherTerritory);
          console.log(array);
          resolve(array);
        }
      )
    }).catch((error) => {
      reject(error);
      console.log('errorin getting data :', error);
    })
  }

  public drawchart1(res) {
    this.columnChartData = {
      chartType: 'BarChart',
      dataTable: res,
      options: {
        title: 'EBS Contract State',
        titleTextStyle: {
          color: '#FFFFFF',
          fontName: 'Verdana',
          fontSize: 18,
          bold: true,
          italic: false
        },
        width: 800, height: 500, legend: { position: 'bottom', textStyle: { color: '#FFFFFF' } },
        backgroundColor: '#011F4B',
        hAxis: {
          textStyle: { color: '#FFFFFF' }
        },
        vAxis: {
          textStyle: { color: '#FFFFFF' }
        },
        series: {
          0: { color: 'FF5253' }
        },
        tooltip: { isHtml: false, type: 'string' }
      }
    }
  }


  ngOnInit() {
    //EBS Chart Number 1 Data Binding from the Express API implemented by Vishal Sehgal as on 8/2/2019
    this.getData().then((res: any) => {
      console.log(res)
      this.columnChartData = {
        chartType: 'BarChart',
        dataTable: res,
        options: {
          title: 'EBS Contract State',
          titleTextStyle: {
            color: '#FFFFFF',
            fontName: 'Verdana',
            fontSize: 18,
            bold: true,
            italic: false
          },
          width: 800, height: 500, legend: { position: 'bottom', textStyle: { color: '#FFFFFF' } },
          backgroundColor: '#083853',
          hAxis: {
            textStyle: { color: '#FFFFFF' }
          },
          vAxis: {
            textStyle: { color: '#FFFFFF' }
          },
          series: {
            0: { color: 'FF5253' }
          },
          tooltip: { isHtml: false, type: 'string' }
        }
      };
    });
    this.getCaseStatusTerritoriesData().then((res: any) => {
      console.log("territories" + res)
      //this.dropdownListCaseStatusTerritory = res;
      this.sideViewDropDowns.showTerritory = true;
      this.sideViewDropDowns.showArrivalType = true;
      this.sideViewDropDowns.showWorkFlow = true;
      this.sideViewDropDowns.territoryData = res;
      this._dataHandlerService.setSideViewDropdown(this.sideViewDropDowns);

    });

    // ng multiselect configurations implemented by Vishal Sehgal 12/2/2019
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

  // ng multiselect events implemented by Vishal Sehgal 12/2/2019
  onItemSelect(item: any) {
    console.log("this.selecteditems" + this.selectedItems);
    this.selectedTerritories += ",'" + item + "'";
    console.log(this.selectedTerritories);
    this.getData().then((res: any) => {
      console.log(res)
      this.drawchart1(res);
    });
  }

  onItemDeSelect(items: any) {
    console.log('Removed value is: ', items);
    var arr = this.selectedTerritories.split(',');
    arr = arr.filter(e => e !== "'" + items + "'");
    this.selectedTerritories = arr.join(', ').replace(/\s/g, '');
    console.log(this.selectedTerritories);
    this.getData().then((res: any) => {
      console.log(res)
      // error handling 
      this.drawchart1(res);
    });
  }

  onSelectAll(items: any) {
    console.log(this.selectedItems);
    var input = items.toString();
    this.selectedTerritories = '\'' + input.split(',').join('\',\'') + '\'';
    console.log("this.selectedterritories" + this.selectedTerritories);
    console.log(this.selectedTerritories);
    this.getData().then((res: any) => {
      console.log(res)
      this.drawchart1(res);
    });

  }

  onDeSelectAll(items: any) {
    this.selectedTerritories = 'all';
    console.log(this.selectedTerritories);
    this.getData().then((res: any) => {
      console.log(res)
      this.drawchart1(res);

    });
  }
}



