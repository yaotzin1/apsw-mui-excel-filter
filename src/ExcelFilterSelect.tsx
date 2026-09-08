import * as React from 'react';
import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    InputAdornment,
    Popover,
    TextField,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SearchIcon from '@mui/icons-material/Search';
import { enUS } from './locales';
import type { ExcelFilterLabels, FilterOption } from './types';

export interface ExcelFilterSelectProps {
    options: FilterOption[];
    /**
     * The values currently filtered on. An empty array means "no filter", which is why the
     * popup then opens with every option ticked - see the note on `onChange`.
     */
    value: Array<string | number>;
    /**
     * Called on OK only, never while the popup is being edited.
     *
     * Emits an empty array when every option ends up ticked, because that says the same
     * thing as no filter and saves callers from comparing a full id list against their
     * option list to notice.
     */
    onChange: (value: string[]) => void;
    label?: string;
    helperText?: string;
    labels?: Partial<ExcelFilterLabels>;
    /** BCP 47 tag used for case folding while searching. Defaults to the runtime locale. */
    locale?: string;
    disabled?: boolean;
    /** Offer the "add current selection to filter" checkbox while searching. Default true. */
    allowAddToSelection?: boolean;
    /** Float the already-selected options to the top when the popup opens. Default true. */
    pinSelectedToTop?: boolean;
    /** Height of the scrolling option list, in px. Default 280. */
    maxListHeight?: number;
    /** Width of the closed field. Default 300. */
    width?: number | string;
    /** Height of the closed field. Default 32, to sit alongside dense filter toolbars. */
    height?: number | string;
    id?: string;
    name?: string;
    sx?: SxProps<Theme>;
}

const toKey = (value: string | number): string => String(value);

/** Collapsed summary of the closed field: one label, a count, or nothing at all. */
const summarize = (selected: FilterOption[], labels: ExcelFilterLabels): string => {
    if (selected.length === 0) return '';
    if (selected.length === 1) return selected[0]!.label;
    return labels.selectedCount(selected.length);
};

/**
 * The multiselect an Excel user expects: type to narrow the list, untick what you want
 * gone, confirm with OK.
 *
 * Three things separate it from an ordinary checkbox multiselect.
 *
 * An unfiltered field opens with everything ticked, the way an Excel AutoFilter dropdown
 * does, because filtering there is subtractive. That is a display convention only: the
 * value still speaks in "these ones", and an all-ticked list means no filter, so it is
 * emitted as an empty array rather than as every id in the list.
 *
 * The selection is staged. Nothing reaches `onChange` until OK, so a half-built selection
 * never triggers a request, and Cancel or Escape discards it.
 *
 * Typing does not merely hide rows: the matches become the selection. That is Excel's
 * search box. "Add current selection to filter" hands the selection back to the user - the
 * search then only narrows what is on screen - which is what makes a selection out of two
 * terms possible: tick what you want under the first term, type the second, tick again.
 */
export const ExcelFilterSelect: React.FC<ExcelFilterSelectProps> = ({
    options,
    value,
    onChange,
    label,
    helperText,
    labels: labelOverrides,
    locale,
    disabled = false,
    allowAddToSelection = true,
    pinSelectedToTop = true,
    maxListHeight = 280,
    width = 300,
    height = 32,
    id,
    name,
    sx,
}) => {
    const labels = React.useMemo<ExcelFilterLabels>(
        () => ({ ...enUS, ...labelOverrides }),
        [labelOverrides],
    );

    const anchorRef = React.useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [draftKeys, setDraftKeys] = React.useState<string[]>([]);
    const [pinnedKeys, setPinnedKeys] = React.useState<string[]>([]);
    const [addToSelection, setAddToSelection] = React.useState(false);

    const selectedKeys = React.useMemo(() => value.map(toKey), [value]);
    const optionKeys = React.useMemo(() => options.map((option) => toKey(option.value)), [options]);

    const summary = React.useMemo(() => {
        const selectedSet = new Set(selectedKeys);
        return summarize(options.filter((option) => selectedSet.has(toKey(option.value))), labels);
    }, [options, selectedKeys, labels]);

    const normalize = React.useCallback(
        (text: string) => text.trim().toLocaleLowerCase(locale),
        [locale],
    );

    const matches = React.useCallback(
        (option: FilterOption, needle: string) =>
            option.label.toLocaleLowerCase(locale).includes(needle),
        [locale],
    );

    // What the popup was showing before the search box took the selection over. Clearing
    // the search hands it back, so a mistyped search costs nothing.
    const preSearchKeys = React.useRef<string[]>([]);

    // Not guarded on `disabled`: the field itself is disabled, so neither the click nor the
    // key that would call this can reach it.
    const handleOpen = () => {
        // No filter set means "all", so open with the whole list ticked - unticking is how
        // you filter here. Pinning stays keyed to the real selection, so an unfiltered list
        // keeps its natural order instead of being pointlessly "pinned" in full.
        const initialKeys = selectedKeys.length > 0 ? selectedKeys : optionKeys;
        preSearchKeys.current = initialKeys;
        setDraftKeys(initialKeys);
        setPinnedKeys(selectedKeys);
        setSearch('');
        setOpen(true);
    };

    const handleCancel = () => setOpen(false);

    const handleApply = () => {
        setOpen(false);

        const draftSet = new Set(draftKeys);
        onChange(optionKeys.every((key) => draftSet.has(key)) ? [] : draftKeys);
    };

    /** The keys a term matches. */
    const matchingKeys = (needle: string): string[] =>
        options.filter((option) => matches(option, needle)).map((option) => toKey(option.value));

    const handleSearchChange = (nextSearch: string) => {
        setSearch(nextSearch);
        // While accumulating, the search only narrows what is on screen: the selection is
        // the user's to build, and nothing they ticked disappears because they typed.
        if (addToSelection) return;

        const needle = normalize(nextSearch);
        setDraftKeys(needle ? matchingKeys(needle) : preSearchKeys.current);
    };

    const handleAddToSelectionChange = (accumulate: boolean) => {
        setAddToSelection(accumulate);

        if (accumulate) {
            // The search has already replaced the selection by the time this checkbox can be
            // reached, so ticking it puts back what was ticked before the term was typed, and
            // from here the search only narrows the list.
            //
            // Unless everything was ticked, which says "no filter" rather than a selection
            // worth keeping - restoring it would undo the term the user is in the middle of.
            const before = new Set(preSearchKeys.current);
            if (!optionKeys.every((key) => before.has(key))) {
                setDraftKeys(preSearchKeys.current);
            }
            return;
        }
        // Back to a plain replace: the term on screen is the whole selection again.
        const needle = normalize(search);
        setDraftKeys(needle ? matchingKeys(needle) : preSearchKeys.current);
    };

    const visibleOptions = React.useMemo(() => {
        const needle = normalize(search);
        const matching = needle ? options.filter((option) => matches(option, needle)) : options;

        if (!pinSelectedToTop || pinnedKeys.length === 0) return matching;

        const pinned = new Set(pinnedKeys);
        return [
            ...matching.filter((option) => pinned.has(toKey(option.value))),
            ...matching.filter((option) => !pinned.has(toKey(option.value))),
        ];
    }, [options, search, pinnedKeys, pinSelectedToTop, normalize, matches]);

    const draftSet = React.useMemo(() => new Set(draftKeys), [draftKeys]);
    const visibleKeys = React.useMemo(
        () => visibleOptions.map((option) => toKey(option.value)),
        [visibleOptions],
    );

    const visibleSelectedCount = visibleKeys.filter((key) => draftSet.has(key)).length;
    const allVisibleSelected = visibleKeys.length > 0 && visibleSelectedCount === visibleKeys.length;
    const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;

    // A tick placed by hand outlives the search box that was open at the time: it becomes
    // the new base, so clearing the search keeps it instead of undoing it.
    const applyDraft = (next: string[]) => {
        preSearchKeys.current = next;
        setDraftKeys(next);
    };

    const toggleAllVisible = () => {
        if (allVisibleSelected) {
            const dropped = new Set(visibleKeys);
            applyDraft(draftKeys.filter((key) => !dropped.has(key)));
            return;
        }
        const next = new Set(draftKeys);
        visibleKeys.forEach((key) => next.add(key));
        applyDraft(Array.from(next));
    };

    const toggleOne = (key: string) => {
        applyDraft(
            draftSet.has(key) ? draftKeys.filter((item) => item !== key) : [...draftKeys, key],
        );
    };

    const searching = normalize(search).length > 0;

    return (
        <>
            <TextField
                ref={anchorRef}
                id={id}
                name={name}
                size="small"
                label={label}
                variant="outlined"
                helperText={helperText}
                value={summary}
                placeholder={labels.all}
                disabled={disabled}
                onClick={handleOpen}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
                        event.preventDefault();
                        handleOpen();
                    }
                }}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                    readOnly: true,
                    endAdornment: (
                        <InputAdornment position="end">
                            <ArrowDropDownIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
                inputProps={{ 'aria-haspopup': 'dialog', 'aria-expanded': open }}
                sx={[
                    {
                        width,
                        '& .MuiOutlinedInput-root': { height, cursor: 'pointer' },
                        '& .MuiOutlinedInput-input': {
                            cursor: 'pointer',
                            textOverflow: 'ellipsis',
                        },
                    },
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
            />
            <Popover
                open={open}
                anchorEl={anchorRef.current}
                onClose={handleCancel}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{
                    paper: {
                        sx: {
                            // Never narrower than the field it drops out of, and free to grow
                            // for long labels without running off a small screen.
                            minWidth: anchorRef.current?.clientWidth,
                            maxWidth: '90vw',
                            p: 1,
                        },
                    },
                }}
            >
                <TextField
                    size="small"
                    variant="outlined"
                    autoFocus
                    fullWidth
                    placeholder={labels.searchPlaceholder}
                    value={search}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    onKeyDown={(event) => {
                        // Type, hit Enter, list filtered - the shortcut Excel gives.
                        if (event.key === 'Enter' && draftKeys.length > 0) {
                            event.preventDefault();
                            handleApply();
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                    inputProps={{ 'aria-label': labels.searchPlaceholder }}
                    sx={{ '& .MuiOutlinedInput-root': { height: 32 } }}
                />
                <FormControlLabel
                    sx={{ display: 'flex', mt: 0.5, ml: 0 }}
                    control={
                        <Checkbox
                            size="small"
                            sx={{ p: 0.5, mr: 1 }}
                            checked={allVisibleSelected}
                            indeterminate={someVisibleSelected}
                            disabled={visibleKeys.length === 0}
                            onChange={toggleAllVisible}
                        />
                    }
                    label={searching ? labels.selectAllSearchResults : labels.selectAll}
                />
                {/* While searching, because with an empty box there is no term to add - and
                    whenever it is on, so a setting that outlives the popup stays visible and
                    can be turned off without typing something first. */}
                {allowAddToSelection && (searching || addToSelection) ? (
                    <FormControlLabel
                        sx={{ display: 'flex', ml: 0 }}
                        control={
                            <Checkbox
                                size="small"
                                sx={{ p: 0.5, mr: 1 }}
                                checked={addToSelection}
                                onChange={(event) =>
                                    handleAddToSelectionChange(event.target.checked)
                                }
                            />
                        }
                        label={labels.addCurrentSelectionToFilter}
                    />
                ) : null}
                <Divider />
                <Box sx={{ maxHeight: maxListHeight, overflowY: 'auto', mt: 0.5 }}>
                    {visibleOptions.length === 0 ? (
                        <Box sx={{ px: 1, py: 1, color: 'text.secondary' }}>{labels.noOptions}</Box>
                    ) : (
                        visibleOptions.map((option) => {
                            const key = toKey(option.value);
                            return (
                                <FormControlLabel
                                    key={key}
                                    sx={{ display: 'flex', ml: 0, mr: 0 }}
                                    control={
                                        <Checkbox
                                            size="small"
                                            sx={{ p: 0.5, mr: 1 }}
                                            checked={draftSet.has(key)}
                                            onChange={() => toggleOne(key)}
                                        />
                                    }
                                    label={option.label}
                                />
                            );
                        })
                    )}
                </Box>
                <Divider sx={{ mt: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
                    <Button size="small" onClick={handleCancel}>
                        {labels.cancel}
                    </Button>
                    {/* Excel greys OK out on an empty selection, and so must this: nothing
                        ticked would read as "show nothing", which no value can express. */}
                    <Button
                        size="small"
                        variant="contained"
                        disabled={draftKeys.length === 0}
                        onClick={handleApply}
                    >
                        {labels.ok}
                    </Button>
                </Box>
            </Popover>
        </>
    );
};
