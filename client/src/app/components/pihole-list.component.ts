import {
    Component,
    Input,
    ContentChild
} from '@angular/core';
import { PiholeApiService, ListEntry } from "./../services/pihole-api.service";
import { ActivatedRoute, Params } from '@angular/router';
import { AlertComponent } from 'ng2-bootstrap/alert'
import { Subscription } from 'rxjs/Subscription';
@Component({
    templateUrl: "./pihole-list.component.pug"
})
export class PiholeListComponent {
    @Input()
    protected domain: string;
    private list: string;
    protected domainList: ListEntry[] = [];
    protected isUnknownList: boolean = false;
    protected isRequesting: boolean = false;
    @ContentChild(AlertComponent)
    protected alertMsg: AlertComponent;
    private statusType: string = "success";
    private statusMessage: string = "Adding to stuff";
    private alertVisible: boolean = false;
    private queryParamSubscription: Subscription;
    constructor(private piholeApi: PiholeApiService, private activatedRoute: ActivatedRoute) {

    }

    ngOnInit() {
        // subscribe to router event
        this.queryParamSubscription = this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.list = params["l"];
        });
    }
    ngAfterViewInit() {
        this.piholeApi
            .getList(this.list)
            .subscribe(
            data => {
                this.domainList = data;
            },
            error => {
                console.log(error);
            }
            )
    }

    ngOnDestroy() {
        this.queryParamSubscription
            .unsubscribe();
    }

    public showStatus(type: string, message: string) {
        this.statusType = type;
        this.statusMessage = message;
    }

    private readonly domainRegex = /^(?!:\/\/)(?!.{256,})(([a-z0-9][a-z0-9_-]*?\.)+?[a-z]{2,6}?)$/i;
    private isValidDomain(domain: string) {
        return domain.match(this.domainRegex);
    }

    public showInfo(message: string) {
        this.showAlert("info", message);
    }

    public showError(message: string) {
        this.showAlert("danger", message);
    }
    public showSuccess(message: string) {
        this.showAlert("success", message);
    }

    public showAlert(type: string, message: string) {
        this.alertVisible = true;
        this.statusType = type;
        this.statusMessage = message;
    }

    public addDomain() {
        this.showInfo("Adding domain");
        if (this.isValidDomain(this.domain)) {
            this.piholeApi
                .addDomainToList("white", this.domain)
                .subscribe(
                success => this.showSuccess("Domain added successfully"),
                error => this.showError("Couldn't add domain"));
        } else {
            this.showError("No valid domain");
        }
    }

    public alertClosed(event: any) {
        this.alertVisible = false;
    }

    public removeDomain() {
        this.showInfo("Removing domain");
        if (this.isValidDomain(this.domain)) {
            this.piholeApi
                .removeDomainFromList("white", this.domain)
                .subscribe(
                success => this.showSuccess("Domain removed successfully"),
                error => this.showError("Couldn't remove domain"));
        } else {
            this.showError("No valid domain");
        }
    }

    public refreshList() {
        if (!this.isRequesting) {
            this.isRequesting = true;
            this.piholeApi
                .getList("white")
                .subscribe(
                success => console.log(success),
                error => console.log(error),
                () => this.isRequesting = false);
        }
    }
}