import { RepoCreator } from 'source/services/RepoCreator';
import { Repository as RepositoryWireModel } from 'source/models/Repository';
import { OAuth } from 'source/services/OAuth-Auth0';
import { GitHub } from 'source/services/GitHub';
import { StripeCheckout, StripeToken } from 'source/services/StripeCheckout';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject } from 'aurelia-dependency-injection';
import { computedFrom } from 'aurelia-binding';
import { Validation } from 'aurelia-validation';
import underscore from 'underscore';

class Repository {
	constructor(
		public owner: string,
		public name: string,
		public sponsored: boolean
	) {}

	equals = (other: Repository): boolean => {
		return this.owner == other.owner
			&& this.name == other.name;
	}

	merge = (other: Repository) => {
		this.sponsored = this.sponsored || other.sponsored;

	}

}

enum Sections {
	SPONSORED
}

@autoinject
export class Sponsorship {
	private allTemplates: Repository[] = [];
	private repositoriesTemplates: Repository[] = [];
	protected selectedSection: Sections = Sections.SPONSORED;


	constructor(
		private oAuth: OAuth,
		private stripeCheckout: StripeCheckout,
		private repoCreator: RepoCreator,
		private gitHub: GitHub,
		private router: Router,
		private eventAggregator: EventAggregator,
		protected validation: Validation
	) {
		this.validation = validation.on(this)
			.ensure('searchInput')
			.isNotEmpty();
	}

	activate() {
		if (this.oAuth.isLoggedOrLoggingIn)
			this.fetchRepositories();
	}

	get loggedIn(): boolean {
		return this.oAuth.isLoggedOrLoggingIn;
	}


	@computedFrom('selectedSection')
	protected get isSponsoredSelected(): boolean {
		return this.selectedSection == Sections.SPONSORED;
	}

	protected showSponsored = () => {
		this.selectedSection = Sections.SPONSORED;
	}

	protected repoSelected = (repo: Repository) => {
		this.router.navigate(`name/${repo.owner}/${repo.name}`);
	}


	private cancelSponsorship = (repo: Repository): void => {
		let wireModel = new RepositoryWireModel("GitHub", repo.owner, repo.name);
		this.repoCreator.cancelSponsorship(wireModel).then(sponsored => {
			repo.sponsored = false;
			this.updateTemplates();
		}).catch((error: Error) => {
			this.eventAggregator.publish(error);
		});
	}

	private fetchRepositories = (): void => {

		this.repoCreator.getMyRepositories().then((repos: RepositoryWireModel[]) => {
			let repositoriesTemplates = underscore(repos).map((repo: RepositoryWireModel) => new Repository(repo.repository.owner, repo.repository.name, true));
			this.mergeTemplates(repositoriesTemplates);
		}).catch((error: Error) => {
			this.eventAggregator.publish(error);
		});
	}

	private mergeTemplates = (repos: Repository[]) => {

		repos.forEach(repo => {
			let match: Repository = underscore(this.allTemplates).findWhere({ owner: repo.owner, name: repo.name });
			if (match)
				match.merge(repo);
			else
				this.allTemplates.push(repo);
		})
		this.updateTemplates();
	}

	private updateTemplates = () => {
		// setImmediate to avoid a jquery/Aurelia bug resulting in a console error message
		setImmediate(() => {
			this.repositoriesTemplates = underscore(this.allTemplates).filter((repo: Repository) => repo.sponsored);
	
		});
	}
}
