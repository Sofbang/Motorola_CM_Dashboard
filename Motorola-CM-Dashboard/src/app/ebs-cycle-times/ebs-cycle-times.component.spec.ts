import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EbsCycleTimesComponent } from './ebs-cycle-times.component';

describe('EbsCycleTimesComponent', () => {
  let component: EbsCycleTimesComponent;
  let fixture: ComponentFixture<EbsCycleTimesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EbsCycleTimesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EbsCycleTimesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
