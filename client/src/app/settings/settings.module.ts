import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './components/settings.component';
import { NetworkingSettingsComponent } from "./components/networking-settings.component";
import { DhcpSettingsComponent } from "./components/dhcp-settings.component";
import { UpstreamDnsSettingsComponent } from "./components/upstream-dns-settings.component";
import { SettingsRoutingModule } from "./settings-routing.module";
import { ReactiveFormsModule } from '@angular/forms';
import { BoxModule } from "./../modules/adminlte"

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SettingsRoutingModule,
        BoxModule.forRoot()
    ],
    declarations: [
        SettingsComponent,
        NetworkingSettingsComponent,
        DhcpSettingsComponent,
        UpstreamDnsSettingsComponent
    ], exports: [

    ]
})
export class SettingsModule { }