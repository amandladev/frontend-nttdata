import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class EncryptService {

  constructor() { }

  encryptPassword(password: string): string {
    const secretKey = environment.encryptPassword; 
    const encryptedPassword = CryptoJS.AES.encrypt(
      password, 
      secretKey
    ).toString();
    return encryptedPassword; 
  }
  decryptPassowrd(encryptedPassword: string): string {
    const secretKey = environment.encryptPassword;
    const decryptedPassword = CryptoJS.AES.decrypt(
      encryptedPassword,
      secretKey
    ).toString(CryptoJS.enc.Utf8);
    return decryptedPassword;
  }

}
