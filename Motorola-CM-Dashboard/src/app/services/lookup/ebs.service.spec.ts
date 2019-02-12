import { TestBed } from '@angular/core/testing';

import { EbsService } from './ebs.service';

describe('EbsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EbsService = TestBed.get(EbsService);
    expect(service).toBeTruthy();
  });
});
