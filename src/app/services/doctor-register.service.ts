import { Injectable } from '@angular/core';
import { DoctorRegister } from 'app/models/doctor-register.model';
import {
  Firestore, addDoc, collection, serverTimestamp, doc, updateDoc, deleteDoc
} from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorRegisterService {
  private dbPath = 'doctor-register'

  constructor(
    private firestore: Firestore,
    private angularFirestore: AngularFirestore) { }

  saveDoctorRegister(doctorRegister: DoctorRegister): any {
    doctorRegister.status = 'Ada'
    doctorRegister.createdAt = serverTimestamp()
    // save to firestore first
    const doctorRegisterRefFirestore = collection(this.firestore, this.dbPath)
    return addDoc(doctorRegisterRefFirestore, doctorRegister)
  }

  getDoctorRegister(): Observable<DoctorRegister[]> {
    return this.angularFirestore.collection(this.dbPath, ref => ref.orderBy('createdAt')).valueChanges({ idField: 'id' }) as Observable<DoctorRegister[]>
  }
  
  editStatusDoctor(doctorRegister: DoctorRegister, status: string): Promise<void> {
    const doctorRegisterRef = doc(this.firestore, `${this.dbPath}/${doctorRegister.id}`)
    return updateDoc(doctorRegisterRef, { status: status })
  }

  deleteDoctor(doctorRegister: DoctorRegister): Promise<void> {
    const doctorRegisterRef = doc(this.firestore, `${this.dbPath}/${doctorRegister.id}`)
    return deleteDoc(doctorRegisterRef)
  }
}
