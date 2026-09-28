import { provideZoneChangeDetection, importProvidersFrom, ErrorHandler } from "@angular/core";

import { provideHttpClient, withXhr, withInterceptorsFromDi, withInterceptors } from "@angular/common/http";
import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { CommonModule, JsonPipe } from "@angular/common";
import { withEnabledBlockingInitialNavigation, provideRouter } from "@angular/router";
import { appRoutes } from "./app/app.routes";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppComponent } from "./app/app.component";
import { httpToastInterceptor } from "./app/core/http-toast.interceptor";
import { ToastErrorHandler } from "./app/core/toast-error.handler";

bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection(),
        importProvidersFrom(BrowserModule, CommonModule, JsonPipe, FormsModule, ReactiveFormsModule),
        provideHttpClient(
            withXhr(),
            withInterceptorsFromDi(),
            withInterceptors([httpToastInterceptor])
        ),
        provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
        { provide: ErrorHandler, useClass: ToastErrorHandler }
    ]
})
  .catch((err) => console.error(err));
