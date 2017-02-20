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

@Component({
    selector: "ul.treeview-menu[sidebar-menu-tree-subparent]",
    templateUrl: "./sidebar-menu-tree-parent.component.pug",
    providers: []
})
export class AdminLteSidebarMenuTreeSubparentComponent extends AdminLteSidebarMenuTreeParent {
    constructor() {
        super(null);
    }
}