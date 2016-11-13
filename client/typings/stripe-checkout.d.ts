declare module "stripe-checkout" {
	export interface BankAccount {
		id: string;
		object: string;
		country: string;
		currency: string;
		last4: string;
		status: string;
		bank_name: string;
		fingerprint: string;
		routing_number: string;
	}

	export interface Card {
		id: string;
		object: string;
		brand: string;
		exp_month: number;
		exp_year: number;
		funding: string;
		last4: string;
		address_city: string;
		address_country: string;
		address_line1: string;
		address_line1_check: string;
		address_line2: string;
		address_state: string;
		address_zip: string;
		address_zip_check: string;
		country: string;
		cvc_check: string;
		dynamic_last4: string;
		metadata: any;
		tokenization_method: string;
		currency: string;
		fingerprint: string;
	}

	export interface Token {
		id: string;
		object: string;
		livemode: boolean;
		created: number;
		type: string;
		used: boolean;
		bank_account?: BankAccount;
		card?: Card;
		client_ip: string;
	}

	export interface ConfigureOptions {
		key: string;
		token?: (token: Token) => any;
		image?: string;
		name?: string;
		description?: string;
		amount?: number;
		currency?: string;
		panelLabel?: string;
		zipCode?: boolean;
		email?: string;
		allowRememberMe?: boolean;
		bitcoin?: boolean;
		opened?: () => any;
		closed?: () => any;
	}

	export interface OpenOptions {
		token: (token: Token) => any;
		image?: string;
		name?: string;
		description?: string;
		amount?: number;
		currency?: string;
		panelLabel?: string;
		zipCode?: boolean;
		email?: string;
		allowRememberMe?: boolean;
		bitcoin?: boolean;
		opened?: () => any;
		closed?: () => any;
	}

	export interface Handler {
		open(config: OpenOptions): void;
	}

	interface StripeCheckoutStatic {
		configure(config: ConfigureOptions): Handler;
	}

	var stripeCheckout: StripeCheckoutStatic;
	export default stripeCheckout;
}
