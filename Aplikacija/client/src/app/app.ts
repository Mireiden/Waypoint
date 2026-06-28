import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh; /* fallback */
        height: 100dvh; /* tracks the mobile browser chrome (URL bar) */
      }
      main {
        flex: 1;
        min-height: 0;
      }
    `,
  ],
})
export class App {}
