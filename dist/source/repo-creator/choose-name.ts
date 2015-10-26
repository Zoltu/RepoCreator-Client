import { autoinject } from 'aurelia-dependency-injection';
import { computedFrom } from 'aurelia-binding';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Validation, ValidationGroup } from 'aurelia-validation';

@autoinject()
export class ChooseName {
	protected validationGroup: ValidationGroup

	constructor(
		private router: Router,
		private eventAggregator: EventAggregator,
		validation: Validation
	) {
		this.validationGroup = validation.on(this)
			.ensure('newRepoName')
			.isNotEmpty();
	}

	private templateOwner: string;
	private templateName: string;

	protected newRepoName: string = '';

	public activate(parameters: any) {
		this.templateOwner = parameters.owner;
		this.templateName = parameters.name;
	}

	@computedFrom('newRepoName')
	protected get inputValid() {
		return !!this.newRepoName;
	}

	protected createRepository = (): void => {
		this.validationGroup.validate().then(() => {
			this.router.navigate(`replacements/${this.templateOwner}/${this.templateName}/${this.newRepoName}`);
		});
	}
}
