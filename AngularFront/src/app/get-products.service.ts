import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GetProductsService {

  constructor(private http: HttpClient) { }

  getProducts() {
    // return this.http.get('https://jsonplaceholder.typicode.com/todos/1')
    return this.http.get('http://localhost:3001/tuotteet')
  }

  postOrder(id:string, user:object, cart:object, total:number) {
    return this.http.post('http://localhost:3001/tuotteet', {id, user: user, cart: cart, total: total});
  }
}
