import { Component, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';

@Component({
 selector: 'gridresults',
 templateUrl: './gridresults.component.html',
  styleUrls: ['./gridresults.component.css']
})

export class GridResultsComponent implements OnChanges{
  @Input() businesses: Array<any>;
  private _businesses: Array<any>;
  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    const businesses: SimpleChange = changes.businesses;
    console.log('curr value: ' , changes.businesses.currentValue);
    console.log('curr valuea: ' , typeof  changes.businesses.currentValue);
    this.rowData = businesses.previousValue;
  }

  ngOnInit() {
    console.log('on init');
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
    rowData = this.businesses;
}
