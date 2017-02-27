import { Component, Input } from "@angular/core";
@Component({
    selector: "networking-settings",
    templateUrl: "./networking-settings.component.pug",
})
export class NetworkingSettingsComponent {
    private interface: string;
    private ipv4Address: string;
    private ipv6Address: string;
    private hostname: string;

    constructor() {
        this.hostname = "pihole";
        this.interface = "eth0";
    }
}