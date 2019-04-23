import { TestBed } from '@angular/core/testing';

import { GenerateTokenService } from './generate-token.service';

describe('GenerateTokenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GenerateTokenService = TestBed.get(GenerateTokenService);
    expect(service).toBeTruthy();
  });
});
