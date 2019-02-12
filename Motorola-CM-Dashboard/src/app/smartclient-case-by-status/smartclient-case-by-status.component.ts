import { Component, OnInit } from '@angular/core';
import { SmartclientService } from '../services/lookup/smartclient.service';
import { reject } from 'q';

@Component({
  selector: 'app-smartclient-case-by-status',
  templateUrl: './smartclient-case-by-status.component.html',
  styleUrls: ['./smartclient-case-by-status.component.css']
})
export class SmartclientCaseByStatusComponent implements OnInit {


  public barChartData: any;
  public cases: any;
  public selectedTerritoriesCasetype: any = 'all';
  public dropdownListCaseStatusTerritory = [];
  public territories: any;




  /**
     * calling the Angular Lookup Service Method getContracts() implemented by Vishal Sehgal as on 8/2/2019
     * 
     */
  public getCaseData() {
    return new Promise((resolve, reject) => {
      this._smartclientService.getCases(this.selectedTerritoriesCasetype).subscribe(data => {
        this.cases = data;
        console.log("contracts" + this.cases)
      }, err => console.error(err),
        // the third argument is a function which runs on completion
        () => {
          let array = [];
          array.push(['Status', 'No. of Median Days', { role: "annotation" }, { role: "style" }]);
          // ARRAY OF OBJECTS
          for (let i in this.cases) {
            console.log(i);
            // Create new array above and push every object in
            array.push([this.cases[i].status, parseInt(this.cases[i].mediandays), parseInt(this.cases[i].contractscount), 'FF5253']);
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


   /**
     * calling the Angular smartClient Service Method getTerritoriesData() implemented by Vishal Sehgal as on 11/2/2019
     * 
     */
  public getTerritoriesData() {
    return new Promise((resolve, reject) => {
      this._smartclientService.getTerritories().subscribe(data => {
        this.territories = data;
        console.log("territories" + this.territories)
      }, err => console.error(err),
        // the third argument is a function which runs on completion
        () => {
          let array = [];
          let count = 0;
          let otherTerritory='';
          for (let i in this.territories) {
            if (this.territories[i].territory == 'OTHER'){
              console.log("The other territory "+ this.territories[i].territory )
              otherTerritory=this.territories[i].territory 
            }else{
            array.push({ 'item_id': this.territories[i].territory, 'item_text': this.territories[i].territory });
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






  constructor(private _smartclientService: SmartclientService) { }

  ngOnInit() {
    
    /**
     * Smart Client Chart Number 2 Data Binding from the Express API implemented by Vishal Sehgal as on 11/2/2019
     * 
     */
    
    this.getCaseData().then((res: any) => {
      console.log(res)
      this.barChartData = {
        chartType: 'BarChart',
        dataTable: res,
        options: {
          title: 'Smart Client Case Status', 
          titleTextStyle: {
            color: '#FFFFFF',    // any HTML string color ('red', '#cc00cc')
            fontName: 'Verdana', // i.e. 'Times New Roman'
            fontSize: 18, // 12, 18 whatever you want (don't specify px)
            bold: true,    // true or false
            italic: false 
           },
          width: 800, height: 500, legend: { position: 'bottom',textStyle: {color: '#FFFFFF'} },
           backgroundColor:'#011F4B',
           hAxis: {
           textStyle:{color: '#FFFFFF'}
           },
           vAxis: {
          textStyle: {color:'#FFFFFF'}
           },
          series: {
            0: { color: 'FF5253' }
          },
          tooltip: { isHtml: false }
        }
      };
    });
    
  }


  }


