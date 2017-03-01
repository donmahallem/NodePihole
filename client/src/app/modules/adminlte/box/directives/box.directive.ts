import {
    Directive,
    HostBinding,
    Injectable,
    Input
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class AdminLteBoxService {
    private boxCollapseSource = new Subject<boolean>();
    boxCollapse$ = this.boxCollapseSource.asObservable();

    private _collapsed: boolean;

    public get collapsed(): boolean {
        return this._collapsed;
    }

    public set collapsed(collapsed: boolean) {
        if (this._collapsed != collapsed) {
            console.log("collapse state switch", this._collapsed, " => ", collapsed);
            this._collapsed = collapsed;
            this.boxCollapseSource.next(this._collapsed);
        }
    }

    public collapse() {
        this.collapsed = true;
    }
    public expand() {
        this.collapsed = false;
    }

    public toggleCollapse() {
        this.collapsed = !this.collapsed;
    }
}

@Directive({
    selector: ".box",
    providers: [AdminLteBoxService]
})
export class BoxDirective {
    constructor(private adminLteBoxService: AdminLteBoxService) {
        console.log("Coll1", this.collapsed);
    }
    @HostBinding("class.collapsed-box")
    set collapsed(collapsed: boolean) {
        this.adminLteBoxService.collapsed = collapsed;
    }
    get collapsed(): boolean {
        return this.adminLteBoxService.collapsed;
    }
    ngAfterViewInit() {
        console.log("Coll2", this.collapsed);
    }
}