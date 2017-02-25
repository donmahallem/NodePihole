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
    private locationSubscription: Subscription;
    constructor(private router: Router) {
        super();
        this.locationSubscription = this.router.events.subscribe(data => {
            if (event instanceof NavigationStart) {
                let navStart = event as NavigationStart;
                console.log(navStart.url);
            }
            else if (event instanceof NavigationEnd) {
                let navEnd = event as NavigationEnd;
                console.log(navEnd.url);
            } else if (event instanceof NavigationError) {
                let navError = event as NavigationError;
                console.log(navError.url);
            }
        });/*
        this.locationSubscription = this.location.subscribe(value => {
            if (this.menuitem) {
                if (this.location.isCurrentPathEqualTo(this.menuitem.path.path)) {
                    this.isActive = true;
                }
                console.log("change", this.location.path, this.menuitem.path.path);
            }
        }, error => {
            console.log("route error", error)
        }, () => {
            console.log("return")
        }) as Subscription;*/
    }
    @HostBinding("class.active")
    public get isActive() {
        return this.router.isActive(this.menuitem.path.path, true);
    }

    ngAfterViewInit() {

        /*
                if (this.location.isCurrentPathEqualTo(this.menuitem.path.path)) {
                    console.log("yes?");
                    this.isActive = true;
                }*/
    }

    ngDestroy() {
        this.locationSubscription.unsubscribe();
    }
}