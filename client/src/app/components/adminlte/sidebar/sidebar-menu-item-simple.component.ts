import { Component } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { AdminLteSidebarMenuItemComponent } from "./sidebar-menu-item.component";
import { MenuItemSimple } from "./sidebar-menu.models";

@Component({
    selector: "li[sidebar-menu-item-simple]",
    templateUrl: "./sidebar-menu-item-simple.component.pug",
    providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
})
export class AdminLteSidebarMenuItemSimpleComponent extends AdminLteSidebarMenuItemComponent<MenuItemSimple>{
    protected get locationPath() {
        return this.location.prepareExternalUrl(this.menuitem.path);
    }
    constructor(private location: Location) {
        super();
        console.log("HAHA", location.prepareExternalUrl("/lol"));
    }
}