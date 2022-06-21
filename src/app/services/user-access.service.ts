import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserAccess } from 'app/models/user-access.model';
import { Observable } from 'rxjs';
import {
  Firestore, addDoc, collection, serverTimestamp, doc, updateDoc, deleteDoc
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserAccessService {
  private dbPath = 'users-access'

  constructor(
    private angularFirestore: AngularFirestore,
    private firestore: Firestore) { }

  getUsersAccess(): Observable<UserAccess[]> {
    return this.angularFirestore
      .collection(this.dbPath, ref =>
        ref.orderBy('email')
          .where('email', '!=', 'admin@gmail.com')).valueChanges({ idField: 'id' }) as Observable<UserAccess[]>
  }

  editStatusDoctor(user: UserAccess, access: string): Promise<void> {
    const userRef = doc(this.firestore, `${this.dbPath}/${user.id}`)
    return updateDoc(userRef, { access: access })
  }

  deleteUser(user: UserAccess): Promise<void> {
    const userRef = doc(this.firestore, `${this.dbPath}/${user.id}`)
    return deleteDoc(userRef)
  }
}
