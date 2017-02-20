import {
    Input,
    HostBinding,
    ContentChildren,
    HostListener,
    Optional,
    SkipSelf
} from '@angular/core';
import { MenuItem, MenuItemType } from "./sidebar-menu.models";

export class AdminLteSidebarMenuTreeParent {
    private isExpanded: boolean = false;
    @ContentChildren(AdminLteSidebarMenuTreeParent, { descendants: false }) childTrees;
    @Input()
    protected menuItems: Array<MenuItem>;
    private menuItemType = MenuItemType;

    constructor( @SkipSelf() @Optional() private parentTree: AdminLteSidebarMenuTreeParent) {

    }

    public get expanded(): boolean {
        return this.isExpanded;
    }

    public closeOthers(childTree: AdminLteSidebarMenuTreeParent) {
        for (let tree of this.childTrees) {
            if (tree !== childTree) {
                tree.expanded = false;
            }
        }
        if (this.parentTree) {
            this.parentTree.closeOthers(this);
        }
    }

    public set expanded(exp: boolean) {
        if (exp != this.isExpanded) {
            this.isExpanded = true;
            this.parentTree.closeOthers(this);
        }
    }
}
