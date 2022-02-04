import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  contactUsers(first:any, second:any, type:string, uuid:string) {
      return this.http.post('http://localhost:3001/users', { 'type': type, 'first': first, 'second': second, 'uuid': uuid });
  }

  getAllUsers() {
    return this.http.get('http://localhost:3001/users')
  }
}
