import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComplexModule } from './components/complex-component-example/complex.module';
import { SimpleComponent } from './components/simple-component-example/simple.component';
import { ImageViewerPageComponent } from '../views/image-viewer-page/image-viewer-page.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/AuthInterceptor';
import { LandingPageComponent } from '../layout/landing-page/landing-page.component';
import { LayoutModule } from '../layout/layout.module';

const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'master',
  clientId: 'kuzushiji-app',
};

export function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: keycloakConfig,
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
      },
    });
}

const EXPORT_COMPONENTS = [SimpleComponent, ImageViewerPageComponent,LandingPageComponent];

const PIPES = [];

const MODULES = [ComplexModule];

@NgModule({
  declarations: [...EXPORT_COMPONENTS, ...PIPES],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...MODULES, KeycloakAngularModule, LayoutModule],
  exports: [...EXPORT_COMPONENTS, ...PIPES],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: initializeKeycloak,
    multi: true,
    deps: [KeycloakService],
  },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
})
export class SharedModule {
}
