declare module "oauthio-web" {
	import { JQueryPromise } from 'jquery';

	export interface PopupOptions {
		cache: boolean;
		authorize: any;
	}

	export interface UserData {
		id: string;
		name: string;
		firstname: string;
		lastname: string;
		alias: string;
		email: string;
		birthdate: { day: number, month: number, year: number };
		gender: number;
		location: string;
		local: string;
		company: string;
		occupation: string;
		raw: any;
	}

	export interface AuthResponse {
		access_token: string;
		oauth_token: string;
		oauth_token_secret: string;
		expires_in: number;
		code: string;
		refresh_token: string;
		provider: string;

		me(): JQueryPromise<UserData>;

		get(url: string): JQueryPromise<any>;
		post(url: string, params: any): JQueryPromise<any>;
		put(url: string, params: any): JQueryPromise<any>;
		delete(url: string): JQueryPromise<any>;
		patch(url: string, params: any): JQueryPromise<any>;
	}

	interface OAuthStatic {
		initialize(publicKey: string): void;
		popup(provider: string, options: PopupOptions): JQueryPromise<AuthResponse>;
		create(provider: string): AuthResponse;
		clearCache(provider?: string): void;
	}

	export var OAuth: OAuthStatic;
}
