import { Injectable } from '@angular/core';
import { UserService } from './user.service';

export interface ProductArray {
  id: number,
  category: string,
  name: string,
  description: string,
  price: number,
  inStock: number,
  picture: string,
  rating: number
}

@Injectable({
  providedIn: 'root'
})
export class CartServiceService {

  constructor(private userService: UserService) { }

  setItemToCart(product: ProductArray) {
    this.userService.contactUsers(product, '-', 'addToCart', String(localStorage.getItem('key')))
      .subscribe((res) => {
        console.log(res)
      })
  }
}
