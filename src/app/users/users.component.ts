import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

interface User {
  id: number;
  fullName: string;
  phone: string;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  totalUsers = 0;
  page = 1;
  pageSize = 10;

  constructor(
    private userService: UserService, 
    private router: Router, 
    private toastr: ToastrService,) {}

  fetchUsers(): void {
    this.userService.getUsers(this.page, this.pageSize).subscribe(response => {
      if (!response || !response.data){
        this.toastr.error("Unable to connect to the server", "Connection Error")
        return;
      }
      this.users = response.data;
      this.totalUsers = response.total;
    });
  }
  
  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']); 
      return;
    }

    this.fetchUsers();
  }

  changePage(newPage: number): void {
    this.page = newPage;
    this.fetchUsers();
  }

  logout(): void {
    localStorage.removeItem('token'); 
    this.router.navigate(['/login']); 
  }
}
