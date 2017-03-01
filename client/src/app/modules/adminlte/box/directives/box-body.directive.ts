import {
    Directive,
    Host,
    HostBinding
} from '@angular/core';
import { AdminLteBoxService } from "./box.directive";
import { Subscription } from 'rxjs/Subscription';

@Directive({
    selector: '.box-body'
})
export class BoxBodyDirective {
    @HostBinding("hidden")
    private collapsed: boolean = false;
    private collapseSubscription: Subscription;
    constructor( @Host() private adminLteBoxService: AdminLteBoxService) {
        this.collapseSubscription = this.adminLteBoxService.boxCollapse$.subscribe(
            collapsed => {
                this.collapsed = collapsed;
                console.log("body collapsed", collapsed);
            });
    }
    ngOnDestroy() {
        this.collapseSubscription.unsubscribe();
    }
}