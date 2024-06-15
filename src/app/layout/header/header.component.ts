import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private keycloakService: KeycloakService) {}

  logout() {
    this.keycloakService.logout();
  }

  ngOnInit(): void {
  }

}
