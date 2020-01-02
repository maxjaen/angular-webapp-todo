import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZeiterfassungComponent } from './zeiterfassung.component';

describe('ZeiterfassungComponent', () => {
  let component: ZeiterfassungComponent;
  let fixture: ComponentFixture<ZeiterfassungComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZeiterfassungComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZeiterfassungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
