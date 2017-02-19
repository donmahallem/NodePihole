import { Component, HostBinding } from '@angular/core';

export function loadPug(): string {
    return require("pug-loader!./app.component.pug")();
}

@Component({
    selector: 'app-root',
    template: loadPug(),
    styleUrls: ['./app.component.css'],
    host: { class: "skin-blue sidebar-mini" }
})
export class AppComponent {
    @HostBinding('class.layout-boxed') layoutBoxed: boolean = false;
}