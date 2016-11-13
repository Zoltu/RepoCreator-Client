import { OAuth as OAuthIo, PopupOptions, UserData, AuthResponse } from 'oauthio-web';
import underscore from 'underscore';

class Map<T> {
	[key: string]: T
}

interface Identity {
	connection: string;
	user_id: string;
	provider: string;
	[key: string]: any;
}

class User {
	constructor(
		public userId: string,
		public nickname: string,
		public email: string,
		public jwtToken: string,
		public identities: Map<Identity>
	) {}
}

class OAuthIoStaticWrapper {
	constructor() {
		OAuthIo.initialize('ySUBeXemKN-_QodJajU-HuWUdVM');
	}

	popup(provider: string, options?: PopupOptions): Promise<AuthResponse> {
		return new Promise<AuthResponse>((resolve, reject) => {
			OAuthIo.popup(provider, options)
				.done(result => resolve(result))
				.fail(error => reject(error));
		})
	}

	clearCache(provider?: string): void {
		OAuthIo.clearCache(provider);
	}
}

export class OAuth {
	private oauthio: OAuthIoStaticWrapper = new OAuthIoStaticWrapper();
	private _userPromise: Promise<User> = null;

	constructor() {
		let localStorageJwtToken = JSON.parse(sessionStorage.getItem('JWT Token'));
		if (localStorageJwtToken)
			this._userPromise = Promise.resolve(localStorageJwtToken);
	}

	private get userPromise(): Promise<User> {
		// if already logged in, return that promise
		if (this._userPromise)
			return this._userPromise;

		// attempt to login and save the attempt promise so other attempts to login while waiting will share in the results
		this._userPromise = this.login();

		// if login fails, assign back to null so that future attempts will re-attempt to login
		// this is intentionally not chained because we don't want to swallow errors for other listeners
		this._userPromise.catch(error => this._userPromise = null);

		// return the promise that is currently attempting a login (note: this promise has no catch handler)
		return this._userPromise;
	}

	get isLoggedOrLoggingIn(): boolean {
		return !!this._userPromise;
	}

	get maybeJwtToken(): Promise<string> {
		if (!this._userPromise)
			return Promise.resolve<string>(null);

		return this._userPromise.then(user => user.jwtToken);
	}

	get jwtToken(): Promise<string> {
		return this.userPromise.then(user => user.jwtToken);
	}

	get maybeGitHubAuthToken(): Promise<string> {
		if (!this._userPromise)
			return Promise.resolve<string>(null);

		return this._userPromise.then(user => user.identities['github']['access_token']);
	}

	get gitHubAuthToken(): Promise<string> {
		return this.userPromise.then(user => user.identities['github']['access_token']);
	}

	get gitHubLogin(): Promise<string> {
		return this.userPromise.then(user => user.nickname);
	}

	get gitHubEmail(): Promise<string> {
		return this.userPromise.then(user => user.email);
	}

	logout = (): void => {
		this.oauthio.clearCache();
		this.userPromise = Promise.reject<User>(new Error('Not logged in.'));
	}

	private login = (): Promise<User> => {
		return this.oauthio.popup('github').then((authResponse: AuthResponse) => {
			// convert the JQueryPromise<UserData> returned by authResponse.me() into a Promise<UserData>
			let userDataPromise = new Promise<UserData>((resolve, reject) => authResponse.me().done(userData => resolve(userData)).fail(error => reject(error)));

			return userDataPromise.then(userData => {
				let userId = authResponse.provider + ":" + userData.id;
				let nickname = userData.alias;
				let email = userData.email;
				let jwtToken = "aoeu";
				let identities = new Map<Identity>();
				identities["github"] = { connection: "", provider: "github", user_id: userId, access_token: authResponse.access_token };
				return new User(userId, nickname, email, jwtToken, identities);
			});
		});
	}
}
