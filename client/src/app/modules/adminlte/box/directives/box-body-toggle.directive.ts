import {
    Directive,
    HostListener,
    Host
} from '@angular/core';
import { AdminLteBoxService } from "./box.directive";

@Directive({
    selector: "button[data-widget=collapse]"
})
export class BoxBodyToggleDirective {
    @HostListener('click')
    private onClick() {
        this.adminLteBoxService.toggleCollapse();
    }
    constructor( @Host() private adminLteBoxService: AdminLteBoxService) {

    }
}