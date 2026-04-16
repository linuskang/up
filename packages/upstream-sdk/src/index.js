"use strict";

const DEFAULT_SERVER_URL = "https://upstream.linus.my";

function normalizeServerUrl(serverUrl) {
	const raw = typeof serverUrl === "string" && serverUrl.trim().length > 0
		? serverUrl.trim()
		: DEFAULT_SERVER_URL;

	const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

	return withProtocol.replace(/\/+$/, "");
}

class UpstreamSDK {
	constructor(options) {
		if (!options || typeof options !== "object") {
			throw new Error("UpstreamSDK options are required");
		}

		const apiKey = typeof options.apiKey === "string" ? options.apiKey.trim() : "";

		if (!apiKey) {
			throw new Error("apiKey is required");
		}

		const configuredServerUrl =
			typeof options.server_url === "string" && options.server_url.trim().length > 0
				? options.server_url
				: options.serverUrl;

		this.apiKey = apiKey;
		this.serverUrl = normalizeServerUrl(configuredServerUrl);
		this.fetchImpl = options.fetch || globalThis.fetch;

		if (typeof this.fetchImpl !== "function") {
			throw new Error("fetch is not available. Pass a fetch function in options.fetch");
		}
	}

	async track(event) {
		if (!event || typeof event !== "object") {
			throw new Error("event payload is required");
		}

		if (typeof event.title !== "string" || event.title.trim().length === 0) {
			throw new Error("event.title is required");
		}

		const response = await this.fetchImpl(`${this.serverUrl}/api/v1/events`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify(event),
		});

		const payload = await safeJson(response);

		if (!response.ok) {
			throw new Error(payload.error || `Failed to create event (${response.status})`);
		}

		return payload.event;
	}

	async getEvents(options = {}) {
		const params = new URLSearchParams();

		if (options.limit !== undefined) {
			params.set("limit", String(options.limit));
		}

		if (typeof options.category === "string" && options.category.trim().length > 0) {
			params.set("category", options.category.trim());
		}

		if (typeof options.search === "string" && options.search.trim().length > 0) {
			params.set("search", options.search.trim());
		}

		const query = params.toString();
		const endpoint = `${this.serverUrl}/api/v1/events${query ? `?${query}` : ""}`;

		const response = await this.fetchImpl(endpoint, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
			},
		});

		const payload = await safeJson(response);

		if (!response.ok) {
			throw new Error(payload.error || `Failed to get events (${response.status})`);
		}

		return payload.events || [];
	}
}

async function safeJson(response) {
	try {
		return await response.json();
	} catch {
		return {};
	}
}

function createUpstream(options) {
	return new UpstreamSDK(options);
}

module.exports = {
	UpstreamSDK,
	createUpstream,
};
