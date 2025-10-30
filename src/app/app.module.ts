import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from "./app.component";
import {
  BsDropdownModule,
  CollapseModule,
  TabsModule,
  TabsetConfig,
  ButtonsModule,
} from "ngx-bootstrap";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SdkRunComponent } from "./components/sdk-run/sdk-run.component";
import { HttpClientModule } from "@angular/common/http";
import { Route, RouterModule } from "@angular/router";
import { IndexComponent } from "./components/index/index.component";
import { MatButtonModule } from "@angular/material/button";

const routes: Route[] = [
  {
    path: "",
    redirectTo: "app",
    pathMatch: "full",
  },
  {
    path: "app",
    component: IndexComponent,
  },
];

@NgModule({
  declarations: [AppComponent, SdkRunComponent, IndexComponent],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    RouterModule.forRoot(routes, {
      enableTracing: false,
      relativeLinkResolution: "legacy",
    }),
    FormsModule,
    TabsModule,
    ButtonsModule,
    MatButtonModule,
  ],
  providers: [TabsetConfig],
  bootstrap: [AppComponent],
})
export class AppModule {}
