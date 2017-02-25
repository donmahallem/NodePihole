import {
    Input,
    HostBinding
} from "@angular/core";
import { MenuItem } from "./sidebar-menu.models";
export abstract class AdminLteSidebarMenuItemComponent<T extends MenuItem> {
    @Input("menuitem")
    public menuitem: T;
    constructor() {
    }
}