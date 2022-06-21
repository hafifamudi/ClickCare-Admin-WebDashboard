import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-doctor-delete-dialog',
  templateUrl: './doctor-delete-dialog.component.html',
  styleUrls: ['./doctor-delete-dialog.component.scss']
})
export class DoctorDeleteDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DoctorDeleteDialogComponent>) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
