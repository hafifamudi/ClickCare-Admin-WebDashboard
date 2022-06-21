import { Component, OnInit, Inject } from '@angular/core';
import { DoctorRegister } from 'app/models/doctor-register.model';
import { DoctorRegisterService } from 'app/services/doctor-register.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DoctorDialogComponent } from 'app/doctor-dialog/doctor-dialog.component';
import { DoctorDeleteDialogComponent } from 'app/doctor-delete-dialog/doctor-delete-dialog.component';

@Component({
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.scss']
})
export class DoctorComponent implements OnInit {
  doctorRegister: DoctorRegister[] = []
  isDoctor: boolean = true
  isLoading: boolean = true
  doctorSearchName: string = ''
  doctorStatus: string

  // observable object for handle search function
  private startSearchDoctor = new Subject<string>()

  search(searchDoctor: string): void {
    this.doctorSearchName = searchDoctor
    this.startSearchDoctor.next(searchDoctor)
  }

  constructor(
    private doctorRegisterService: DoctorRegisterService,
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar,
    public dialog: MatDialog) {
    this.startSearchDoctor.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchDoctor: string) =>
        this.firestore
          .collection('doctor-register', ref =>
            ref
              .orderBy('nama')
              .startAt(searchDoctor))
          .valueChanges())

    ).subscribe((doctor: any) => {
      if (doctor.length == 0) {
        this.getAllDataPasienRegister()

        if (this.doctorSearchName != '') {
          this.snackBar.open(`Pasien atas nama ${this.doctorSearchName} tidak terdaftar`, 'Keluar', {
            duration: 3000
          })
        }
        return
      }

      this.doctorRegister = doctor
    })
  }

  ngOnInit(): void {
    this.getAllDataPasienRegister()
  }

  openDialog(doctor: DoctorRegister): void {
    const dialogRef = this.dialog.open(DoctorDialogComponent, {
      data: { status: this.doctorStatus },
    })

    dialogRef.afterClosed().subscribe(status => {
      if (status != undefined) {
        this.doctorStatus = status
        this.editStatusDoctor(doctor)
      }
    })
  }

  openDialogDelete(doctor: DoctorRegister): void {
    const dialogRef = this.dialog.open(DoctorDeleteDialogComponent)

    dialogRef.afterClosed().subscribe(del => {
      if (del) {
        this.deleteDoctor(doctor)
      }
    })
  }

  getAllDataPasienRegister(): void {
    this.doctorRegisterService.getDoctorRegister().subscribe((res: DoctorRegister[]) => {
      if (res.length == 0) {
        this.doctorRegister = []
        this.isDoctor = false
        this.isLoading = false
        return
      }

      this.doctorRegister = res
      this.isLoading = false
      this.isDoctor = true
    })
  }

  editStatusDoctor(doctorRegister: DoctorRegister): void {
    this.doctorRegisterService.editStatusDoctor(doctorRegister, this.doctorStatus).then(() => {
      this.snackBar.open(`Status ${doctorRegister.nama} berhasil di ubah`, 'Keluar', {
        duration: 3000
      })
    })
      .catch(() => {
        this.snackBar.open(`Upss, status ${doctorRegister.nama} gagal di ubah.
        Coba lagi nanti`, 'Keluar', {
          duration: 3000
        })
      })
  }

  deleteDoctor(doctor: DoctorRegister): void {
    this.doctorRegisterService.deleteDoctor(doctor).then(() => {
      this.snackBar.open(`${doctor.nama} berhasil di hapus`, 'Keluar', {
        duration: 3000
      })
    })
      .catch(() => {
        this.snackBar.open(`Upss, ${doctor.nama} gagal di hapus. Coba lagi nanti`, 'Keluar', {
          duration: 3000
        })
      })
  }
}

