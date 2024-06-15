import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class GeneralGuard extends KeycloakAuthGuard {
  constructor(protected override router: Router, protected override keycloakAngular: KeycloakService) {
    super(router, keycloakAngular);
  }

  public override async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    // Убедитесь, что пользователь аутентифицирован
    if (!this.authenticated) {
      await this.keycloakAngular.login();
      return false;
    }

    // Проверьте, есть ли у пользователя необходимые роли
    // Можно проверять глобальные роли через realmAccess или роли клиента через resourceAccess
    const requiredRoles = route.data['roles'];
    if (requiredRoles && !requiredRoles.some((role: string) => this.roles.includes(role))) {
      // Перенаправьте пользователя, если у него нет доступа
      this.router.navigate(['no-access']);
      return false;
    }

    return true;
  }
}
