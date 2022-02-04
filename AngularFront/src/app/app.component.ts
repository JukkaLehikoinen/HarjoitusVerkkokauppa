import { Component } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'kauppa';
  constructor(private user: UserService) {  }

  ngOnInit(): void {
    // this.eraseLocalStorage();
  }

  eraseLocalStorage() {
    localStorage.removeItem('user');
  }
  
}
