import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartclientCaseByStatusComponent } from './smartclient-case-by-status.component';

describe('SmartclientCaseByStatusComponent', () => {
  let component: SmartclientCaseByStatusComponent;
  let fixture: ComponentFixture<SmartclientCaseByStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartclientCaseByStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartclientCaseByStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
