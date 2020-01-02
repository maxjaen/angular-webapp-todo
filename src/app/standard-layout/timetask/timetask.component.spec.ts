import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTaskComponent } from './timetask.component';

describe('ZeiterfassungComponent', () => {
  let component: TimeTaskComponent;
  let fixture: ComponentFixture<TimeTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
