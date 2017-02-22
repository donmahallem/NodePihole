import {
    Component,
    Input,
    ContentChild
} from '@angular/core';
import { PiholeService } from "./../services/pihole.service";
import { ActivatedRoute, Params } from '@angular/router';
import { AlertComponent } from 'ng2-bootstrap/alert'
@Component({
    templateUrl: "./pihole-list.component.pug"
})
export class PiholeListComponent {
    @Input()
    protected domain: string;
    private list: string;
    protected domainList: string[] = [];
    protected isUnknownList: boolean = false;
    protected isRequesting: boolean = false;
    @ContentChild(AlertComponent)
    protected alertMsg: AlertComponent;
    private statusType: string = "success";
    private statusMessage: string = "Adding to stuff";
    constructor(private piholeService: PiholeService, private activatedRoute: ActivatedRoute) {

    }

    ngOnInit() {
        // subscribe to router event
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.list = params["l"];
            console.log("got", this.list);
        });
        console.log(this.alertMsg);
    }

    public showStatus(type: string, message: string) {
        this.statusType = type;
        this.statusMessage = message;
    }

    public addDomain() {
        this.statusType = "info";
        this.piholeService
            .api
            .addDomainToList("white", "test.com")
            .subscribe(
            success => console.log(success),
            error => console.log(error));
    }

    public removeDomain() {
        this.piholeService
            .api
            .removeDomainFromList("white", "test.com")
            .subscribe(
            success => console.log(success),
            error => console.log(error));
    }

    public refreshList() {
        if (!this.isRequesting) {
            this.isRequesting = true;
            this.piholeService
                .api
                .getList("white")
                .subscribe(
                success => console.log(success),
                error => console.log(error),
                () => this.isRequesting = false);
        }
    }
}