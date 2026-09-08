import type { ExcelFilterLabels } from './types';

export const enUS: ExcelFilterLabels = {
    selectAll: 'Select All',
    selectAllSearchResults: 'Select All Search Results',
    addCurrentSelectionToFilter: 'Add current selection to filter',
    searchPlaceholder: 'Search...',
    ok: 'OK',
    cancel: 'Cancel',
    noOptions: 'No options',
    all: 'All',
    selectedCount: (count) => `${count} selected`,
};

export const plPL: ExcelFilterLabels = {
    selectAll: 'Zaznacz wszystko',
    selectAllSearchResults: 'Zaznacz wszystkie wyniki',
    addCurrentSelectionToFilter: 'Dodaj bieżące zaznaczenie do filtru',
    searchPlaceholder: 'Szukaj...',
    ok: 'OK',
    cancel: 'Anuluj',
    noOptions: 'Brak opcji',
    all: 'Wszystkie',
    selectedCount: (count) => `Wybrano: ${count}`,
};
