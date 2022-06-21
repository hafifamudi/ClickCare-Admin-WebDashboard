import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { PasienRegisterService } from 'app/services/pasien-register.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PasienRegister } from 'app/models/pasien-register.model';
import * as moment from 'moment';
import { DoctorRegisterService } from 'app/services/doctor-register.service';
import { DoctorRegister } from 'app/models/doctor-register.model';
import { Poli } from 'app/models/poli.model';
import { AuthService } from 'app/services/auth.service';
import { CronJob } from 'cron'

interface DataTemplate {
  value: string;
  viewValue: string
}
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  public pasienRegisterForm: FormGroup
  public doctorRegisterForm: FormGroup
  public doctorList: DoctorRegister[] = []
  public poliList: Poli[] = []
  public poliTotal: number = 0
  public poliID: string
  public lastAntrian: number = 0
  public nextDay = new Date()
  public nextDayActual = new Date()
  public formatNextDayActual: string
  public formatNextDay: string
  public cronJob: CronJob

  public userDataLogin = JSON.parse(localStorage.getItem('user')!)

  constructor(
    private pasienRegisterService: PasienRegisterService,
    private doctorRegisterService: DoctorRegisterService,
    private authService: AuthService,
    private snackBar: MatSnackBar) {
    this.nextDay.setDate((new Date().getDate() + 1) - 1)
    this.nextDayActual.setDate((new Date().getDate() + 1))
    this.formatNextDayActual = moment(this.nextDayActual).format('YYYY-MM-DD')
    this.formatNextDay = moment(this.nextDay).format('YYYY-MM-DD')

    // setup cron job for update Poli Collection
    this.cronJob = new CronJob('59 23 * * *', () => {
      this.resetPoliKouta()
    })

    if (!this.cronJob.running) {
      this.cronJob.start()
    }
  }

  ngOnInit() {
    this.pasienRegisterForm = new FormGroup({
      nama: new FormControl('', [Validators.required]),
      alamat: new FormControl('', [Validators.required]),
      no_telepon: new FormControl('', [Validators.required, Validators.pattern("^[0-9]+$")]),
      nik: new FormControl('', [Validators.required, Validators.pattern("^[0-9]+$")]),
      no_bpjs: new FormControl('', [Validators.required, Validators.pattern("^[0-9]+$")]),
      poli: new FormControl('', [Validators.required]),
      dokter: new FormControl('', [Validators.required]),
      waktu: new FormControl('', [Validators.required]),
      keluhan: new FormControl('', [Validators.required])
    })

    this.doctorRegisterForm = new FormGroup({
      nama: new FormControl('', [Validators.required]),
      umur: new FormControl('', [Validators.required, Validators.pattern("^[0-9]+$")]),
      nik: new FormControl('', [Validators.required, Validators.pattern("^[0-9]+$")]),
      alamat: new FormControl('', [Validators.required]),
      no_telepon: new FormControl('', [Validators.required, Validators.pattern("^[0-9]+$")]),
      no_bpjs: new FormControl('', [Validators.required, Validators.pattern("^[0-9]+$")]),
      spesialis: new FormControl('', [Validators.required]),
    })

    // cek antrian pasien with realtime
    this.getLastAntrianPasien()
    // get doctor & poli list for select input
    this.getDoctorList()
    this.getListPoli()
  }

  pasienRegisterError(controlName: string, errorName: string): boolean {
    return this.pasienRegisterForm.controls[controlName].hasError(errorName)
  }

  doctorRegisterError(controlName: string, errorName: string): boolean {
    return this.doctorRegisterForm.controls[controlName].hasError(errorName)
  }

  onRegisterPasien(formGroupDirective: FormGroupDirective): void {
    const { email } = this.userDataLogin
    const userRoles = ['All', 'Add']

    this.authService.checkUserAccess(email).valueChanges().subscribe(res => {
      if (!userRoles.includes(res[0].access)) {
        this.snackBar.open(`Anda tidak memiliki Akses untuk melakukan Registrasi`, 'Keluar', {
          duration: 3000
        })
        return
      }
    })

    let tanggalPasienRegister: string = moment(this.pasienRegisterForm.controls['waktu'].value).format('YYYY-MM-DD')
    // cek date that pasien choice
    if (tanggalPasienRegister != this.formatNextDay) {
      this.snackBar.open('Mohon pilih tanggal H-1 dari jadwal Registrasi', 'Keluar', {
        duration: 3000
      })
      return
    }

    //update poli kouta
    this.pasienRegisterService.editPoliKouta(this.poliID, this.poliTotal + 1)

    // get last antrian pasien
    this.getLastAntrianPasien()
    //set waktu pasien register with next day
    this.pasienRegisterForm.controls['waktu'].setValue(this.formatNextDayActual)

    this.pasienRegisterService.savePasienRegister(this.pasienRegisterForm.value, this.lastAntrian)
    formGroupDirective.resetForm()

    this.snackBar.open('Registrasi Pasien berhasil', 'Keluar', {
      duration: 3000
    })
  }

  onRegisterDoctor(formGroupDirective: FormGroupDirective): void {
    this.doctorRegisterService.saveDoctorRegister(this.doctorRegisterForm.value)
    formGroupDirective.resetForm()

    this.snackBar.open('Registrasi Dokter berhasil', 'Keluar', {
      duration: 3000
    })
  }

  getDoctorJadwal($event): void {
    let doctorName = $event.value

    // cek that doctor available or not
    this.pasienRegisterService.getDoctorJadwal(doctorName).valueChanges().subscribe(res => {
      res.map(doctor => {
        if (doctor.status == 'Tidak Ada') {
          this.snackBar.open(`${doctor.nama} Tidak Tersedia untuk saat ini. Silahkan pilih dokter yang lain`, 'Keluar', {
            duration: 3000
          })

          this.pasienRegisterForm.controls['dokter'].reset()
          return
        }
      })
    })
  }

  getLimitPoli($event): void {
    let poliName = $event.value

    // cek that doctor available or not
    this.pasienRegisterService.getLimitPoli(poliName).valueChanges({ idField: 'id' }).subscribe(res => {
      console.log(res);

      res.map(poli => {
        if (poli.total == 3) {
          this.snackBar.open(`${poli.nama} sudah mencapai batas kouta untuk hari ${this.formatNextDay}`, 'Keluar', {
            duration: 3000
          })

          this.pasienRegisterForm.controls['poli'].reset()
          return
        }

        this.poliTotal = poli.total
        this.poliID = poli.id
      })
    })
  }

  getListPoli(): void {
    this.pasienRegisterService.getListPoli().subscribe(res => {
      this.poliList = res
    })
  }

  getDoctorList(): void {
    this.doctorRegisterService.getDoctorRegister().subscribe(res => {
      this.doctorList = res
    })
  }

  getLastAntrianPasien(): void {
    // get last antrian pasien
    this.pasienRegisterService.getLastAntrianPasien(this.formatNextDayActual).valueChanges().subscribe(res => {
      if (res.length == 0) {
        this.lastAntrian = 1
      }

      res.map(pasien => {
        this.lastAntrian = pasien.antrian + 1
      })
    })
  }

  resetPoliKouta(): void {
    this.pasienRegisterService.getListPoli().subscribe(res => {
      res.map(poli => {
        this.pasienRegisterService.editPoliKouta(poli.id, 0)
      })
    })
  }
}
