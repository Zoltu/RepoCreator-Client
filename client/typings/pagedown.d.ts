declare module "pagedown" {
	export interface SanitizingConverter {
		makeHtml(markdown: string): string;
	}

	interface PageDownStatic {
		getSanitizingConverter(): SanitizingConverter;
	}

	var pagedown: PageDownStatic;
	export default pagedown;
}
