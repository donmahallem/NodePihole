import {
    Component,
    NgZone
} from '@angular/core';
import {
    MenuItem,
    MenuItemHeader,
    MenuItemSimple,
    MenuItemTree,
    MenuItemPath
} from "./adminlte/sidebar/sidebar-menu.models";
import { APP_BASE_HREF } from '@angular/common';
import { PiholeAuthService } from "./../services/pihole-auth.service"
import { Subscription } from 'rxjs/Subscription';

const DISABLE_SUBMENU: MenuItemTree = new MenuItemTree("Disable", "fa-stop")
    .add(new MenuItemSimple("Permanently", "#", "fa-stop"))
    .add(new MenuItemSimple("For 10 Seconds", "#", "fa-clock-o"))
    .add(new MenuItemSimple("For 30 Seconds", "#", "fa-clock-o"))
    .add(new MenuItemSimple("For 5 Minutes", "#", "fa-clock-o"));
const TOOLS_SUBMENU: MenuItemTree = new MenuItemTree("Tools", "fa-folder")
    .add(new MenuItemSimple("Update Lists", "#", "fa-arrow-circle-down"))
    .add(new MenuItemSimple("Query Adlists", "#", "fa-search"))
    .add(new MenuItemSimple("Tail pihole.log", "#", "fa-list-ul"));

const MENUITEMS_LOGEDIN: MenuItem[] = [
    new MenuItemHeader("MAIN NAVIGATION"),
    new MenuItemSimple("Dashboard", "/", "fa-home"),
    new MenuItemSimple("Query Log", "/queries", "fa-file-text-o"),
    new MenuItemSimple("Whitelist", new MenuItemPath("/list", { l: "white" }), "fa-pencil-square-o"),
    new MenuItemSimple("Blacklist", new MenuItemPath("/list", { l: "black" }), "fa-ban"),
    DISABLE_SUBMENU,
    TOOLS_SUBMENU,
    new MenuItemSimple("Settings", "/settings", "fa-gears")
];
const MENUITEMS_LOGEDOUT: MenuItem[] = [
    new MenuItemHeader("MAIN NAVIGATION"),
    new MenuItemSimple("Dashboard", "/", "fa-home"),
    new MenuItemSimple("Login", "/login", "fa-file-text-o")
];
@Component({
    selector: 'pihole-sidebar',
    templateUrl: "./pihole-sidebar.component.pug"
})
export class PiholeSidebarComponent {
    menuItems: Array<MenuItem> = [];
    private authStateSubscription: Subscription;
    constructor(private zone: NgZone,
        private piholeAuth: PiholeAuthService) {
        this.menuItems = MENUITEMS_LOGEDOUT;
        this.authStateSubscription = this.piholeAuth.loginState.subscribe(loginState => {
            console.log("state changed", loginState);
            this.zone.run(() => {
                if (loginState) {
                    this.menuItems = MENUITEMS_LOGEDIN;
                } else {
                    this.menuItems = MENUITEMS_LOGEDOUT;
                }
            });
        });
    }

    ngOnDestroy() {
        this.authStateSubscription.unsubscribe();
    }
}
