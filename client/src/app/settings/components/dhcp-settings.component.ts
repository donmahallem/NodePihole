import {
    Component,
    Directive,
    Inject
} from "@angular/core";
import {
    FormControl,
    FormGroup,
    FormBuilder,
    Validators,
    Validator,
    AbstractControl
} from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: "dhcp-settings",
    templateUrl: "./dhcp-settings.component.pug",
})
export class DhcpSettingsComponent {
    private dhcpForm: FormGroup;
    private formSettingsAdvanced: AbstractControl;
    private formSettingsRange: AbstractControl;
    private enableSubscription: Subscription;
    private formSettings: AbstractControl;
    private ipRegex: RegExp = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
    constructor(private formBuiler: FormBuilder) {
        this.dhcpForm = new FormGroup({
            enabled: new FormControl(false),
            settings: new FormGroup({
                range: new FormGroup({
                    from: new FormControl('0.0.0.0', Validators.compose([Validators.required, Validators.pattern(this.ipRegex)])),
                    to: new FormControl('0.0.0.0', Validators.compose([Validators.required, Validators.pattern(this.ipRegex)]))
                }),
                gateway: new FormControl('0.0.0.0', Validators.compose([Validators.required, Validators.pattern(this.ipRegex)])),
                advanced: new FormGroup({
                    ipv6Enabled: new FormControl(false),
                    domain: new FormControl('0.0.0.0', Validators.compose([Validators.required, Validators.pattern(this.ipRegex)])),
                    leasetime: new FormControl('0.0.0.0', Validators.compose([Validators.required, Validators.pattern(this.ipRegex)]))
                })
            })
        });
        this.formSettings = this.dhcpForm.get("settings");
        this.formSettingsRange = this.formSettings.get("range");
        this.formSettingsAdvanced = this.formSettings.get("advanced");
        this.enableSubscription = this.dhcpForm.get("enabled").valueChanges.subscribe(enabled => {
            enabled ? this.formSettings.enable() : this.formSettings.disable();

        });
    }

    onSubmit() {
        if (this.dhcpForm.valid) {
            console.log("SUBMIT");
        }
    }

    ngOnDestroy() {
        this.enableSubscription.unsubscribe();
    }

}