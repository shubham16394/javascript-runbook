import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(),
    provideHighlightOptions({
      fullLibraryLoader: () => import('highlight.js')
    }), provideAnimationsAsync()
  ]
};
