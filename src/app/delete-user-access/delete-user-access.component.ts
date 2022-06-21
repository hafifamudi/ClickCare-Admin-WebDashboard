import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserAccess } from 'app/models/user-access.model';

@Component({
  selector: 'app-delete-user-access',
  templateUrl: './delete-user-access.component.html',
  styleUrls: ['./delete-user-access.component.scss']
})
export class DeleteUserAccessComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DeleteUserAccessComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserAccess,
  ) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
