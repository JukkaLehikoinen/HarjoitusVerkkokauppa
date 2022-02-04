import { Component, OnInit, Renderer2 } from '@angular/core';
import { CartServiceService, ProductArray } from '../cart-service.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../user.service';
import { GetProductsService } from '../get-products.service';

@Component({
  selector: 'app-shoppingcart',
  templateUrl: './shoppingcart.component.html',
  styleUrls: ['./shoppingcart.component.css']
})

export class ShoppingcartComponent implements OnInit {

  constructor(private cartService: CartServiceService, private renderer: Renderer2, private modalService: NgbModal,
    private userservice: UserService, private productservice: GetProductsService) {
  }

  shoppingCart: any = [];
  emptyList: boolean = true;
  displayedColumns: string[] = ['picture', 'name', 'price', ' '];
  closeResult: string = '';
  userData: any = [];
  //displayedColumns: string[] = ['item', 'cost'];

  getTotalCost() {
    let totalCosts: number = 0;
    this.shoppingCart.forEach((item: any) => {
      totalCosts = item.price + totalCosts;
    });
    return totalCosts;
  }

  ngOnInit(): void {
    if (this.shoppingCart.length < 1) {
      this.emptyList = false;
      this.getUserData()
    }
  }

  deleteItem(product: ProductArray, i: number) {
    console.log(product)
    console.log(i)
    const sList = this.shoppingCart.filter((pro: object, index: number) => i !== index);
    this.userservice.contactUsers(sList, '-', 'updateCart', String(localStorage.getItem('key')))
      .subscribe((res: any) => {
        console.log('delete', res)
        this.shoppingCart = [
          ...res[0].user.cart
        ]
        this.createNewDivToNotificate(product.name);
      })
  }

  clearShoppingList() {
    this.shoppingCart = [];
    this.checkIfCartIsEmpty()
    this.userservice.contactUsers(this.shoppingCart, '-', 'updateCart', String(localStorage.getItem('key')));
  }

  getPicture(product: string) {
    return 'http://localhost:3001/kuvat/' + product;
  }

  getUserData() {
    this.userservice.contactUsers('-', '-', 'get', String(localStorage.getItem('key')))
      .subscribe((res: any) => {
        console.log(res)
        this.userData = res[0].user;
        console.log('get', this.userData.cart)
        if (this.userData.cart.length > 0) {
          this.shoppingCart = this.userData.cart;
        } else {
          this.emptyList = true;
        }
      })
  }

  openDetails(content: any) {
    // this.selectedProduct = product;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  createNewDivToNotificate(productName: string) {
    // Use Angular's Renderer2 to create the div element
    const newElement = this.renderer.createElement('div');
    // Set the id of the div
    newElement.innerHTML = productName + ' poistettu ostoskorista';
    this.renderer.setProperty(newElement, 'id', 'notification');
    // Append the created div to the body element
    this.renderer.appendChild(document.body, newElement);
    this.checkIfCartIsEmpty();
    return newElement;
  }

  checkIfCartIsEmpty() {
    if (this.shoppingCart.length === 0) {
      this.emptyList = true;
    }
  }

  makeOrder() {
    this.productservice.postOrder(String(localStorage.getItem('key')), this.userData, this.shoppingCart, this.getTotalCost())
      .subscribe()
    this.clearShoppingList();
    this.modalService.dismissAll();
  }
}
