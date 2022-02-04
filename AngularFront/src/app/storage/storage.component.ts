import { Component, OnInit, Renderer2 } from '@angular/core';
import { GetProductsService } from '../get-products.service';
import { FormsModule } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { CartServiceService } from '../cart-service.service';


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

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.css'],
  providers: [NgbRatingConfig],
})
export class StorageComponent implements OnInit {

  selectedCategory: string | undefined;
  textSearch: string | undefined;
  productList: ProductArray[] | any;
  showSome: boolean = false;
  selectedProduct: ProductArray[] | any;
  closeResult: string = '';
  addedToShoppingList: boolean = false;
  displayedColumns: string[] = ['picture', 'name', 'price', 'instock'];
  catFiltered: ProductArray[] | undefined;

  private responseData: ProductArray[] | any;
  private fetchedData: ProductArray[] | any;
  constructor(private getproduct: GetProductsService, private modalService: NgbModal, private renderer: Renderer2,
    config: NgbRatingConfig, private cartService: CartServiceService) {
    config.max = 10;
    config.readonly = true;
  }


  ngOnInit(): void {
    this.getData();
  }

  valueChange(value: string) {
    console.log('', value)
    if (value !== '' && value !== undefined) {
      this.productList = this.fetchedData.filter((product: ProductArray) => product.category === value);
      this.showSome = true;
      this.textSearch = '';
    } else {
      this.productList = [];
      this.showSome = false;
    }
  }

  textValueChange(value: string) {
    if (value !== '') {
      this.productList = this.fetchedData.filter((product: ProductArray) => product.name.includes(value))
      this.showSome = true;
      this.selectedCategory = '';
    } else {
      this.productList = [];
      this.showSome = false;
    }
  }

  getData() {
    this.responseData = this.getproduct.getProducts()
    this.responseData.subscribe((res: []) => {
      this.fetchedData = res.filter((product:any) => product.inStock > 0);
      this.categoryFilter(res);
      console.log(this.fetchedData)
    });
  }

  getPicture(product: string) {
    return 'http://localhost:3001/kuvat/' + product;
  }

  categoryFilter(array: []) {
    if (array.length > 0) {
      this.catFiltered = array.filter((v: ProductArray, i: number, a: any) => a.findIndex((t: any) => (t.category === v.category)) === i)
    }
  }

  addToShoppingList(product: ProductArray) {
    console.log(product)
    this.cartService.setItemToCart(product)
      this.addedToShoppingList = true;
      this.createNewDivToNotificate();
  }

  openDetails(content: any, product: object) {
    this.selectedProduct = product;
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

  createNewDivToNotificate() {
    // Use Angular's Renderer2 to create the div element
    const newElement = this.renderer.createElement('div');
    // Set the id of the div
    newElement.innerHTML = 'Tuote lisätty ostoskoriin';
    this.renderer.setProperty(newElement, 'id', 'notification');
    // Append the created div to the body element
    this.renderer.appendChild(document.body, newElement);

    return newElement;
  }
}
