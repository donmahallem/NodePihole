import { Component, HostBinding } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';

import { AdminLteSidebarMenuItemComponent } from "./sidebar-menu-item.component";
import { MenuItemSimple } from "./sidebar-menu.models";
import { Subscription } from 'rxjs/Subscription.js'
@Component({
    selector: "li[sidebar-menu-item-simple]",
    templateUrl: "./sidebar-menu-item-simple.component.pug",
})
export class AdminLteSidebarMenuItemSimpleComponent extends AdminLteSidebarMenuItemComponent<MenuItemSimple>{
    constructor(private router: Router) {
        super();
    }
    @HostBinding("class.active")
    public get isActive() {
        return this.router.isActive(this.menuitem.path.path, true);
    }
}