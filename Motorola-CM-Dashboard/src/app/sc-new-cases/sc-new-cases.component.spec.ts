import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScNewCasesComponent } from './sc-new-cases.component';

describe('ScNewCasesComponent', () => {
  let component: ScNewCasesComponent;
  let fixture: ComponentFixture<ScNewCasesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScNewCasesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScNewCasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
