import { Component } from '@angular/core';

import { AdminLteSidebarMenuItemComponent } from "./sidebar-menu-item.component";
import { MenuItemTree } from "./sidebar-menu.models";

@Component({
    selector: "li[sidebar-menu-item-tree]",
    templateUrl: "./sidebar-menu-item-tree.component.pug",
    host: { "class": "treeview" }
})
export class AdminLteSidebarMenuItemTreeComponent extends AdminLteSidebarMenuItemComponent<MenuItemTree>{
    constructor() {
        super();
    }

    private isOpen: boolean = false;

    public toggle() {
        this.isOpen = !this.isOpen;

    }
}