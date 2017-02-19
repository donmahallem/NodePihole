import {
    Component,
    Input,
    Pipe,
    PipeTransform,
    trigger,
    state,
    style,
    transition,
    animate,
    AnimationTransitionEvent
} from "@angular/core";
import { PiholeAuthService } from "./../services/pihole-auth.service";

import { Subscription } from "rxjs/Subscription";

export enum MenuItemType {
    TREEVIEW = 1,
    VIEW = 2,
    HEADER = 3
}

export class MenuItem {
    title: string;
    type: MenuItemType;

    constructor(title: string, type: MenuItemType) {
        this.title = title;
        this.type = type;
    }
}

export class MenuView extends MenuItem {
    path?: string;
    icon?: string = null;
    constructor(title: string, path: string, icon: string) {
        super(title, MenuItemType.VIEW);
        this.path = path;
        this.icon = icon;
    }
}

export class MenuHeader extends MenuItem {
    constructor(title: string) {
        super(title, MenuItemType.HEADER);
    }
}
export class MenuTreeView extends MenuItem {
    children: Array<MenuItem>;
    icon: string = null;
    constructor(title: string, icon: string) {
        super(title, MenuItemType.TREEVIEW);
        this.icon = icon;
        this.children = [];
    }

    public add(menuitem: MenuItem): MenuTreeView {
        this.children.push(menuitem);
        return this;
    }
}

@Component({
    selector: "ul[pihole-sidebar-menu]",
    template: require("pug-loader!./pihole-sidebar-menu.component.pug")()
})
export class PiholeSidebarMenuComponent {
    @Input() menuItems: Array<MenuItem>;
    @Input() isParent: boolean = false;
    private loginSubscription: Subscription;
    // So that MenuItemType is available
    private menuItemType = MenuItemType;
    constructor(private piholeLogin: PiholeAuthService) {

    }

    ngOnInit() {
        this.loginSubscription = this.piholeLogin.subscribe(
            function (x) {
                console.log("Next: " + x.toString());
            },
            function (err) {
                console.log("Error: " + err);
            },
            function () {
                console.log("Completed");
            });
        console.log("subscribed", this.loginSubscription);
    }
};


@Component({
    selector: "li[pihole-sidebar-menu-view]",
    template: require("pug-loader!./pihole-sidebar-menu-view.component.pug")()
})
export class PiholeSidebarMenuViewComponent {
    @Input() menuitem: MenuItem;
    private loginSubscription: Subscription;
    // So that MenuItemType is available
    protected menuItemType = MenuItemType;
    constructor(protected piholeLogin: PiholeAuthService) {
    }

    ngOnInit() {
        this.loginSubscription = this.piholeLogin.subscribe(
            function (x) {
                console.log("Next: " + x.toString());
            },
            function (err) {
                console.log("Error: " + err);
            },
            function () {
                console.log("Completed");
            });
        console.log("subscribed", this.loginSubscription);
    }
}


@Component({
    selector: "li[pihole-sidebar-menu-treeview]",
    template: require("pug-loader!./pihole-sidebar-menu-treeview.component.pug")(),
    animations: [
        trigger("openState", [
            state("true", style({ height: '*' })),
            transition('void => *', [
                style({ height: 0 }), //style only for transition transition (after transiton it removes)
                animate('250ms ease-out', style({ height: '*' })) // the new state of the transition(after transiton it removes)
            ]),
            transition('* => void', [
                style({ height: '*' }),
                animate('250ms ease-out',
                    style({ height: 0 }))])
        ])
    ]
})
export class PiholeSidebarMenuTreeviewComponent extends PiholeSidebarMenuViewComponent {
    private isOpen: boolean = false;

    constructor(protected piholeLogin: PiholeAuthService) {
        super(piholeLogin);
    }

    public toggle() {
        //this.isOpen = !this.isOpen;
    }

    private toggleStarted(event: AnimationTransitionEvent) {

    }
    private toggleStopped(event: AnimationTransitionEvent) {

    }
}