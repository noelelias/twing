/* istanbul ignore next */

import {TwingSource} from "./source";

export interface TwingLoaderInterface {
    TwingLoaderInterfaceImpl: TwingLoaderInterface;

    /**
     * Returns the source context for a given template logical name.
     *
     * @param {string} name The template logical name
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @returns TwingSource
     *
     * @throws TwingErrorLoader When name is not found
     */
    getSourceContext(name: string, from: TwingSource): TwingSource;

    /**
     * Gets the cache key to use for the cache for a given template name.
     *
     * @param {string} name The name of the template to load
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @returns string The cache key
     *
     * @throws TwingErrorLoader When name is not found
     */
    getCacheKey(name: string, from: TwingSource): string;

    /**
     * Returns true if the template is still fresh.
     *
     * @param {string} name The template name
     * @param {number} time Timestamp of the last modification time of the
     * cached template
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @returns boolean true if the template is fresh, false otherwise
     *
     * @throws TwingErrorLoader When name is not found
     */
    isFresh(name: string, time: number, from: TwingSource): boolean;

    /**
     * Check if we have the source code of a template, given its name.
     *
     * @param {string} name The name of the template to check if we can load
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @returns boolean If the template source code is handled by this loader or not
     */
    exists(name: string, from: TwingSource): boolean;

    /**
     * Resolve the path of a template, given its name, whatever it means in the context of the loader.
     *
     * @param {string} name The name of the template to resolve
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @returns {string} The resolved path of the template
     */
    resolve(name: string, from: TwingSource): string;
}
