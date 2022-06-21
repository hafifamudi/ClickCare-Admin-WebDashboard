import { Component, OnInit } from '@angular/core';
import { PasienRegister } from 'app/models/pasien-register.model';
import { PasienRegisterService } from 'app/services/pasien-register.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap, tap } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.css']
})
export class TableListComponent implements OnInit {

  pasienRegister: PasienRegister[] = []
  // pagination var
  firstInResponse: PasienRegister
  lastInResponse: PasienRegister
  prev_start_at: PasienRegister[] = []
  prev_start_at_value: PasienRegister
  pagination_clicked_count: number = 0
  disable_next: boolean = false;
  disable_prev: boolean = true;
  // loading animation var
  isLoading: boolean = true
  isPasien: boolean = true
  pasienSearchName: string = ''

  // observable object for handle search function
  private startSearchPasien = new Subject<string>()

  search(searchPasien: string): void {
    this.pasienSearchName = searchPasien
    this.startSearchPasien.next(searchPasien)
  }

  constructor(
    private pasienRegisterService: PasienRegisterService,
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar) {
    this.startSearchPasien.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchPasien: string) =>
        this.firestore
          .collection('pasien-register', ref =>
            ref
              .orderBy('nama')
              .startAt(searchPasien))
          .valueChanges())

    ).subscribe((pasien: any) => {
      if (pasien.length == 0) {
        this.getAllDataPasienRegister()

        if (this.pasienSearchName != '') {
          this.snackBar.open(`Pasien atas nama ${this.pasienSearchName} tidak terdaftar`, 'Keluar', {
            duration: 3000
          })
        }
        return
      }

      this.pasienRegister = pasien
    })
  }

  ngOnInit() {
    this.getAllDataPasienRegister()
  }

  getAllDataPasienRegister(): void {
    this.pasienRegisterService.getAllPasien().subscribe((res: PasienRegister[]) => {
      if (res.length == 0) {
        this.isPasien = false
        this.isLoading = false
        return
      }

      this.firstInResponse = res[0]
      this.lastInResponse = res[res.length - 1]
      this.push_prev_startAt(this.firstInResponse)
      this.pagination_clicked_count = 0
      this.disable_next = false;
      this.disable_prev = false;

      this.pasienRegister = res
      this.isLoading = false
      this.isPasien = true
    })
  }

  nextPageDataPasien(): void {
    this.disable_next = true

    this.pasienRegisterService.getNextPagePasien(this.lastInResponse).subscribe(res => {
      if (res.length == 0) {
        this.disable_next = true
        this.disable_prev = false
        return
      }

      this.firstInResponse = res[0]
      this.lastInResponse = res[res.length - 1]
      this.pasienRegister = res
      this.pagination_clicked_count++
      this.push_prev_startAt(this.firstInResponse)

      if (res.length < 2) {
        this.disable_next = true
        this.disable_prev = false
        return
      } 
      this.disable_next = false;
    })
  }

  previousPageDataPasien(): void {
    this.disable_prev = true
    this.get_prev_startAt()

    this.pasienRegisterService.getPrevPagePasien(this.firstInResponse).subscribe(res => {
      this.firstInResponse = res[0];
      this.lastInResponse = res[res.length - 1]
      this.pasienRegister = res
      this.pagination_clicked_count--
      this.pop_prev_startAt(this.firstInResponse)

      if (this.pagination_clicked_count == 0) {
        this.disable_prev = true
        this.disable_next = false
        return
      }
      this.disable_prev = false
    })
  }

  push_prev_startAt(prev_first_doc: PasienRegister) {
    this.prev_start_at.push(prev_first_doc);
  }

  pop_prev_startAt(prev_first_doc: PasienRegister) {
    this.prev_start_at.map(element => {
      if (prev_first_doc.id == element.id) {
        element = null
      }
    })
  }

  get_prev_startAt() {
    if (this.prev_start_at.length > (this.pagination_clicked_count + 1)) {
      this.prev_start_at.splice(this.prev_start_at.length - 2, this.prev_start_at.length - 1)
    }
    this.prev_start_at_value = this.prev_start_at[this.pagination_clicked_count - 1];
  }
}
