/** One row of the dropdown. `value` is what the filter emits, `label` is what is shown. */
export interface FilterOption {
    value: string | number;
    label: string;
}

/**
 * Every string the component shows. Pass a partial `labels` prop to override any of them;
 * `enUS` and `plPL` ship with the package.
 */
export interface ExcelFilterLabels {
    /** Header checkbox while the search box is empty. */
    selectAll: string;
    /** Replaces `selectAll` while a search narrows the list. */
    selectAllSearchResults: string;
    /** Turns a search from "replace the selection" into "add to it". */
    addCurrentSelectionToFilter: string;
    searchPlaceholder: string;
    ok: string;
    cancel: string;
    /** Shown in place of the list when nothing matches. */
    noOptions: string;
    /** Placeholder of the closed field while nothing is filtered out. */
    all: string;
    /** Summary of the closed field once more than one option is selected. */
    selectedCount: (count: number) => string;
}
