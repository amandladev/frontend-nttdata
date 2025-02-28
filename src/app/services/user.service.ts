import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserRegistration {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('API URL:', this.apiUrl);
  }

  register(userData: UserRegistration): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData, {
      headers: new HttpHeaders({
          'Content-Type': 'application/json'
      }),
      withCredentials: false 
  });
  }

  getUsers(page: number = 1, pageSize: number = 10) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ data: any[], total: number, page: number, pageSize: number }>(
      `${this.apiUrl}/list?page=${page}&pageSize=${pageSize}`, {
        headers
      }
    );
  }
  
}
