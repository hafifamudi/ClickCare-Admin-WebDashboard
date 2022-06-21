import { TestBed } from '@angular/core/testing';

import { PasienRegisterService } from './pasien-register.service';

describe('PasienRegisterService', () => {
  let service: PasienRegisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasienRegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
