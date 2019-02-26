import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartclientAverageRenewalComponent } from './smartclient-average-renewal.component';

describe('SmartclientAverageRenewalComponent', () => {
  let component: SmartclientAverageRenewalComponent;
  let fixture: ComponentFixture<SmartclientAverageRenewalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartclientAverageRenewalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartclientAverageRenewalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
