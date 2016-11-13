declare module "jquery" {
	/**
	 * Interface for the JQuery promise/deferred callbacks
	 */
	interface JQueryPromiseCallback<T> {
		(value?: T, ...args: any[]): void;
	}

	interface JQueryPromiseOperator<T, U> {
		(callback1: JQueryPromiseCallback<T> | JQueryPromiseCallback<T>[], ...callbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>): JQueryPromise<U>;
	}

	/**
	 * Allows jQuery Promises to interop with non-jQuery promises
	 */
	interface JQueryGenericPromise<T> {
		/**
		 * Add handlers to be called when the Deferred object is resolved, rejected, or still in progress.
		 *
		 * @param doneFilter A function that is called when the Deferred is resolved.
		 * @param failFilter An optional function that is called when the Deferred is rejected.
		 */
		then<U>(doneFilter: (value?: T, ...values: any[]) => U | JQueryPromise<U>, failFilter?: (...reasons: any[]) => any, progressFilter?: (...progression: any[]) => any): JQueryPromise<U>;

		/**
		 * Add handlers to be called when the Deferred object is resolved, rejected, or still in progress.
		 *
		 * @param doneFilter A function that is called when the Deferred is resolved.
		 * @param failFilter An optional function that is called when the Deferred is rejected.
		 */
		then(doneFilter: (value?: T, ...values: any[]) => void, failFilter?: (...reasons: any[]) => any, progressFilter?: (...progression: any[]) => any): JQueryPromise<void>;
	}

	/**
	 * Interface for the JQuery promise, part of callbacks
	 */
	interface JQueryPromise<T> extends JQueryGenericPromise<T> {
		/**
		 * Determine the current state of a Deferred object.
		 */
		state(): string;
		/**
		 * Add handlers to be called when the Deferred object is either resolved or rejected.
		 *
		 * @param alwaysCallbacks1 A function, or array of functions, that is called when the Deferred is resolved or rejected.
		 * @param alwaysCallbacks2 Optional additional functions, or arrays of functions, that are called when the Deferred is resolved or rejected.
		 */
		always(alwaysCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[], ...alwaysCallbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>): JQueryPromise<T>;
		/**
		 * Add handlers to be called when the Deferred object is resolved.
		 *
		 * @param doneCallbacks1 A function, or array of functions, that are called when the Deferred is resolved.
		 * @param doneCallbacks2 Optional additional functions, or arrays of functions, that are called when the Deferred is resolved.
		 */
		done(doneCallback1?: JQueryPromiseCallback<T> | JQueryPromiseCallback<T>[], ...doneCallbackN: Array<JQueryPromiseCallback<T> | JQueryPromiseCallback<T>[]>): JQueryPromise<T>;
		/**
		 * Add handlers to be called when the Deferred object is rejected.
		 *
		 * @param failCallbacks1 A function, or array of functions, that are called when the Deferred is rejected.
		 * @param failCallbacks2 Optional additional functions, or arrays of functions, that are called when the Deferred is rejected.
		 */
		fail(failCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[], ...failCallbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>): JQueryPromise<T>;
		/**
		 * Add handlers to be called when the Deferred object generates progress notifications.
		 *
		 * @param progressCallbacks A function, or array of functions, to be called when the Deferred generates progress notifications.
		 */
		progress(progressCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[], ...progressCallbackN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any>[]>): JQueryPromise<T>;

		// Deprecated - given no typings
		pipe(doneFilter?: (x: any) => any, failFilter?: (x: any) => any, progressFilter?: (x: any) => any): JQueryPromise<any>;
	}

	export default function(query: string): any;
}
