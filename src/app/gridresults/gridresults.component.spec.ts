import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridResultsComponent } from './gridresults.component';

describe('GridResultsComponent', () => {
  let component: GridResultsComponent;
  let fixture: ComponentFixture<GridResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
