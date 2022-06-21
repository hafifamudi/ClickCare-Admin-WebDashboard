import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  Firestore, doc, setDoc
} from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserAccess } from 'app/models/user-access.model';
import { UserDashboard } from '../models/user-dashboard.model'
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: any
  constructor(
    private firestore: Firestore,
    private fireauth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    private router: Router,
    private ngZone: NgZone,
    private snackBar: MatSnackBar
  ) {
    this.fireauth.authState.subscribe(user => {
      if (user) {
        this.userData = user
        // cek user local data/
        const userLocalData = JSON.parse(localStorage.getItem('user')!)
        if (userLocalData == null) {
          localStorage.setItem('user', JSON.stringify(this.userData))
        }
      } else {
        localStorage.setItem('user', 'null')
      }
    })
  }

  signIn(email: string, password: string): Promise<void> {
    return this.fireauth
      .signInWithEmailAndPassword(email, password)
      .then(result => {
        this.userData = result.user
        // set user log in data to local storage
        localStorage.setItem('user', JSON.stringify(this.userData))
        // automaticly change detection and redirect
        this.ngZone.run(() => {
          this.router.navigate(['dashboard'])
        })
        // set user log in data to firestore
        this.setUserData(result.user)
      }).catch(() => {
        this.snackBar.open('Terjadi Kesalahan, Email atau Salah', 'Keluar', {
          duration: 3000
        })
      })
  }

  signOut() {
    return this.fireauth.signOut().then(() => {
      localStorage.removeItem('user')
      this.router.navigate(['login'])
    })
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!)
    return user !== null ? true : false
  }

  setUserData(user: any) {
    const userRef = doc(this.firestore, `users/${user.uid}`)
    const userData: UserDashboard = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return setDoc(userRef, userData);
  }

  ForgotPassword(passwordResetEmail: string) {
    console.log(passwordResetEmail);
    
    return this.fireauth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        this.snackBar.open('Link reset password telah di kirim kan ke email Anda. Silahkan Check', 'Keluar', {
          duration: 3000
        })
        this.router.navigate(['login'])
      })
      .catch(() => {
        this.snackBar.open('Link reset password gagal di kirim. Coba lagi nanti', 'Keluar', {
          duration: 3000
        })        
      });
  }

  checkUserAccess(username: string): AngularFirestoreCollection<UserAccess>  {
    return this.angularFirestore.collection('users-access', ref =>
      ref.where('email', '==', username))
  }
}
