import { computedFrom } from 'aurelia-binding';
import { autoinject } from 'aurelia-dependency-injection';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogController } from 'aurelia-dialog';
import { BindingEngine } from 'aurelia-binding';
import { OAuth } from 'source/services/OAuth-Auth0';
import { RepoCreator } from 'source/services/RepoCreator';
import { Repository as RepositoryWireModel } from 'source/models/Repository';
import { Templates, RepositoryViewModel } from 'source/services/Templates';
import underscore from 'underscore';

@autoinject
export class ScaffoldModal {
	private repository: RepositoryViewModel;
	private currentStep: ScaffoldStep = ScaffoldStep.ChooseName;
	private maxStep: ScaffoldStep = ScaffoldStep.ChooseName;
	private errorMessage: string;
	private newRepoName: string;
	private replacements: Replacement[];

	constructor(
		private oAuth: OAuth,
		private repoCreator: RepoCreator,
		private templates: Templates,
		private dialogController: DialogController,
		private bindingEngine: BindingEngine,
		private eventAggregator: EventAggregator) {
			this.bindingEngine.propertyObserver(this, 'newRepoName').subscribe(this.repoNameChanged);
			this.eventAggregator.subscribe(Error, (error: Error) => this.showError(error.message));
	}

	protected activate(repository: RepositoryViewModel) {
		this.repository = repository;
		this.reset();
		this.repoCreator.findKeys(this.repository.wireModel.owner, this.repository.wireModel.name).then(keys => {
			this.maxStep = ScaffoldStep.EnterReplacements;
			if (this.currentStep >= ScaffoldStep.AwaitingReplacements)
				this.currentStep = ScaffoldStep.EnterReplacements;

			this.replacements = underscore(keys)
				.map((key: string) => {
					let replacement = new Replacement(key, '');
					if (/git.?hub.?owner/i.test(replacement.friendlyName))
						this.oAuth.gitHubLogin.then(login => replacement.value = login);
					if (/current.?year/i.test(replacement.friendlyName))
						replacement.value = new Date(Date.now()).getUTCFullYear().toString();
					return replacement;
				});
			this.repoNameChanged(this.newRepoName, this.newRepoName);
		}).catch((error: Error) => {
			this.eventAggregator.publish(error);
		});
	}

	// TODO: this is dirty checked, we could avoid this by putting a watch on every replacement and updating when one of them changes
	public get populatedReplacementCount() {
		return this.replacements.filter(replacement => !!replacement.value).length;
	}

	@computedFrom('newRepoName')
	public get hasNewRepoName() {
		return !!this.newRepoName && this.newRepoName.length > 0;
	}

	public get allReplacementsPopulated() {
		return this.populatedReplacementCount === this.replacements.length;
	}

	public addFavorite = (): void => {
		if (this.repository.isFavorite) {
			this.templates.fetchFavorites();
			return;
		}
		this.templates.addFavorite(this.repository);
	}

	public removeFavorite = (): void => {
		if (!this.repository.isFavorite) {
			this.templates.fetchFavorites();
			return;
		}
		this.templates.removeFavorite(this.repository);
	}

	public sponsor = (): void => {
		if (this.repository.isMySponsored) {
			this.templates.fetchMySponsored();
			return;
		}
		this.templates.sponsor(this.repository);
	}

	public unsponsor = (): void => {
		if (!this.repository.isMySponsored) {
			this.templates.fetchMySponsored();
			return;
		}
		this.templates.cancelSponsorship(this.repository);
	}

	public repoNamed = () => {
		this.advanceStep(ScaffoldStep.AwaitingReplacements);
	}

	public repoNameChanged = (newValue: string, oldValue: string) => {
		if (!this.replacements)
			return;

		this.replacements.forEach(replacement => {
			if (/git.?hub.?repo/i.test(replacement.friendlyName))
				replacement.value = newValue;
		});
	}

	public createNewRepository = () => {
		this.advanceStep(ScaffoldStep.AwaitingCreation);
		let replacementsMap = underscore(this.replacements).reduce((map: any, replacement: Replacement) => {
			map[replacement.name] = replacement.value;
			return map;
		}, {});
		this.repoCreator.createRepo(this.repository.wireModel.owner, this.repository.wireModel.name, this.newRepoName, replacementsMap).then(result => {
			this.advanceStep(ScaffoldStep.Complete);
		}).catch((error: Error) => {
			this.eventAggregator.publish(error);
		});
	}

	public showError = (message: string) => {
		this.errorMessage = message;
		this.maxStep = ScaffoldStep.Error;
		this.currentStep = ScaffoldStep.Error;
	}

	public tryChangeStep = (desiredStep: ScaffoldStep) => {
		if (desiredStep <= this.maxStep)
			this.currentStep = desiredStep;
		else
			this.currentStep = this.maxStep;
	}

	private advanceStep = (suggestedStep: ScaffoldStep) => {
		if (this.maxStep <= suggestedStep)
			this.maxStep = suggestedStep;
		this.currentStep = this.maxStep;
	}

	private reset = () => {
		this.errorMessage = null;
		this.newRepoName = null;
		this.replacements = null;
		this.maxStep = ScaffoldStep.ChooseName;
		this.currentStep = ScaffoldStep.ChooseName;
	}

	// necessary for Aurelia templates to be able to reference the enum
	private ScaffoldStep: any = ScaffoldStep;
}

enum ScaffoldStep {
	Error,
	ChooseName,
	AwaitingReplacements,
	EnterReplacements,
	AwaitingCreation,
	Complete,
}

export class Replacement {
	constructor(
		public name: string,
		public value: string
	) {}

	@computedFrom('name')
	get friendlyName(): string {
		let regex = /magic[_\-\.](.*?)[_\-\.]magic/;
		let match = regex.exec(this.name);
		if (!match)
			return this.name;

		return match[1];
	}
}
