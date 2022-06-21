import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserAccess } from 'app/models/user-access.model';
import { UserAccessService } from 'app/services/user-access.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from 'app/user-dialog/user-dialog.component';
import { DeleteUserAccessComponent } from 'app/delete-user-access/delete-user-access.component';

@Component({
  selector: 'app-user-access',
  templateUrl: './user-access.component.html',
  styleUrls: ['./user-access.component.scss']
})
export class UserAccessComponent implements OnInit {
  isUser: boolean = true
  isLoading: boolean = true
  userList: UserAccess[] = []
  userSearchName: string = ''
  userAccess: string

  // observable object for handle search function
  private startSearchUser = new Subject<string>()

  search(searchUser: string): void {
    this.userSearchName = searchUser
    this.startSearchUser.next(searchUser)
  }
  constructor(
    private userAccessService: UserAccessService,
    private firestore: AngularFirestore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) {
    this.startSearchUser.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchUser: string) =>
        this.firestore
          .collection('users-access', ref =>
            ref
              .orderBy('email')
              .startAt(searchUser))
          .valueChanges())

    ).subscribe((doctor: any) => {
      if (doctor.length == 0) {
        this.getUsersAccess()

        if (this.userSearchName != '') {
          this.snackBar.open(`Pasien atas nama ${this.userSearchName} tidak terdaftar`, 'Keluar', {
            duration: 3000
          })
        }
        return
      }

      this.userList = doctor
    })
   }

  ngOnInit(): void {
    this.getUsersAccess()
  }

  openDialog(user: UserAccess): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      data: { access: this.userAccess },
    })

    dialogRef.afterClosed().subscribe(access => {
      if (access != undefined) {
        this.userAccess = access
        this.editUserAccess(user)
      }
    })
  }

  openDialogDelete(user: UserAccess): void {
    const dialogRef = this.dialog.open(DeleteUserAccessComponent)

    dialogRef.afterClosed().subscribe(del => {
      if (del) {
        this.deleteUser(user)
      }
    })
  }

  getUsersAccess(): void {
    this.userAccessService.getUsersAccess().subscribe(res => {
      if ( res.length == 0 ) {
        this.userList = []
        this.isUser = false
        this.isLoading = false
        return
      }

      this.userList = res
      this.isUser = true
      this.isLoading = false
    })
  }

  editUserAccess(user: UserAccess): void {
    this.userAccessService.editStatusDoctor(user, this.userAccess).then(() => {
      this.snackBar.open(`Akses oparator ${user.email} berhasil di ubah`, 'Keluar', {
        duration: 3000
      })
    })
    .catch(() => {
      this.snackBar.open(`Akes Operator ${user.email} gagal di ubah`, 'Keluar', {
        duration: 3000
      })
    })
  }

  deleteUser(user: UserAccess): void {
    this.userAccessService.deleteUser(user).then(() => {
      this.snackBar.open(`Oparator ${user.email} berhasil di hapus`, 'Keluar', {
        duration: 3000
      })
    })
    .catch(() => {
      this.snackBar.open(`Operator ${user.email} gagal di hapus`, 'Keluar', {
        duration: 3000
      })
    })
  }
} 
