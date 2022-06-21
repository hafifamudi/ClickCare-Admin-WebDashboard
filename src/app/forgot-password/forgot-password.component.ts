import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  public resetPasswordForm: FormGroup

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.resetPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    })
  }

  userResetPasswordError(controlName: string, errorName: string): boolean {
    return this.resetPasswordForm.controls[controlName].hasError(errorName)
  }


  userResetPassword(formGroupDirective: FormGroupDirective): void {
    this.authService.ForgotPassword(this.resetPasswordForm.controls['email'].value)
    formGroupDirective.resetForm()
  }
}
