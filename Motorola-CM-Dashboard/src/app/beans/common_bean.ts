export class FilterFormat {
    public from_date: string;
    public to_date: string;
    public territory_selected: boolean = false;
    public territory_data: Array<any>=[];
    public arrival_selected: boolean = false;
    public arrival_data: Array<any>=[];
}
export class SideViewDropDowns {
    public showWorkFlow: boolean = false;
    public showCaseCategory: boolean = false;
    public showContracType: boolean = false;
    public showTerritory: boolean = false;
    public showArrivalType: boolean = false;
    public showContractTime: boolean = false;
    public showCaseTime: boolean = false;
    public workFlowData: Array<any> = [];
    public caseCatData: Array<any> = [];
    public contractTypeData: Array<any> = [];
    public territoryData: Array<any> = [];
    public arrivalTypeData: Array<any> = [];
    public contractTimeData: Array<any> = [];
    public caseTimeData: Array<any> = [];
    public compHeading: string = '';
    public showYearDD: boolean = false;


}
export class FilterFormatEBS {
    public territory_selected: boolean = false;
    public territory_data: Array<any>=[];
    public arrival_selected: boolean = false;
    public arrival_data: Array<any>=[];
    public workflow_selected: boolean = false;
    public workflow_data: Array<any>=[];
}