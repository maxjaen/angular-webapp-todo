import { TestBed } from '@angular/core/testing';

import { ZeiterfassungService } from './zeiterfassung.service';

describe('ZeiterfassungService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ZeiterfassungService = TestBed.get(ZeiterfassungService);
    expect(service).toBeTruthy();
  });
});
