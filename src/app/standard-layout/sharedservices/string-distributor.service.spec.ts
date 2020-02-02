import { TestBed } from '@angular/core/testing';

import { StringDistributorService } from './string-distributor.service';

describe('StringDistributorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StringDistributorService = TestBed.get(StringDistributorService);
    expect(service).toBeTruthy();
  });
});
