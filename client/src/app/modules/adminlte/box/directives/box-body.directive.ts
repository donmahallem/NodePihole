import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    HostBinding,
    Injectable
} from '@angular/core';
import { AdminLteBoxService } from "./box.directive";
import { Subscription } from 'rxjs/Subscription';

@Directive({
    selector: '.box-body',
    host: {}
})
export class BoxBodyDirective {
    private collapsed: boolean = false;
    private collapseSubscription: Subscription;
    constructor(private adminLteBoxService: AdminLteBoxService) {
        this.collapsed = adminLteBoxService.boxCollapsed;
        this.collapseSubscription = this.adminLteBoxService.boxCollapse$.subscribe(
            collapsed => {
                this.collapsed = collapsed;
            });
    }
    ngOnDestroy() {
        this.collapseSubscription.unsubscribe();
    }
}