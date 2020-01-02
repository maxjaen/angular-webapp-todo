import { TestBed } from '@angular/core/testing';

import { TimeTaskService } from './timetask.service';

describe('ZeiterfassungService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimeTaskService = TestBed.get(TimeTaskService);
    expect(service).toBeTruthy();
  });
});
