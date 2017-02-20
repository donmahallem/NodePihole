import {
    Component
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { MenuItem } from "./sidebar-menu.models";
import { AdminLteSidebarMenuTreeParent } from "./sidebar-menu-tree-parent.component"
import { AdminLteSidebarMenuItemTreeComponent } from "./sidebar-menu-item-tree.component";
import { AdminLteSidebarMenuItemSimpleComponent } from "./sidebar-menu-item-simple.component";
import { AdminLteSidebarMenuItemHeaderComponent } from "./sidebar-menu-item-header.component";
import { AdminLteSidebarMenuTreeSubparentComponent } from "./sidebar-menu-tree-subparent.component";
@Component({
    selector: "ul.sidebar-menu",
    templateUrl: "./sidebar-menu-tree-parent.component.pug",
    providers: []
})
export class AdminLteSidebarMenuComponent extends AdminLteSidebarMenuTreeParent {
    constructor() {
        super(null);
    }
}

export const AdminLteSidebarMenu = [
    AdminLteSidebarMenuComponent,
    AdminLteSidebarMenuItemTreeComponent,
    AdminLteSidebarMenuItemSimpleComponent,
    AdminLteSidebarMenuItemHeaderComponent,
    AdminLteSidebarMenuTreeSubparentComponent
]