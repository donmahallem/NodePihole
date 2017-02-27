import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    HostBinding,
    Injectable
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
    constructor(private adminLteBoxService: AdminLteBoxService) {

    }
}