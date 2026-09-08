import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExcelFilterSelect, plPL } from '../src';
import type { ExcelFilterSelectProps, FilterOption } from '../src';

const OPTIONS: FilterOption[] = [
    { value: '1', label: 'Pump' },
    { value: '2', label: 'Pump station' },
    { value: '3', label: 'Motor' },
    { value: '4', label: 'Drill' },
];

const ALL_KEYS = OPTIONS.map((option) => String(option.value));

type HarnessProps = Partial<Omit<ExcelFilterSelectProps, 'onChange'>> & {
    initial?: Array<string | number>;
    onChange?: (value: string[]) => void;
};

/** Controlled wrapper, because the component only ever emits on OK. */
const Harness: React.FC<HarnessProps> = ({ initial = [], onChange, ...props }) => {
    const [value, setValue] = React.useState<Array<string | number>>(initial);

    return (
        <ExcelFilterSelect
            label="Kind"
            options={OPTIONS}
            {...props}
            value={value}
            onChange={(next) => {
                setValue(next);
                onChange?.(next);
            }}
        />
    );
};

const setup = (props: HarnessProps = {}) => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness {...props} onChange={onChange} />);
    return { user, onChange };
};

const trigger = () => screen.getByLabelText('Kind');
const searchBox = (name = 'Search...') => screen.getByRole('textbox', { name });
const okButton = (name = 'OK') => screen.getByRole('button', { name });
const cancelButton = (name = 'Cancel') => screen.getByRole('button', { name });
const box = (name: string) => screen.getByRole('checkbox', { name });
const optionNames = () =>
    screen
        .getAllByRole('checkbox')
        .map((element) => element.getAttribute('aria-label') ?? element.closest('label')?.textContent)
        .filter((name): name is string => Boolean(name));

const openPopup = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(trigger());
    await screen.findByRole('textbox', { name: 'Search...' });
};

describe('closed field', () => {
    it('shows the label and an "All" placeholder while nothing is filtered', () => {
        setup();

        expect(trigger()).toHaveValue('');
        expect(trigger()).toHaveAttribute('placeholder', 'All');
        expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('names a single selected option', () => {
        setup({ initial: ['3'] });

        expect(trigger()).toHaveValue('Motor');
    });

    it('counts a selection of more than one', () => {
        setup({ initial: ['1', '3'] });

        expect(trigger()).toHaveValue('2 selected');
    });

    it('ignores values that match no option', () => {
        setup({ initial: ['999'] });

        expect(trigger()).toHaveValue('');
    });
});

describe('opening', () => {
    it('opens on click with every option ticked when no filter is set', async () => {
        const { user } = setup();
        await openPopup(user);

        OPTIONS.forEach((option) => expect(box(option.label)).toBeChecked());
        expect(box('Select All')).toBeChecked();
        expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    });

    it.each(['{Enter}', ' ', '{ArrowDown}'])('opens from the keyboard with %s', async (key) => {
        const { user } = setup();
        act(() => trigger().focus());
        await user.keyboard(key);

        expect(await screen.findByRole('textbox', { name: 'Search...' })).toBeInTheDocument();
    });

    it('stays closed for keys that are not an open gesture', async () => {
        const { user } = setup();
        act(() => trigger().focus());
        await user.keyboard('{Escape}');

        expect(screen.queryByRole('textbox', { name: 'Search...' })).not.toBeInTheDocument();
    });

    it('does not open while disabled', async () => {
        const { user } = setup({ disabled: true });
        await user.click(trigger());

        expect(screen.queryByRole('textbox', { name: 'Search...' })).not.toBeInTheDocument();
    });

    it('opens a filtered field on its own selection, with the rest unticked', async () => {
        const { user } = setup({ initial: ['3'] });
        await openPopup(user);

        expect(box('Motor')).toBeChecked();
        expect(box('Pump')).not.toBeChecked();
        expect(box('Select All')).toHaveAttribute('data-indeterminate', 'true');
    });

    it('floats the selected options to the top', async () => {
        const { user } = setup({ initial: ['4'] });
        await openPopup(user);

        expect(optionNames()).toEqual([
            'Select All',
            'Drill',
            'Pump',
            'Pump station',
            'Motor',
        ]);
    });

    it('keeps the natural order when pinning is turned off', async () => {
        const { user } = setup({ initial: ['4'], pinSelectedToTop: false });
        await openPopup(user);

        expect(optionNames()).toEqual([
            'Select All',
            'Pump',
            'Pump station',
            'Motor',
            'Drill',
        ]);
    });
});

describe('applying and discarding', () => {
    it('emits the remaining options when one is unticked', async () => {
        const { user, onChange } = setup();
        await openPopup(user);

        await user.click(box('Motor'));
        await user.click(okButton());

        expect(onChange).toHaveBeenCalledWith(['1', '2', '4']);
    });

    it('adds an option that was not part of the filter', async () => {
        const { user, onChange } = setup({ initial: ['3'] });
        await openPopup(user);

        await user.click(box('Pump'));
        await user.click(okButton());

        expect(onChange).toHaveBeenCalledWith(['3', '1']);
    });

    it('emits an empty selection when everything ends up ticked', async () => {
        const { user, onChange } = setup({ initial: ['3'] });
        await openPopup(user);

        await user.click(box('Select All'));
        await user.click(okButton());

        expect(onChange).toHaveBeenCalledWith([]);
    });

    it('disables OK while nothing is ticked', async () => {
        const { user, onChange } = setup();
        await openPopup(user);

        await user.click(box('Select All'));

        OPTIONS.forEach((option) => expect(box(option.label)).not.toBeChecked());
        expect(okButton()).toBeDisabled();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('discards the draft on Cancel', async () => {
        const { user, onChange } = setup();
        await openPopup(user);

        await user.click(box('Motor'));
        await user.click(cancelButton());

        await waitFor(() => expect(screen.queryByRole('button', { name: 'OK' })).toBeNull());
        expect(onChange).not.toHaveBeenCalled();
        expect(trigger()).toHaveValue('');
    });

    it('discards the draft on Escape', async () => {
        const { user, onChange } = setup();
        await openPopup(user);

        await user.click(box('Motor'));
        await user.keyboard('{Escape}');

        await waitFor(() => expect(screen.queryByRole('button', { name: 'OK' })).toBeNull());
        expect(onChange).not.toHaveBeenCalled();
    });

    it('emits string keys for numeric option values', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <ExcelFilterSelect
                label="Kind"
                options={[
                    { value: 1, label: 'One' },
                    { value: 2, label: 'Two' },
                ]}
                value={[]}
                onChange={onChange}
            />,
        );

        await openPopup(user);
        await user.click(box('Two'));
        await user.click(okButton());

        expect(onChange).toHaveBeenCalledWith(['1']);
    });
});

describe('search', () => {
    it('narrows the list and makes the matches the selection', async () => {
        const { user } = setup();
        await openPopup(user);

        await user.type(searchBox(), 'pump');

        expect(box('Pump')).toBeChecked();
        expect(box('Pump station')).toBeChecked();
        expect(screen.queryByRole('checkbox', { name: 'Motor' })).not.toBeInTheDocument();
        expect(box('Select All Search Results')).toBeChecked();
    });

    it('filters to exactly what was typed', async () => {
        const { user, onChange } = setup();
        await openPopup(user);

        await user.type(searchBox(), 'pump');
        await user.click(okButton());

        expect(onChange).toHaveBeenCalledWith(['1', '2']);
    });

    it('applies on Enter', async () => {
        const { user, onChange } = setup();
        await openPopup(user);

        await user.type(searchBox(), 'motor{Enter}');

        expect(onChange).toHaveBeenCalledWith(['3']);
    });

    it('ignores Enter while nothing is ticked', async () => {
        const { user, onChange } = setup();
        await openPopup(user);

        await user.type(searchBox(), 'pump');
        await user.click(box('Select All Search Results'));
        await user.keyboard('{Enter}');

        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
    });

    it('reports when nothing matches', async () => {
        const { user } = setup();
        await openPopup(user);

        await user.type(searchBox(), 'zzz');

        expect(screen.getByText('No options')).toBeInTheDocument();
        expect(box('Select All Search Results')).toBeDisabled();
        expect(okButton()).toBeDisabled();
    });

    it('matches regardless of case, in the given locale', async () => {
        const { user } = setup({ locale: 'pl' });
        await openPopup(user);

        await user.type(searchBox(), 'MOTOR');

        expect(box('Motor')).toBeChecked();
        expect(screen.queryByRole('checkbox', { name: 'Drill' })).not.toBeInTheDocument();
    });

    it('restores the pre-search selection when the box is cleared', async () => {
        const { user } = setup({ initial: ['4'] });
        await openPopup(user);

        await user.type(searchBox(), 'pump');
        await user.clear(searchBox());

        expect(box('Drill')).toBeChecked();
        expect(box('Pump')).not.toBeChecked();
        expect(box('Select All')).toBeInTheDocument();
    });

    it('keeps a tick placed by hand when the search is cleared', async () => {
        const { user } = setup({ initial: ['4'] });
        await openPopup(user);

        await user.type(searchBox(), 'pump');
        await user.click(box('Pump station'));
        await user.clear(searchBox());

        // The hand-placed change banks itself, so clearing does not take it back - and it
        // banks the search result along with it, which is why Drill is gone.
        expect(box('Pump')).toBeChecked();
        expect(box('Pump station')).not.toBeChecked();
        expect(box('Drill')).not.toBeChecked();
    });

    it('toggles only the visible matches with select-all', async () => {
        const { user } = setup();
        await openPopup(user);

        await user.type(searchBox(), 'pump');
        await user.click(box('Select All Search Results'));

        expect(box('Pump')).not.toBeChecked();
        expect(okButton()).toBeDisabled();

        await user.click(box('Select All Search Results'));

        expect(box('Pump')).toBeChecked();
        expect(box('Pump station')).toBeChecked();
    });
});

describe('add current selection to filter', () => {
    it('is offered only while searching', async () => {
        const { user } = setup();
        await openPopup(user);

        expect(
            screen.queryByRole('checkbox', { name: 'Add current selection to filter' }),
        ).not.toBeInTheDocument();

        await user.type(searchBox(), 'pump');

        expect(box('Add current selection to filter')).toBeInTheDocument();
    });

    it('can be turned off entirely', async () => {
        const { user } = setup({ allowAddToSelection: false });
        await openPopup(user);

        await user.type(searchBox(), 'pump');

        expect(
            screen.queryByRole('checkbox', { name: 'Add current selection to filter' }),
        ).not.toBeInTheDocument();
    });

    it('combines a selection built out of two terms', async () => {
        const { user, onChange } = setup();
        await openPopup(user);

        await user.type(searchBox(), 'pump');
        await user.click(box('Pump station'));
        await user.click(box('Add current selection to filter'));
        await user.clear(searchBox());
        await user.type(searchBox(), 'motor');

        // The second term ticks nothing on its own: the selection is the user's now.
        expect(box('Motor')).not.toBeChecked();

        await user.click(box('Motor'));
        await user.click(okButton());

        expect(onChange).toHaveBeenCalledWith(['1', '3']);
    });

    it('keeps the ticks that are off screen while a term is showing', async () => {
        const { user, onChange } = setup();
        await openPopup(user);

        await user.type(searchBox(), 'pump');
        await user.click(box('Add current selection to filter'));
        await user.clear(searchBox());
        await user.type(searchBox(), 'drill');

        expect(box('Drill')).not.toBeChecked();
        expect(screen.queryByRole('checkbox', { name: 'Pump' })).not.toBeInTheDocument();

        await user.click(okButton());

        expect(onChange).toHaveBeenCalledWith(['1', '2']);
    });

    it('does not drag a half-typed term into the selection', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <ExcelFilterSelect
                label="Kind"
                options={[
                    { value: '1', label: 'NDT' },
                    { value: '2', label: 'Nut' },
                    { value: '3', label: 'Bolt' },
                ]}
                value={[]}
                onChange={onChange}
            />,
        );

        await openPopup(user);
        await user.type(searchBox(), 'ndt');
        await user.click(box('Add current selection to filter'));
        // Backspacing walks back through "nd" and "n", and "n" matches Nut as well.
        await user.type(searchBox(), '{Backspace>3/}');

        expect(box('NDT')).toBeChecked();
        expect(box('Nut')).not.toBeChecked();
        expect(box('Bolt')).not.toBeChecked();
    });

    it('goes back to replacing when unticked', async () => {
        const { user, onChange } = setup();
        await openPopup(user);

        await user.type(searchBox(), 'pump');
        await user.click(box('Add current selection to filter'));
        await user.clear(searchBox());
        await user.type(searchBox(), 'motor');
        await user.click(box('Add current selection to filter'));

        // Unticking drops the pumps it was being added to: this term is the selection again.
        expect(box('Motor')).toBeChecked();

        await user.click(okButton());

        expect(onChange).toHaveBeenCalledWith(['3']);
    });

    it('puts back the selection the search had replaced', async () => {
        const { user, onChange } = setup({ initial: ['4'] });
        await openPopup(user);

        await user.type(searchBox(), 'pump');

        // The search got there first, which is the whole reason the option has to undo it.
        expect(box('Pump')).toBeChecked();

        await user.click(box('Add current selection to filter'));

        expect(box('Pump')).not.toBeChecked();

        await user.click(box('Pump station'));
        await user.click(okButton());

        expect(onChange).toHaveBeenCalledWith(['4', '2']);
    });

    it('leaves an all-ticked field alone, having nothing to put back', async () => {
        const { user } = setup();
        await openPopup(user);

        await user.type(searchBox(), 'pump');
        await user.click(box('Add current selection to filter'));

        // "Everything" is not a selection worth restoring, so the term survives.
        expect(box('Pump')).toBeChecked();
        expect(box('Pump station')).toBeChecked();
    });

    it('stays ticked the next time the popup opens', async () => {
        const { user } = setup();
        await openPopup(user);

        await user.type(searchBox(), 'pump');
        await user.click(box('Add current selection to filter'));
        await user.click(okButton());
        await waitFor(() => expect(screen.queryByRole('button', { name: 'OK' })).toBeNull());

        await openPopup(user);

        // Visible without typing, because it is on and the user has to be able to see that.
        expect(box('Add current selection to filter')).toBeChecked();

        await user.type(searchBox(), 'motor');

        expect(box('Motor')).not.toBeChecked();
    });

    it('can be turned off without a term on screen', async () => {
        const { user } = setup({ initial: ['4'] });
        await openPopup(user);

        await user.type(searchBox(), 'pump');
        await user.click(box('Add current selection to filter'));
        await user.clear(searchBox());
        await user.click(box('Add current selection to filter'));

        // With no term and the option off, there is nothing left for it to say.
        expect(
            screen.queryByRole('checkbox', { name: 'Add current selection to filter' }),
        ).not.toBeInTheDocument();
        expect(box('Drill')).toBeChecked();
    });
});

describe('customisation', () => {
    it('takes a full label set', async () => {
        const user = userEvent.setup();
        render(
            <ExcelFilterSelect
                label="Rodzaj"
                options={OPTIONS}
                value={['1', '3']}
                onChange={vi.fn()}
                labels={plPL}
            />,
        );

        expect(screen.getByLabelText('Rodzaj')).toHaveValue('Wybrano: 2');

        await user.click(screen.getByLabelText('Rodzaj'));
        await screen.findByRole('textbox', { name: 'Szukaj...' });

        expect(screen.getByRole('checkbox', { name: 'Zaznacz wszystko' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Anuluj' })).toBeInTheDocument();

        await user.type(screen.getByRole('textbox', { name: 'Szukaj...' }), 'zzz');

        expect(screen.getByText('Brak opcji')).toBeInTheDocument();
        expect(
            screen.getByRole('checkbox', { name: 'Dodaj bieżące zaznaczenie do filtru' }),
        ).toBeInTheDocument();
    });

    it('overrides single labels and leaves the rest in English', async () => {
        const { user } = setup({ labels: { ok: 'Apply' } });
        await openPopup(user);

        expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('passes through presentation props', async () => {
        const { user } = setup({
            id: 'kind-filter',
            name: 'kind',
            helperText: 'Pick a kind',
            maxListHeight: 120,
            width: 240,
            height: 40,
            sx: [{ marginTop: '4px' }],
        });

        expect(trigger()).toHaveAttribute('id', 'kind-filter');
        expect(trigger()).toHaveAttribute('name', 'kind');
        expect(screen.getByText('Pick a kind')).toBeInTheDocument();

        await openPopup(user);

        expect(box('Pump')).toBeInTheDocument();
    });

    it('accepts a single sx object', () => {
        setup({ sx: { marginTop: '4px' } });

        expect(trigger()).toBeInTheDocument();
    });

    it('copes with an empty option list', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<ExcelFilterSelect label="Kind" options={[]} value={[]} onChange={onChange} />);

        await openPopup(user);

        expect(screen.getByText('No options')).toBeInTheDocument();
        expect(box('Select All')).toBeDisabled();
        expect(okButton()).toBeDisabled();
    });
});

describe('the popup as a whole', () => {
    it('never emits while the selection is being edited', async () => {
        const { user, onChange } = setup();
        await openPopup(user);

        await user.click(box('Motor'));
        await user.click(box('Drill'));
        await user.type(searchBox(), 'pump');
        await user.clear(searchBox());

        expect(onChange).not.toHaveBeenCalled();

        await user.click(okButton());

        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('reopens on the selection that was applied', async () => {
        const { user } = setup();
        await openPopup(user);

        await user.click(box('Pump'));
        await user.click(box('Pump station'));
        await user.click(okButton());
        await waitFor(() => expect(screen.queryByRole('button', { name: 'OK' })).toBeNull());

        expect(trigger()).toHaveValue('2 selected');

        await openPopup(user);

        expect(box('Motor')).toBeChecked();
        expect(box('Drill')).toBeChecked();
        expect(box('Pump')).not.toBeChecked();
        expect(searchBox()).toHaveValue('');
    });

    it('keeps the option list scrollable and self-contained', async () => {
        const { user } = setup();
        await openPopup(user);

        const dialog = screen.getByRole('presentation');

        expect(within(dialog).getAllByRole('checkbox')).toHaveLength(ALL_KEYS.length + 1);
    });
});
