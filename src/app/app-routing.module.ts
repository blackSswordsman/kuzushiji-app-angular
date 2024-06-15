import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImageViewerPageComponent } from './views/image-viewer-page/image-viewer-page.component';
import { GeneralGuard } from './core/auth/guards/general.guard';
import { LandingPageComponent } from './layout/landing-page/landing-page.component';

const routes: Routes = [{ path: 'test', component: ImageViewerPageComponent, canActivate: [GeneralGuard] },
  {path:'',component:LandingPageComponent,pathMatch:'full'}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
