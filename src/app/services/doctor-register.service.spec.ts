import { TestBed } from '@angular/core/testing';

import { DoctorRegisterService } from './doctor-register.service';

describe('DoctorRegisterService', () => {
  let service: DoctorRegisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DoctorRegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
