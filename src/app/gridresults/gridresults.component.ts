import { Component, Input, OnChanges, SimpleChanges, SimpleChange , Output, EventEmitter } from '@angular/core';

@Component({
 selector: 'gridresults',
 templateUrl: './gridresults.component.html',
  styleUrls: ['./gridresults.component.css']
})

export class GridResultsComponent {
  private _businesses: Array<any>;
  private gridApi;
  private mapcomponent: any;
  @Output() selectedAddress = new EventEmitter();

  constructor()
  {
  }

  get businesses(): Array<any>
  {
      return this._businesses;
  }

  @Input()
  set businesses(businesses: Array<any>) {
    this._businesses = businesses;
    this.rowData = this._businesses;
    //this.rowData = [ {name:this.count++}];
  }

  ngOnInit() {
    console.log('on init');
  }

  onGridReady(params) {
    this.gridApi = params.api;
  }

  onClicked(event){
      console.log('Emiting');
      this.selectedAddress.emit(event.data.address);
  }

  export() {
     this.gridApi.exportDataAsCsv();
  }
  columnDefs = [
        {headerName: 'Name', field: 'name' , sortable: true, filter: true},
        {headerName: 'Email', field: 'email',sortable: true, filter: true},
        {headerName: 'Address', field: 'address',sortable: true, filter: true},
        {headerName: 'Phone', field: 'phone',sortable: true, filter: true},

    ];

  autoGroupColumnDef = {
        headerName: 'Model',
        field: 'model',
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
            checkbox: true
        }
    };
    rowData = this._businesses;
}
