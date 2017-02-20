import { Component } from '@angular/core';

import { AdminLteSidebarMenuItemComponent } from "./sidebar-menu-item.component";
import { MenuItemSimple } from "./sidebar-menu.models";

@Component({
    selector: "li[sidebar-menu-item-simple]",
    templateUrl: "./sidebar-menu-item-simple.component.pug"
})
export class AdminLteSidebarMenuItemSimpleComponent extends AdminLteSidebarMenuItemComponent<MenuItemSimple>{

}