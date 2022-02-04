import { Component, OnInit, Renderer2 } from '@angular/core';
import { UserService } from '../user.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

export interface User {
  id: number,
  name: string,
  address: string,
  email: string,
  pw: string,
  sessionId: string
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  constructor(private userservice: UserService, private modalService: NgbModal, private renderer: Renderer2) {
    // store.select('user').subscribe(val => this.user = val);
  }

  ngOnInit(): void {
    const user = localStorage.getItem('loggedIn')
    if (user !== null) {
      this.userservice.getAllUsers()
        .subscribe((users:any) => {
          const selectedUser = users.filter((filteredUser:any) => filteredUser.name === user)
          this.username = selectedUser[0].name;
          this.password = selectedUser[0].pw;
          this.logIn();
        })
    }
  }

  newUser = {
    name: '',
    address: '',
    email: '',
    pw: ''
  };
  username: string = '';
  password: string = '';
  currentUser: any;
  errori: string = '';
  logInfo: string = '';
  edit: boolean = true;
  editedUser: any;
  logged: boolean = false;
  closeResult: string = '';
  status: string = '';


  logIn() {
    const data = this.userservice.contactUsers(this.username, this.password, 'login', String(localStorage.getItem('key')))
    data.subscribe((res: any) => {
      console.log(res)
      if (res === 'error') {
        this.errori = 'Tarkista käyttäjätunnus/salasana';
        this.logInfo = '';
      } else {
        this.currentUser = {
          ...res.user
        };
        this.editedUser = res.user;
        const userToMemory = {
          name: this.currentUser.name,
          address: this.currentUser.address,
          email: this.currentUser.email
        }
        // localStorage.setItem('user', JSON.stringify(userToMemory));
        localStorage.setItem('key', res.uuid)
        this.logInfo = 'Kirjautunut käyttäjänä ' + this.currentUser.name;
        this.errori = '';
        this.logged = true;
        localStorage.setItem('loggedIn', this.currentUser.name)
      }
    })
  }

  logOut() {
    this.logged = false;
    this.password = '';
    this.username = '';
    this.currentUser = [];
    this.editedUser = [];
    localStorage.removeItem('loggedIn');
  }

  SignUp(content: any) {
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

  createUser() {
    localStorage.removeItem('key');
    const data = this.userservice.contactUsers(this.newUser, '-', 'add', JSON.stringify(localStorage.getItem('key')) )
    data.subscribe((res:object) => {
      this.status = String(res)
      console.log(res)
      if (this.status !== 'errorName') {
        this.modalService.dismissAll();
        this.createNewDivToNotificate();
        this.username = this.newUser.name;
        this.password = this.newUser.pw;
        //localStorage.setItem('key', res.uuid);
        this.logIn();
      }
    })
  }

  passwordChange(password: string) {
    this.password = password;
  }

  usernameChange(username: string) {
    this.username = username;
  }

  editUser() {
    console.log('edit user')
    if (this.edit) {
      this.edit = false;
    } else {
      this.edit = true;
    }
  }

  saveEdit() {
    const response = this.userservice.contactUsers(this.currentUser, this.editedUser, 'update', JSON.stringify(localStorage.getItem('key')))
    response.subscribe((res) => {
      if (res === true) {
        // localStorage.setItem('user', JSON.stringify(this.editedUser));
        this.currentUser = {
          ...this.currentUser,
          name: this.editedUser.name,
          address: this.editedUser.address,
          email: this.editedUser.email
        };
        console.log(this.editedUser)
        console.log(this.currentUser)
        this.logged = true;
        this.edit = true;
        this.logInfo = 'Kirjautunut käyttäjänä ' + this.currentUser.name;
      } else {
        this.errori = String(res);
        this.editedUser.name = this.currentUser.name;
      }
    })

  }

  userEditName(value: string) {
    this.editedUser.name = value;
    console.log(value, ' ', this.editedUser)
  }

  userEditAddress(value: string) {
    this.editedUser.address = value;
    console.log(value, ' ', this.editedUser)
  }

  userEditEmail(value: string) {
    this.editedUser.email = value;
    console.log(value, ' ', this.editedUser)
  }

  createNewDivToNotificate() {
    // Use Angular's Renderer2 to create the div element
    const newElement = this.renderer.createElement('div');
    // Set the id of the div
    newElement.innerHTML = 'Käyttäjä lisätty tietokantaan';
    this.renderer.setProperty(newElement, 'id', 'notification');
    // Append the created div to the body element
    this.renderer.appendChild(document.body, newElement);

    return newElement;
  }

}
