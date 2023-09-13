/* @odoo-module */

import { registerCleanup } from "@web/../tests/helpers/cleanup";
import {
    click as webClick,
    getFixture,
    makeDeferred,
    triggerEvents as webTriggerEvents,
} from "@web/../tests/helpers/utils";
import { file } from "@web/../tests/legacy/helpers/test_utils";
import { createFile as createFile2 } from "@web/../tests/legacy/helpers/test_utils_file";
const { inputFiles: webInputFiles } = file;

export const createFile = createFile2;

/**
 * Create a fake object 'dataTransfer', linked to some files,
 * which is passed to drag and drop events.
 *
 * @param {Object[]} files
 * @returns {Object}
 */
function createFakeDataTransfer(files) {
    return {
        dropEffect: "all",
        effectAllowed: "all",
        files,
        items: [],
        types: ["Files"],
    };
}

/**
 * Waits until exactly one element matching the given `selector` is present in
 * `options.target` and then clicks on it.
 *
 * @param {string} selector
 * @param {ContainsOptions} [options] forwarded to `contains`
 * @param {boolean} [options.shiftKey]
 */
export async function click(selector, options = {}) {
    const { shiftKey } = options;
    delete options.shiftKey;
    await contains(selector, { click: { shiftKey }, ...options });
}

/**
 * Waits until exactly one element matching the given `selector` is present in
 * `options.target` and then drags `files` on it.
 *
 * @param {string} selector
 * @param {Object[]} files
 * @param {ContainsOptions} [options] forwarded to `contains`
 */
export async function dragenterFiles(selector, files, options) {
    await contains(selector, { dragenterFiles: files, ...options });
}

/**
 * Waits until exactly one element matching the given `selector` is present in
 * `options.target` and then drops `files` on it.
 *
 * @param {string} selector
 * @param {Object[]} files
 * @param {ContainsOptions} [options] forwarded to `contains`
 */
export async function dropFiles(selector, files, options) {
    await contains(selector, { dropFiles: files, ...options });
}

/**
 * Waits until exactly one element matching the given `selector` is present in
 * `options.target` and then inputs `files` on it.
 *
 * @param {string} selector
 * @param {Object[]} files
 * @param {ContainsOptions} [options] forwarded to `contains`
 */
export async function inputFiles(selector, files, options) {
    await contains(selector, { inputFiles: files, ...options });
}

/**
 * Waits until exactly one element matching the given `selector` is present in
 * `options.target` and then pastes `files` on it.
 *
 * @param {string} selector
 * @param {Object[]} files
 * @param {ContainsOptions} [options] forwarded to `contains`
 */
export async function pasteFiles(selector, files, options) {
    await contains(selector, { pasteFiles: files, ...options });
}

/**
 * Waits until exactly one element matching the given `selector` is present in
 * `options.target` and then focuses on it.
 *
 * @param {string} selector
 * @param {ContainsOptions} [options] forwarded to `contains`
 */
export async function focus(selector, options) {
    await contains(selector, { setFocus: true, ...options });
}

/**
 * Waits until exactly one element matching the given `selector` is present in
 * `options.target` and then inserts the given `content`.
 *
 * @param {string} selector
 * @param {string} content
 * @param {ContainsOptions} [options] forwarded to `contains`
 * @param {boolean} [options.replace=false]
 */
export async function insertText(selector, content, options = {}) {
    const { replace = false } = options;
    delete options.replace;
    await contains(selector, { ...options, insertText: { content, replace } });
}

/**
 * Waits until exactly one element matching the given `selector` is present in
 * `options.target` and then sets its `scrollTop` to the given value.
 *
 * @param {string} selector
 * @param {number|"bottom"} scrollTop
 * @param {ContainsOptions} [options] forwarded to `contains`
 */
export async function scroll(selector, scrollTop, options) {
    await contains(selector, { setScroll: scrollTop, ...options });
}

/**
 * Waits until exactly one element matching the given `selector` is present in
 * `options.target` and then triggers `event` on it.
 *
 * @param {string} selector
 * @param {string[]} events
 * @param {ContainsOptions} [options] forwarded to `contains`
 */
export async function triggerEvents(selector, events, options) {
    await contains(selector, { triggerEvents: events, ...options });
}

let hasUsedContainsPositively = false;
QUnit.testStart(() => (hasUsedContainsPositively = false));
/**
 * @typedef {Object} ContainsOptions
 * @property {[string, ContainsOptions]} [after] if provided, the found element(s) must be after the
 *  element matched by this param.
 * @property {[string, ContainsOptions]} [before] if provided, the found element(s) must be before the
 *  element matched by this param.
 * @property {Object} [click] if provided, clicks on the first found element
 * @property {[string, ContainsOptions]} [contains] if provided, a sub-contains check will be applied
 *  having the result of the main contains as target. The first param is the sub-selector, and the
 *  secound param are options to forward to the sub-call. Having sub-contains only makes sense with
 *  a count of 1.
 * @property {Array<[string, ContainsOptions]>} [containsMulti] similar than contains param but with
 *  multiple rules that have to match at the same time.
 * @property {number} [count=1] numbers of elements to be found to declare the contains check
 *  as successful. Elements are counted after applying all other filters.
 * @property {Object[]} [dragenterFiles] if provided, drags the given files on the found element
 * @property {Object[]} [dropFiles] if provided, drops the given files on the found element
 * @property {Object[]} [inputFiles] if provided, inputs the given files on the found element
 * @property {{content:string, replace:boolean}} [insertText] if provided, adds to (or replace) the
 *  value of the first found element by the given content.
 * @property {[string, ContainsOptions]} [parent] if provided, the found element(s) must have as
 *  parent the node matching the parent parameter.
 * @property {Object[]} [pasteFiles] if provided, pastes the given files on the found element
 * @property {number|"bottom"} [scroll] if provided, the scrollTop of the found element(s)
 *  must match.
 *  Note: when using one of the scrollTop options, it is advised to ensure the height is not going
 *  to change soon, by checking with a preceding contains that all the expected elements are in DOM.
 * @property {boolean} [setFocus] if provided, focuses the first found element.
 * @property {number|"bottom"} [setScroll] if provided, sets the scrollTop on the first found
 *  element.
 * @property {HTMLElement} [target=getFixture()]
 * @property {string[]} [triggerEvents] if provided, triggers the given events on the found element
 * @property {string} [text] if provided, the textContent of the found element(s) must match.
 * @property {string} [value] if provided, the input value of the found element(s) must match.
 *  Note: value changes are not observed directly, another mutation must happen to catch them.
 */
class Contains {
    /**
     * @param {string} selector
     * @param {ContainsOptions} [options={}]
     */
    constructor(selector, options = {}) {
        this.selector = selector;
        this.options = options;
        this.options.count ??= 1;
        this.options.targetParam = this.options.target;
        this.options.target ??= getFixture();
        let selectorMessage = `${this.options.count} of "${this.selector}"`;
        if (this.options.targetParam) {
            selectorMessage = `${selectorMessage} inside a specific target`;
        }
        if (this.options.parent) {
            selectorMessage = `${selectorMessage} inside a specific parent`;
        }
        if (this.options.contains) {
            selectorMessage = `${selectorMessage} with a specified sub-contains`;
        }
        if (this.options.containsMulti) {
            selectorMessage = `${selectorMessage} with multiple specified sub-contains`;
        }
        if (this.options.text !== undefined) {
            selectorMessage = `${selectorMessage} with text "${this.options.text}"`;
        }
        if (this.options.value !== undefined) {
            selectorMessage = `${selectorMessage} with value "${this.options.value}"`;
        }
        if (this.options.scroll !== undefined) {
            selectorMessage = `${selectorMessage} with scroll "${this.options.scroll}"`;
        }
        if (this.options.after !== undefined) {
            selectorMessage = `${selectorMessage} after a specified element`;
        }
        if (this.options.before !== undefined) {
            selectorMessage = `${selectorMessage} before a specified element`;
        }
        this.selectorMessage = selectorMessage;
        this.options.containsMulti ??= [];
        if (this.options.contains !== undefined) {
            this.options.containsMulti.push(this.options.contains);
        }
        if (this.options.count) {
            hasUsedContainsPositively = true;
        } else if (!hasUsedContainsPositively) {
            throw new Error(
                `Starting a test with "contains" of count 0 for selector "${this.selector}" is useless because it might immediately resolve. Start the test by checking that an expected element actually exists.`
            );
        }
        /** @type {string} */
        this.successMessage = undefined;
        /** @type {function} */
        this.executeError = undefined;
    }

    /**
     * Starts this contains check, either immediately resolving if there is a
     * match, or registering appropriate listeners and waiting until there is a
     * match or a timeout (resolving or rejecting respectively).
     *
     * Success or failure messages will be logged with QUnit as well.
     *
     * @returns {Promise}
     */
    run() {
        this.done = false;
        this.def = makeDeferred();
        this.scrollListeners = new Set();
        this.onScroll = () => this.runOnce("after scroll");
        if (!this.runOnce("immediately")) {
            this.timer = setTimeout(
                () => this.runOnce("Timeout of 5 seconds", { crashOnFail: true }),
                5000
            );
            this.observer = new MutationObserver((mutations) => {
                try {
                    this.runOnce("after mutations");
                } catch (e) {
                    this.def.reject(e); // prevents infinite loop in case of programming error
                }
            });
            this.observer.observe(document.body, {
                attributes: true,
                childList: true,
                subtree: true,
            });
            registerCleanup(() => {
                if (!this.done) {
                    this.runOnce("Test ended", { crashOnFail: true });
                }
            });
        }
        return this.def;
    }

    /**
     * Runs this contains check once, immediately returning the result (or
     * undefined), and possibly resolving or rejecting the main promise
     * (and printing QUnit log) depending on options.
     * If undefined is returned it means the check was not successful.
     *
     * @param {string} whenMessage
     * @param {Object} [options={}]
     * @param {boolean} [options.crashOnFail=false]
     * @param {boolean} [options.executeOnSuccess=true]
     * @returns {HTMLElement[]|undefined}
     */
    runOnce(whenMessage, { crashOnFail = false, executeOnSuccess = true } = {}) {
        const res = this.select();
        if (res?.length === this.options.count || crashOnFail) {
            // clean before doing anything else to avoid infinite loop due to side effects
            this.observer?.disconnect();
            clearTimeout(this.timer);
            for (const el of this.scrollListeners ?? []) {
                el.removeEventListener("scroll", this.onScroll);
            }
            this.done = true;
        }
        if (res?.length === this.options.count) {
            this.successMessage = `Found ${this.selectorMessage} (${whenMessage})`;
            if (executeOnSuccess) {
                this.executeAction(res[0]);
            }
            return res;
        } else {
            this.executeError = () => {
                let message = `Failed to find ${this.selectorMessage} (${whenMessage}).`;
                message = res
                    ? `${message} Found ${res.length} instead.`
                    : `${message} Parent not found.`;
                if (this.parentContains) {
                    if (this.parentContains.successMessage) {
                        QUnit.assert.ok(true, this.parentContains.successMessage);
                    } else {
                        this.parentContains.executeError();
                    }
                }
                QUnit.assert.ok(false, message);
                this.def?.reject(new Error(message));
                for (const childContains of this.childrenContains || []) {
                    if (childContains.successMessage) {
                        QUnit.assert.ok(true, childContains.successMessage);
                    } else {
                        childContains.executeError();
                    }
                }
            };
            if (crashOnFail) {
                this.executeError();
            }
        }
    }

    /**
     * Executes the action(s) given to this constructor on the found element,
     * prints the success messages, and resolves the main deferred.
     
     * @param {HTMLElement} el
     */
    executeAction(el) {
        let message = this.successMessage;
        if (this.options.click) {
            message = `${message} and clicked it`;
            webClick(el, undefined, {
                mouseEventInit: this.options.click,
                skipDisabledCheck: true,
                skipVisibilityCheck: true,
            });
        }
        if (this.options.dragenterFiles) {
            message = `${message} and dragged ${this.options.dragenterFiles.length} file(s)`;
            const ev = new Event("dragenter", { bubbles: true });
            Object.defineProperty(ev, "dataTransfer", {
                value: createFakeDataTransfer(this.options.dragenterFiles),
            });
            el.dispatchEvent(ev);
        }
        if (this.options.dropFiles) {
            message = `${message} and dropped ${this.options.dropFiles.length} file(s)`;
            const ev = new Event("drop", { bubbles: true });
            Object.defineProperty(ev, "dataTransfer", {
                value: createFakeDataTransfer(this.options.dropFiles),
            });
            el.dispatchEvent(ev);
        }
        if (this.options.inputFiles) {
            message = `${message} and inputted ${this.options.inputFiles.length} file(s)`;
            webInputFiles(el, this.options.inputFiles);
        }
        if (this.options.insertText !== undefined) {
            message = `${message} and inserted text "${this.options.insertText.content}" (replace: ${this.options.insertText.replace})`;
            el.focus();
            if (this.options.insertText.replace) {
                el.value = "";
                el.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Backspace" }));
                el.dispatchEvent(new window.KeyboardEvent("keyup", { key: "Backspace" }));
                el.dispatchEvent(new window.InputEvent("input"));
                el.dispatchEvent(new window.InputEvent("change"));
            }
            for (const char of this.options.insertText.content) {
                el.value += char;
                el.dispatchEvent(new window.KeyboardEvent("keydown", { key: char }));
                el.dispatchEvent(new window.KeyboardEvent("keyup", { key: char }));
                el.dispatchEvent(new window.InputEvent("input"));
                el.dispatchEvent(new window.InputEvent("change"));
            }
        }
        if (this.options.pasteFiles) {
            message = `${message} and pasted ${this.options.pasteFiles.length} file(s)`;
            const ev = new Event("paste", { bubbles: true });
            Object.defineProperty(ev, "clipboardData", {
                value: createFakeDataTransfer(this.options.pasteFiles),
            });
            el.dispatchEvent(ev);
        }
        if (this.options.setFocus) {
            message = `${message} and focused it`;
            el.focus();
        }
        if (this.options.setScroll !== undefined) {
            message = `${message} and set scroll to "${this.options.setScroll}"`;
            el.scrollTop =
                this.options.setScroll === "bottom" ? el.scrollHeight : this.options.setScroll;
        }
        if (this.options.triggerEvents) {
            message = `${message} and triggered "${this.options.triggerEvents.join(", ")}" events`;
            webTriggerEvents(el, null, this.options.triggerEvents, {
                skipVisibilityCheck: true,
            });
        }
        if (this.parentContains) {
            QUnit.assert.ok(true, this.parentContains.successMessage);
        }
        QUnit.assert.ok(true, message);
        for (const childContains of this.childrenContains) {
            QUnit.assert.ok(true, childContains.successMessage);
        }
        this.def?.resolve();
    }

    /**
     * Returns the found element(s) according to this constructor setup.
     * If undefined is returned it means the parent cannot be found
     *
     * @returns {HTMLElement[]|undefined}
     */
    select() {
        const target = this.selectParent();
        if (!target) {
            return;
        }
        /** @type HTMLElement[] */
        let baseRes;
        try {
            baseRes = [...target.querySelectorAll(this.selector)];
        } catch (error) {
            if (error.message.includes("Failed to execute 'querySelectorAll'")) {
                // keep jquery for backwards compatibility until all tests are converted
                baseRes = [...$(target).find(this.selector)];
            } else {
                throw error;
            }
        }
        /** @type {Contains[]} */
        this.childrenContains = [];
        const res = baseRes.filter((el, currentIndex) => {
            let condition =
                (this.options.text === undefined || el.textContent.trim() === this.options.text) &&
                (this.options.value === undefined || el.value === this.options.value) &&
                (this.options.scroll === undefined ||
                    (this.options.scroll === "bottom"
                        ? Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) <= 1
                        : Math.abs(el.scrollTop - this.options.scroll) <= 1));
            for (const param of this.options.containsMulti) {
                const childContains = new Contains(param[0], { ...param[1], target: el });
                if (
                    !childContains.runOnce(`as child of el ${currentIndex + 1})`, {
                        executeOnSuccess: false,
                    })
                ) {
                    condition = false;
                }
                this.childrenContains.push(childContains);
            }
            if (condition && this.options.after) {
                // avoid checking if condition already failed to avoid uncessary slowness
                const afterContains = new Contains(this.options.after[0], {
                    ...this.options.after[1],
                    target,
                });
                const afterEl = afterContains.runOnce(`as "after"`, {
                    executeOnSuccess: false,
                })?.[0];
                if (
                    !afterEl ||
                    !(el.compareDocumentPosition(afterEl) & Node.DOCUMENT_POSITION_PRECEDING)
                ) {
                    condition = false;
                }
                this.childrenContains.push(afterContains);
            }
            if (condition && this.options.before) {
                // avoid checking if condition already failed to avoid uncessary slowness
                const beforeContains = new Contains(this.options.before[0], {
                    ...this.options.before[1],
                    target,
                });
                const beforeEl = beforeContains.runOnce(`as "before"`, {
                    executeOnSuccess: false,
                })?.[0];
                if (
                    !beforeEl ||
                    !(el.compareDocumentPosition(beforeEl) & Node.DOCUMENT_POSITION_FOLLOWING)
                ) {
                    condition = false;
                }
                this.childrenContains.push(beforeContains);
            }
            return condition;
        });
        if (
            this.options.scroll !== undefined &&
            this.scrollListeners &&
            baseRes.length === this.options.count &&
            res.length !== this.options.count
        ) {
            for (const el of baseRes) {
                if (!this.scrollListeners.has(el)) {
                    this.scrollListeners.add(el);
                    el.addEventListener("scroll", this.onScroll);
                }
            }
        }
        return res;
    }

    /**
     * Returns the found element that should act as the target (parent) for the
     * main selector.
     * If undefined is returned it means the parent cannot be found.
     *
     * @returns {HTMLElement|undefined}
     */
    selectParent() {
        if (this.options.parent) {
            this.parentContains = new Contains(this.options.parent[0], {
                ...this.options.parent[1],
                target: this.options.target,
            });
            return this.parentContains.runOnce(`as parent`, { executeOnSuccess: false })?.[0];
        }
        return this.options.target;
    }
}

/**
 * Waits until `count` elements matching the given `selector` are present in
 * `options.target`.
 *
 * @param {string} selector
 * @param {ContainsOptions} [options]
 * @returns {Promise}
 */
export async function contains(selector, options) {
    await new Contains(selector, options).run();
}
