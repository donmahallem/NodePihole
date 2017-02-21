import { Component } from '@angular/core';
import { MenuItem, MenuItemHeader, MenuItemSimple, MenuItemTree } from "./adminlte/sidebar/sidebar-menu.models";
import { APP_BASE_HREF } from '@angular/common';

const DISABLE_SUBMENU: MenuItemTree = new MenuItemTree("Disable", "fa-stop")
    .add(new MenuItemSimple("Permanently", "#", "fa-stop"))
    .add(new MenuItemSimple("For 10 Seconds", "#", "fa-clock-o"))
    .add(new MenuItemSimple("For 30 Seconds", "#", "fa-clock-o"))
    .add(new MenuItemSimple("For 5 Minutes", "#", "fa-clock-o"));
const TOOLS_SUBMENU: MenuItemTree = new MenuItemTree("Tools", "fa-folder")
    .add(new MenuItemSimple("Update Lists", "#", "fa-arrow-circle-down"))
    .add(new MenuItemSimple("Query Adlists", "#", "fa-search"))
    .add(new MenuItemSimple("Tail pihole.log", "#", "fa-list-ul"));

const MENUITEMS: MenuItem[] = [
    new MenuItemHeader("MAIN NAVIGATION"),
    new MenuItemSimple("Dashboard", "/", "fa-home"),
    new MenuItemSimple("Login", "/login", "fa-file-text-o"),
    new MenuItemSimple("Query Log", "/queries", "fa-file-text-o"),
    new MenuItemSimple("Whitelist", "/list?l=white", "fa-pencil-square-o"),
    new MenuItemSimple("Blacklist", "/list?l=black", "fa-ban"),
    DISABLE_SUBMENU,
    TOOLS_SUBMENU
];
@Component({
    selector: 'pihole-sidebar',
    templateUrl: "./pihole-sidebar.component.pug"
})
export class PiholeSidebarComponent {
    menuItems: Array<MenuItem> = [];
    constructor() {
        this.menuItems = MENUITEMS;
        console.log("BASE HREF", APP_BASE_HREF);
    }
}
