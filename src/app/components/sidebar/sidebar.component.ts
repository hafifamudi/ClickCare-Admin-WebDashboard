import { Component, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { AuthService } from 'app/services/auth.service';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'dashboard', class: '' },
    { path: '/register', title: 'Registrasi Dokter & Pasien',  icon:'person', class: '' },
    { path: '/data-pasien', title: 'Data Pasien',  icon:'content_paste', class: '' },
    { path: '/data-dokter', title: 'Data Dokter',  icon:'medication', class: '' },
    { path: '/user-access', title: 'User Access',  icon:'group', class: 'userAccess' }
  ];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];
  userDataLogin = JSON.parse(localStorage.getItem('user')!)

  constructor() { }

  ngOnInit() {    
    const { email } = this.userDataLogin
    if ( email != 'admin@gmail.com' ) {
      this.menuItems = ROUTES.filter(menuItem => menuItem.path != '/user-access' && menuItem.path != '/data-dokter') 
      return
    }

    this.menuItems = ROUTES.filter(menuItem =>  menuItem)        
  }
  
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
