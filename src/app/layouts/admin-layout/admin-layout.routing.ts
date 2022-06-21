import { Routes } from '@angular/router';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { AdminProfileComponent } from 'app/admin-profile/admin-profile.component';
import { AuthGuard } from 'app/guard/auth.guard';
import { DoctorComponent } from 'app/doctor/doctor.component';
import { UserAccessComponent } from 'app/user-access/user-access.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent, canActivate: [AuthGuard]},
    { path: 'register',   component: UserProfileComponent, canActivate: [AuthGuard] },
    { path: 'data-pasien',     component: TableListComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: AdminProfileComponent, canActivate: [AuthGuard]},
    { path: 'data-dokter', component: DoctorComponent, canActivate: [AuthGuard]},
    { path: 'user-access', component: UserAccessComponent, canActivate: [AuthGuard]},
];
