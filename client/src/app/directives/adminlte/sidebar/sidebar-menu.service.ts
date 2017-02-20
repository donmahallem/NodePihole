import {
    Injectable
} from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AdminLteSidebarMenuService {
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