import { Component, Input, OnInit } from '@angular/core';
import { PasienRegister } from 'app/models/pasien-register.model';
import { PasienRegisterService } from 'app/services/pasien-register.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment'
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  @Input() pasienSearch: string

  public totalPasien: number = 0
  public sisaPasien: number = 0
  public lastAntrian: number = 0
  public antrianSekarang: string = '-'
  public antrianSelanjutnya: string = '-'
  public checkAntrianSekarang: string
  public checkAntrianSelanjutnya: string
  public nextDay = new Date()
  public nextDayActual = new Date()
  public formatNextDayActual: string
  public formatNextDay: string

  public stateDate: string
  public userDataLogin = JSON.parse(localStorage.getItem('user')!)

  pasienRegister: PasienRegister[] = []
  isLoading: boolean = true
  isPasien: boolean = true
  isDone: boolean = false

  constructor(
    private pasienRegisterService: PasienRegisterService,
    private authService: AuthService,
    private snackBar: MatSnackBar) {


    // setup date register
    this.nextDay.setDate((new Date().getDate() + 1) - 1)
    this.nextDayActual.setDate(new Date().getDate() + 1)
    this.formatNextDayActual = moment(this.nextDayActual).format('YYYY-MM-DD')
    localStorage.setItem('nextDay', this.formatNextDayActual)

    // save nextDay to local storage
    this.stateDate = localStorage.getItem('nextDay')
    this.formatNextDay = moment(this.nextDay).format('YYYY-MM-DD')
  }

  ngOnInit() {
    this.getAllDataPasienRegister()
    this.getAllDonePasien()

    // cek antrian pasien with realtime
    this.getSisaAntrianPasien()
    this.getLastAntrianPasien()
    this.getAntrianSekarangPasien()
    this.getAntrianSelanjutnyaPasien()
  }

  getAllDataPasienRegister(): void {
    this.pasienRegisterService.getPasienRegister(this.stateDate).subscribe((res: PasienRegister[]) => {
      if (this.isDone) return

      if (res.length == 0) {
        this.isPasien = false
        this.isLoading = false
        return
      }

      this.pasienRegister = res
      this.isLoading = false
      this.isPasien = true
      this.totalPasien = res.length
    })
  }

  getSisaAntrianPasien(): void {
    this.pasienRegisterService.getSisaPasienRegister(this.stateDate).subscribe(res => {
      this.sisaPasien = res.length
    })
  }

  confirmPasienRegister(pasienRegister: PasienRegister): void {
    const { email } = this.userDataLogin
    const userRoles = ['All', 'Edit']

    if (pasienRegister.status != 'Selesai') {
      this.authService.checkUserAccess(email).valueChanges().subscribe(res => {
        if (!userRoles.includes(res[0].access)) {
          this.snackBar.open(`Anda tidak memiliki Akses untuk melakukan Konfirmasi`, 'Keluar', {
            duration: 3000
          })
          return
        }


        this.pasienRegisterService.editPasienRegisterStatus(pasienRegister, 'Selesai')
          .then(() => {
            this.snackBar.open(`Pasien atas nama ${pasienRegister.nama} sudah terkonfirmasi`, 'Keluar', {
              duration: 3000
            })
          })
      })
    }
  }

  getLastAntrianPasien(): void {
    // get last antrian pasien
    this.pasienRegisterService.getLastAntrianPasien(this.stateDate).valueChanges().subscribe(res => {
      if (res.length == 0) {
        this.lastAntrian = 1
      }

      res.map(pasien => {
        this.lastAntrian = pasien.antrian + 1
      })
    })
  }

  getAntrianSekarangPasien(): void {
    this.pasienRegisterService.getAntrianSekarangPasien(this.stateDate).valueChanges().subscribe(res => {
      if (res.length == 0) {
        this.antrianSekarang = '-'
      }

      res.map(pasien => {
        this.antrianSekarang = pasien.no_antrian
        this.checkAntrianSekarang = pasien.status
      })
    })
  }

  getAntrianSelanjutnyaPasien(): void {
    this.pasienRegisterService.getAntrianSelanjutnyaPasien(this.stateDate).valueChanges().subscribe(res => {
      if (res.length == 0) {
        this.antrianSelanjutnya = '-'
      }

      if (res.length == 2) {
        this.antrianSelanjutnya = res[0].no_antrian
        this.checkAntrianSelanjutnya = res[0].status
        return
      }

      res.map(pasien => {
        this.antrianSelanjutnya = pasien.no_antrian
        this.checkAntrianSelanjutnya = pasien.status
      })
    })
  }

  getAllDonePasien(): void {
    this.pasienRegisterService.getAllDonePasien(this.stateDate).subscribe(res => {
      if (!this.isPasien) {
        this.isDone = false 
        return
      }

      if (res.length == 0) {
        this.snackBar.open(`Seluruh Pelayanan Pasien hari ini sudah selesai`, 'Keluar', {
          duration: 3000
        })

        localStorage.setItem('nextDay', this.formatNextDayActual)
        this.pasienRegister = []
        this.isDone = true
        return
      }

      this.pasienRegister = res
      this.isDone = false
    })
  }


}
