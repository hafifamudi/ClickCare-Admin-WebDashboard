import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public userLogin: FormGroup

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.userLogin = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    })
  }

  userLoginError(controlName: string, errorName: string): boolean {
    return this.userLogin.controls[controlName].hasError(errorName)
  }

  signIn(): void {
    this.authService.signIn(
      this.userLogin.controls['email'].value,
      this.userLogin.controls['password'].value)
  }
}
