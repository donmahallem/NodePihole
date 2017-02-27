import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    HostBinding,
    Injectable
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class AdminLteBoxService {
    private boxCollapseSource = new Subject<boolean>();
    boxCollapse$ = this.boxCollapseSource.asObservable();
    private isBoxCollapsed: boolean = false;

    public get boxCollapsed(): boolean {
        return this.isBoxCollapsed;
    }

    public set boxCollapsed(collapsed: boolean) {
        if (this.isBoxCollapsed != collapsed) {
            this.isBoxCollapsed = collapsed;
            this.boxCollapseSource.next(this.isBoxCollapsed);
        }
    }

    public toggleCollapse() {
        this.boxCollapsed = !this.boxCollapsed;
    }
}

@Directive({
    selector: ".box",
    providers: [AdminLteBoxService]
})
export class BoxDirective {
    @HostBinding("class.collapsed-box")
    @Input("collapsed")
    private collapsed: boolean = false;
    private collapseSubscription: Subscription;
    constructor(private adminLteBoxService: AdminLteBoxService) {
        this.adminLteBoxService.boxCollapsed = this.collapsed;
        this.collapseSubscription = this.adminLteBoxService.boxCollapse$.subscribe(
            collapsed => {
                this.collapsed = collapsed;
            });
    }

    ngOnDestroy() {
        this.collapseSubscription.unsubscribe();
    }
}