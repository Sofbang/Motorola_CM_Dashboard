import { TestBed } from '@angular/core/testing';

import { SmartclientService } from './smartclient.service';

describe('SmartclientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SmartclientService = TestBed.get(SmartclientService);
    expect(service).toBeTruthy();
  });
});
