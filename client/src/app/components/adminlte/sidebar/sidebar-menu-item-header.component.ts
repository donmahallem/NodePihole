import { Component } from '@angular/core';

import { AdminLteSidebarMenuItemComponent } from "./sidebar-menu-item.component";
import { MenuItemHeader } from "./sidebar-menu.models";

@Component({
    selector: "li[sidebar-menu-item-header]",
    templateUrl: "./sidebar-menu-item-header.component.pug",
    host: { "class": "header" }
})
export class AdminLteSidebarMenuItemHeaderComponent extends AdminLteSidebarMenuItemComponent<MenuItemHeader>{

}