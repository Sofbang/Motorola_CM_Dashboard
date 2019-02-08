import { Component, OnInit } from '@angular/core';
import { LookupService } from '../services/lookup/lookup.service';
import { reject } from 'q';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
 
  public contracts: any;
  public selectedTerritories: any = 'all';
  public columnChartData:any;

  public getData() {
    return new Promise((resolve, reject) => {
      this._lookupService.getContracts(this.selectedTerritories).subscribe(data => {
        this.contracts = data;
        console.log("contracts" + this.contracts)
      }, err => console.error(err),
        // the third argument is a function which runs on completion
        () => {
          let array = [];
          array.push(['Status', 'No. of Median Days', { role: "annotation" }, { role: "style" }]);
          // ARRAY OF OBJECTS
          for (let i in this.contracts) {
            console.log(i);
            // Create new array above and push every object in
            array.push([this.contracts[i].status, parseInt(this.contracts[i].mediandays), parseInt(this.contracts[i].contractscount), 'F25E5E']);
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





  constructor(private _lookupService: LookupService) { }

  
 
  // public drawchart1(res) {
  //   this.columnChartData = {
  //     chartType: 'BarChart',
  //     dataTable: res,
  //     options: {
  //       title: 'Smart Client Cases By Status', width: 900, height: 600, legend: { position: 'bottom', color: '#f13561' },
  //       backgroundColor:'#011F4B',
  //       hAxis: {
  //         textStyle:{color: '#FFFFFF'}
  //          },
  //          vAxis: {
  //           textStyle: {color:'#FFFFFF'}
  //          },
  //       series: {
  //         0: { color: '#851E3E' }
  //       }
  //     }
  //   }
  // }

  ngOnInit() {

    this._lookupService.getLookup()
      .subscribe(res => {
        console.log("service" + JSON.stringify(res));
      });

      this.getData().then((res: any) => {
        console.log(res)
        this.columnChartData = {
          chartType: 'BarChart',
          dataTable: res,
          options: {
            title: 'Smart Client Cases By Status',color:'#FFFFFF', width: 800, height: 500, legend: { position: 'bottom', color: '#f13561' },
             backgroundColor:'#011F4B',
             hAxis: {
             textStyle:{color: '#FFFFFF'}
             },
             vAxis: {
            textStyle: {color:'#FFFFFF'}
             },
            series: {
              0: { color: '#011F4B' }
            },
            tooltip: { isHtml: false }
          }
        };
      });
        
    //  this.drawchart1();


  }

}
