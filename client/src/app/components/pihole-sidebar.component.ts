import { Component } from '@angular/core';
import { MenuItem, MenuHeader, MenuView, MenuTreeView } from "./pihole-sidebar-menu.component";

const DISABLE_SUBMENU: MenuTreeView = new MenuTreeView("Disable", "fa-stop")
    .add(new MenuView("Permanently", "#", "fa-stop"))
    .add(new MenuView("For 10 Seconds", "#", "fa-clock-o"))
    .add(new MenuView("For 30 Seconds", "#", "fa-clock-o"))
    .add(new MenuView("For 5 Minutes", "#", "fa-clock-o"));
const TOOLS_SUBMENU: MenuTreeView = new MenuTreeView("Tools", "fa-folder")
    .add(new MenuView("Update Lists", "#", "fa-arrow-circle-down"))
    .add(new MenuView("Query Adlists", "#", "fa-search"))
    .add(new MenuView("Tail pihole.log", "#", "fa-list-ul"));

const MENUITEMS: MenuItem[] = [
    new MenuHeader("MAIN NAVIGATION"),
    new MenuView("Dashboard", "/", "fa-home"),
    new MenuView("Login", "/login", "fa-file-text-o"),
    new MenuView("Query Log", "/queries", "fa-file-text-o"),
    new MenuView("Whitelist", "/list?l=white", "fa-pencil-square-o"),
    new MenuView("Blacklist", "/list?l=black", "fa-ban"),
    DISABLE_SUBMENU,
    TOOLS_SUBMENU
];
@Component({
    selector: 'pihole-sidebar',
    template: require("pug-loader!./pihole-sidebar.component.pug")()
})
export class PiholeSidebarComponent {
    menuItems: Array<MenuItem> = [];
    constructor() {
        this.menuItems = MENUITEMS;
    }
}
