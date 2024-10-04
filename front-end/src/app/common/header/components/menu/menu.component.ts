import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../../modules/login/service/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.clickSidebar();
  }

  clickSidebar() {
    const sideMenuItems = document.querySelectorAll<HTMLAnchorElement>('#sidebar .side-menu.top li a');

    sideMenuItems.forEach(menuItem => {
      const menuItemParent = menuItem.parentElement as HTMLLIElement;

      menuItem.addEventListener('click', () => {
        // Loại bỏ lớp 'active' từ tất cả các mục menu
        sideMenuItems.forEach(item => {
          item.parentElement?.classList.remove('active');
        });
        // Thêm lớp 'active' cho mục menu được click
        menuItemParent.classList.add('active');
      });
    });
  }

  signOut() {
    this.authService.signOut().toPromise().then(r => {
    });
  }
}
