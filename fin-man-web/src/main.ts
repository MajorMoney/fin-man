import { provideZoneChangeDetection, importProvidersFrom } from "@angular/core";

import { provideHttpClient, withXhr, withInterceptorsFromDi } from "@angular/common/http";
import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { CommonModule, JsonPipe } from "@angular/common";
import { withEnabledBlockingInitialNavigation, provideRouter } from "@angular/router";
import { appRoutes } from "./app/app.routes";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection(),
        importProvidersFrom(BrowserModule, CommonModule, JsonPipe, FormsModule, ReactiveFormsModule),
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideRouter(appRoutes, withEnabledBlockingInitialNavigation())
    ]
})
  .catch((err) => console.error(err));
