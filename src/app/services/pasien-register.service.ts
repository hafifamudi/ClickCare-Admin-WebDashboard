import { Injectable } from '@angular/core';
import {
  Firestore, addDoc, collection, doc, updateDoc, serverTimestamp, docData
} from '@angular/fire/firestore';
import { PasienRegister } from '../models/pasien-register.model';
import * as moment from 'moment'
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { DoctorRegister } from 'app/models/doctor-register.model';
import { Poli } from 'app/models/poli.model';

@Injectable({
  providedIn: 'root'
})

export class PasienRegisterService {
  private dbPath = 'pasien-register'

  constructor(
    private firestore: Firestore,
    private angularFirestore: AngularFirestore
  ) {
  }

  savePasienRegister(pasienRegister: PasienRegister, lastAntrianPasien: number): any {
    let poliCode: string
    let doctorCode: string

    // rules for no_antrian POLI pasien
    if (pasienRegister.poli == 'Poli Gigi Umum') {
      poliCode = 'A'
    }
    if (pasienRegister.poli == 'Poli Bedah Syaraf') {
      poliCode = 'B'
    }
    if (pasienRegister.poli == 'Poli THT') {
      poliCode = 'C'
    }
    if (pasienRegister.poli == 'Poli Jantung') {
      poliCode = 'D'
    }
    if (pasienRegister.poli == 'Poli Anak') {
      poliCode = 'E'
    }

    // rules for no_antrian DOCTOR pasien
    if (pasienRegister.dokter == 'Dr. Bagus Budiono') {
      doctorCode = '1'
    }
    if (pasienRegister.dokter == 'Dr. Maulana') {
      doctorCode = '2'
    }
    if (pasienRegister.dokter == 'Dr. Sulton Hendra') {
      doctorCode = '3'
    }
    if (pasienRegister.dokter == 'Dr. Sri Lestari') {
      doctorCode = '4'
    }

    pasienRegister.no_antrian = `${poliCode}${doctorCode}-${lastAntrianPasien}`
    pasienRegister.status = 'Konfirmasi'
    pasienRegister.antrian = lastAntrianPasien
    pasienRegister.waktu = pasienRegister.waktu
    pasienRegister.createdAt = serverTimestamp()
    // save to firestore first
    const pasienRegisterRefFirestore = collection(this.firestore, this.dbPath)
    return addDoc(pasienRegisterRefFirestore, pasienRegister)
  }

  getPasienRegister(waktuRegisterPasien: string): Observable<PasienRegister[]> {
    return this.angularFirestore
      .collection(this.dbPath, ref =>
        ref.orderBy('createdAt')
          .where('waktu', '==', waktuRegisterPasien))
      .valueChanges({ idField: 'id' }) as Observable<PasienRegister[]>
  }

  getAllDonePasien(waktuRegisterPasien: string): Observable<PasienRegister[]> {
    return this.angularFirestore
      .collection(this.dbPath, ref =>
        ref.orderBy('createdAt')
          .where('waktu', '==', waktuRegisterPasien)
          .where('status', '==', 'Konfirmasi'))
      .valueChanges({ idField: 'id' }) as Observable<PasienRegister[]>
  }

  getAllPasien(): Observable<PasienRegister[]> {
    return this.angularFirestore
      .collection(this.dbPath, ref =>
        ref.orderBy('createdAt', 'desc')
          .limit(2))
      .valueChanges({ idField: 'id' }) as Observable<PasienRegister[]>
  }

  getNextPagePasien(pasienData: PasienRegister): Observable<PasienRegister[]> {
    console.log(`pasien start ${pasienData.id}-${pasienData.nama}`);
    
    return this.angularFirestore
    .collection(this.dbPath, ref =>
      ref.orderBy('createdAt', 'desc')
        .startAfter(pasienData.createdAt)
        .limit(2)).valueChanges() as Observable<PasienRegister[]>
  }

  getPrevPagePasien(endPasien: PasienRegister) {    
    return this.angularFirestore
    .collection(this.dbPath, ref =>
      ref.orderBy('createdAt', 'desc')
        .endBefore(endPasien.createdAt)
        .limitToLast(2))
    .valueChanges({ idField: 'id' }) as Observable<PasienRegister[]>
  }

  getAntrianSekarangPasien(waktuRegiterPasien: string): AngularFirestoreCollection<PasienRegister> {
    return this.angularFirestore.collection(this.dbPath, ref =>
      ref.orderBy('createdAt', 'desc')
        .where('status', '==', 'Konfirmasi')
        .where('waktu', '==', waktuRegiterPasien)
        .limitToLast(1))
  }

  getAntrianSelanjutnyaPasien(waktuRegiterPasien: string): AngularFirestoreCollection<PasienRegister> {
    return this.angularFirestore.collection(this.dbPath, ref =>
      ref.orderBy('createdAt', 'desc')
        .where('status', '==', 'Konfirmasi')
        .where('waktu', '==', waktuRegiterPasien)
        .limitToLast(2))
  }

  getSisaPasienRegister(waktuRegiterPasien: string): Observable<PasienRegister[]> {
    return this.angularFirestore.collection(this.dbPath, ref =>
      ref.where('status', '!=', 'Selesai')
        .where('waktu', '==', waktuRegiterPasien))
      .valueChanges({ idField: 'id' }) as Observable<PasienRegister[]>
  }

  getLastAntrianPasien(waktuRegisterPasien: string): AngularFirestoreCollection<PasienRegister> {
    return this.angularFirestore.collection(this.dbPath, ref =>
      ref.orderBy('createdAt',)
        .where('waktu', '==', waktuRegisterPasien)
        .limitToLast(1))
  }

  getDoctorJadwal(doctorName: string): AngularFirestoreCollection<DoctorRegister> {
    return this.angularFirestore.collection('doctor-register', ref =>
      ref.where('nama', '==', doctorName))
  }

  getLimitPoli(poliName: string): AngularFirestoreCollection<Poli> {
    return this.angularFirestore.collection('poli', ref =>
      ref.where('nama', '==', poliName))
  }

  getListPoli(): Observable<Poli[]> {
    return this.angularFirestore.collection('poli').valueChanges({ idField: 'id' }) as Observable<Poli[]>
  }

  editPasienRegisterStatus(pasienRegister: PasienRegister, status: string) {
    const pasienRegisterRef = doc(this.firestore, `${this.dbPath}/${pasienRegister.id}`)
    return updateDoc(pasienRegisterRef, { status: status })
  }

  editPoliKouta(poli: string, total: number) {
    const pasienRegisterRef = doc(this.firestore, `poli/${poli}`)
    return updateDoc(pasienRegisterRef, { total: total })
  }
}
