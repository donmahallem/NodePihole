import {
    NgModule,
    ModuleWithProviders
} from '@angular/core';
import { SmallboxComponent } from "./components";


@NgModule({
    declarations: [SmallboxComponent],
    exports: [SmallboxComponent]
})
export class SmallboxModule {
    public static forRoot(): ModuleWithProviders {
        return { ngModule: SmallboxModule, providers: [] };
    }
}