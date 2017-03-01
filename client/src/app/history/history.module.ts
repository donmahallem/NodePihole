import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    HistoryComponent,
    HistoryTableComponent
} from "./components"
import {
    PaginationModule,
    AlertModule
} from 'ng2-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { HistoryRoutingModule } from "./history-routing.module"

@NgModule({
    imports: [
        CommonModule,
        HistoryRoutingModule,
        PaginationModule,
        AlertModule
    ],
    declarations: [
        HistoryComponent,
        HistoryTableComponent
    ], exports: [

    ]
})
export class HistoryModule { }