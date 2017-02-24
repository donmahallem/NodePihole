import { Component } from '@angular/core';
import { PiholeService, Status } from "./../services/pihole.service";
@Component({
    selector: 'pihole-sidebar-status',
    templateUrl: "./pihole-sidebar-status.component.pug"
})
export class PiholeSidebarStatusComponent {

    private status: Status = new Status();
    constructor(private piholeService: PiholeService) {

    }

    ngAfterViewInit() {
        this.loadStatus();
    }

    private loadStatus(): void {
        this.piholeService
            .api
            .getStatus()
            .subscribe(
            data => {
                this.status = data;
                console.log(data);
            },
            error => {
                console.log("error loading status");
            },
            () => {
                setTimeout(this.loadStatus.bind(this), 10000);
            }
            )
    }
}
