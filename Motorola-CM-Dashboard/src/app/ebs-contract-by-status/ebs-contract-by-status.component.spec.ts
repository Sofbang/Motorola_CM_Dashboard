import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EbsContractByStatusComponent } from './ebs-contract-by-status.component';

describe('EbsContractByStatusComponent', () => {
  let component: EbsContractByStatusComponent;
  let fixture: ComponentFixture<EbsContractByStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EbsContractByStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EbsContractByStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
