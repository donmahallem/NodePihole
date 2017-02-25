import { Component } from '@angular/core';
import { PiholeApiService, Status } from "./../services/pihole-api.service";
@Component({
    selector: 'pihole-sidebar-status',
    templateUrl: "./pihole-sidebar-status.component.pug"
})
export class PiholeSidebarStatusComponent {

    private status: Status = new Status();
    constructor(private piholeApi: PiholeApiService) {

    }

    ngAfterViewInit() {
        this.loadStatus();
    }

    private loadStatus(): void {
        this.piholeApi
            .getStatus()
            .subscribe(
            data => {
                this.status = data;
            },
            error => {
            },
            () => {
                setTimeout(this.loadStatus.bind(this), 60000);
            }
            )
    }
}
