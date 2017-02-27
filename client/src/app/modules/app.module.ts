import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './../components/app.component';
import { PiholeHeadbarComponent } from './../components/pihole-headbar.component';
import { PiholeSidebarComponent } from './../components/pihole-sidebar.component';
import { PiholeSidebarStatusComponent } from './../components/pihole-sidebar-status.component';
import { AdminLteSidebarMenu } from "./../components/adminlte/sidebar/sidebar-menu.component";
import { PiholeContentComponent } from './../components/pihole-content.component';

import { PiholeRoutingModule } from './pihole-routing.module';
import { SettingsModule } from './../settings/settings.module';

import { PiholeApiService } from './../services/pihole-api.service';
import { PiholeAuthService } from './../services/pihole-auth.service';

import { AdminLteBox } from "./../components/adminlte/box.component";

@NgModule({
    declarations: [
        AppComponent,
        PiholeHeadbarComponent,
        PiholeSidebarComponent,
        PiholeSidebarStatusComponent,
        AdminLteSidebarMenu,
        PiholeContentComponent,
        AdminLteBox
    ],
    imports: [
        BrowserModule,
        HttpModule,
        PiholeRoutingModule,
        SettingsModule
    ],
    providers: [PiholeApiService, PiholeAuthService],
    bootstrap: [AppComponent]
})
export class AppModule { }
