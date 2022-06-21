import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatRippleModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import { AdminProfileComponent } from 'app/admin-profile/admin-profile.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; 
import { DoctorComponent } from 'app/doctor/doctor.component';
import { UserAccessComponent } from 'app/user-access/user-access.component';
import { DoctorDialogComponent } from 'app/doctor-dialog/doctor-dialog.component';
import { DoctorDeleteDialogComponent } from 'app/doctor-delete-dialog/doctor-delete-dialog.component'; 
import { DeleteUserAccessComponent } from 'app/delete-user-access/delete-user-access.component'; 
import { UserDialogComponent } from 'app/user-dialog/user-dialog.component'; 
import { DashboardComponent } from 'app/dashboard/dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatDialogModule,
    MatSelectModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    TableListComponent,
    AdminProfileComponent,
    DoctorComponent,
    UserAccessComponent,
    DoctorDialogComponent,
    DoctorDeleteDialogComponent,
    DeleteUserAccessComponent,
    UserDialogComponent,
  ],
  providers: []

})

export class AdminLayoutModule {}
