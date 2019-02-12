import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SideDropdownViewComponent } from './side-dropdown-view.component';

describe('SideDropdownViewComponent', () => {
  let component: SideDropdownViewComponent;
  let fixture: ComponentFixture<SideDropdownViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SideDropdownViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideDropdownViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
