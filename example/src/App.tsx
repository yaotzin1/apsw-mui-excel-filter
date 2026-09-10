import { useMemo, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Link,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { ExcelFilterSelect, plPL } from 'apsw-mui-excel-filter';
import {
    CITY_TITLES,
    CUISINE_TITLES,
    ORDERS,
    STATUS_TITLES,
    optionsFor,
} from './data';

const CUISINE_OPTIONS = optionsFor('cuisine', CUISINE_TITLES);
const CITY_OPTIONS = optionsFor('city', CITY_TITLES);
const STATUS_OPTIONS = optionsFor('status', STATUS_TITLES);

/** An empty filter means "no filter", so it lets every row through. */
const passes = (selected: string[], field: string): boolean =>
    selected.length === 0 || selected.includes(field);

/**
 * What the three filters would send to a server. Empty filters are absent rather than
 * spelled out, which is the point of the empty-array convention.
 */
const toQueryString = (filters: Record<string, string[]>): string => {
    const params = Object.entries(filters)
        .filter(([, selected]) => selected.length > 0)
        .map(([name, selected]) => `${name}=${selected.join(',')}`);
    return params.length > 0 ? `/orders?${params.join('&')}` : '/orders';
};

export function App() {
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [statuses, setStatuses] = useState<string[]>([]);
    // The two translated fields at the bottom are there to be opened, not to filter, so
    // they keep their own value and leave the table alone.
    const [translatedCuisines, setTranslatedCuisines] = useState<string[]>([]);

    // The demo filters an array it already has. A real screen would more often send the
    // three values to a server, which is what the query string below stands in for.
    const rows = useMemo(
        () =>
            ORDERS.filter(
                (order) =>
                    passes(cuisines, order.cuisine) &&
                    passes(cities, order.city) &&
                    passes(statuses, order.status),
            ),
        [cuisines, cities, statuses],
    );

    const filtered = cuisines.length > 0 || cities.length > 0 || statuses.length > 0;

    const clearAll = () => {
        setCuisines([]);
        setCities([]);
        setStatuses([]);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            <Typography variant="h4" gutterBottom>
                apsw-mui-excel-filter
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Three filters over a day of meal orders. Type into a dropdown to tick the
                matches, untick what you want gone, and confirm with OK. Nothing reaches the
                table until then. The rules are written up in the{' '}
                <Link href="https://github.com/yaotzin1/apsw-mui-excel-filter#readme">
                    README
                </Link>
                .
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap alignItems="flex-start">
                    <ExcelFilterSelect
                        label="Cuisine"
                        options={CUISINE_OPTIONS}
                        value={cuisines}
                        onChange={setCuisines}
                        width={220}
                    />
                    <ExcelFilterSelect
                        label="City"
                        options={CITY_OPTIONS}
                        value={cities}
                        onChange={setCities}
                        width={220}
                    />
                    <ExcelFilterSelect
                        label="Status"
                        options={STATUS_OPTIONS}
                        value={statuses}
                        onChange={setStatuses}
                        width={220}
                    />
                    <Button onClick={clearAll} disabled={!filtered} sx={{ height: 32 }}>
                        Clear all
                    </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip
                        size="small"
                        color={filtered ? 'primary' : 'default'}
                        label={`${rows.length} of ${ORDERS.length} orders`}
                    />
                    <Typography variant="body2" color="text.secondary">
                        The request this would make:
                    </Typography>
                    <Box
                        component="code"
                        sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                            fontFamily: 'monospace',
                            fontSize: 13,
                        }}
                    >
                        GET {toQueryString({ cuisine: cuisines, city: cities, status: statuses })}
                    </Box>
                </Stack>
            </Paper>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Order</TableCell>
                            <TableCell>Dish</TableCell>
                            <TableCell>Cuisine</TableCell>
                            <TableCell>City</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Placed</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((order) => (
                            <TableRow key={order.id} hover>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.dish}</TableCell>
                                <TableCell>{CUISINE_TITLES[order.cuisine]}</TableCell>
                                <TableCell>{CITY_TITLES[order.city]}</TableCell>
                                <TableCell>{STATUS_TITLES[order.status]}</TableCell>
                                <TableCell>{order.placed}</TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No order matches all three filters.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h6" gutterBottom>
                Two terms in one filter
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Open City and type <code>syd</code>. Sydney is ticked and every other city is
                dropped, so OK would filter to Sydney alone. To keep it and add Tokyo, tick{' '}
                <em>Add current selection to filter</em> before typing <code>tok</code>.
                Sydney stays ticked while it is off screen.
            </Typography>

            <Typography variant="h6" gutterBottom>
                Translated
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                Polish ships with the package. Anything else is an object literal, and
                overriding one string leaves the rest in English.
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 6 }}>
                <ExcelFilterSelect
                    label="Kuchnia"
                    options={CUISINE_OPTIONS}
                    value={translatedCuisines}
                    onChange={setTranslatedCuisines}
                    labels={plPL}
                    locale="pl"
                    width={220}
                />
                <ExcelFilterSelect
                    label="Cuisine (Apply)"
                    options={CUISINE_OPTIONS}
                    value={translatedCuisines}
                    onChange={setTranslatedCuisines}
                    labels={{ ok: 'Apply', selectedCount: (n) => `${n} chosen` }}
                    width={220}
                />
            </Stack>
        </Container>
    );
}
