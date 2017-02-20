import { Component, HostBinding } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: "./app.component.pug",
    styleUrls: ['./app.component.css'],
    host: { class: "skin-blue sidebar-mini" }
})
export class AppComponent {
    @HostBinding('class.layout-boxed') layoutBoxed: boolean = false;
}