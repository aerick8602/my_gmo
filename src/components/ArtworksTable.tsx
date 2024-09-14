import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

interface Artwork {
    id: number;
    title: string;
    artist_display: string;
    place_of_origin: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

const ArtworksTable = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedProducts, setSelectedProducts] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [rowsToSelect, setRowsToSelect] = useState<number>(0);
    const [allFetchedData, setAllFetchedData] = useState<Artwork[]>([]);
    const op = useRef<OverlayPanel>(null);

    const rowsPerPage = 12;

    const fetchArtworks = async (pageNumber: number) => {
        setLoading(true);
        const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNumber}`);
        const data = await response.json();
        setLoading(false);
        return data;
    };

    const loadData = async (pageNumber: number) => {
        const data = await fetchArtworks(pageNumber);
        return data;
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            const initialData = await loadData(page);
            setArtworks(initialData.data);
            setTotalRecords(initialData.pagination.total);
            setAllFetchedData(prev => [...prev, ...initialData.data]);
        };
        fetchInitialData();
    }, [page]);

    const onPageChange = async (event: any) => {
        const newPage = event.page + 1;
        setPage(newPage);
        const newData = await loadData(newPage);
        setArtworks(newData.data);
        setAllFetchedData(prev => {
            const pageData = [...prev];
            pageData.splice((newPage - 1) * 12, 12, ...newData.data);
            return pageData;
        });
    };

    const handleSelectRows = async () => {
        let rowsSelected: Artwork[] = [];
        let remainingRows = rowsToSelect;

        // Select rows from already fetched data
        rowsSelected = allFetchedData.slice(0, Math.min(remainingRows, allFetchedData.length));
        remainingRows -= rowsSelected.length;

        // Continue fetching additional pages if needed
        let currentPage = Math.ceil(allFetchedData.length / rowsPerPage) + 1;

        while (remainingRows > 0 && currentPage <= Math.ceil(totalRecords / rowsPerPage)) {
            const newData = await loadData(currentPage);
            setAllFetchedData(prev => [...prev, ...newData.data]);

            const additionalRows = newData.data.slice(0, Math.min(remainingRows, rowsPerPage));
            rowsSelected = [...rowsSelected, ...additionalRows];
            remainingRows -= additionalRows.length;

            currentPage++;
        }

        setSelectedProducts(rowsSelected);
        op.current?.hide();
    };

    const titleHeaderTemplate = () => {
        const allRowsSelected = selectedProducts.length === artworks.length;

        return (
            <div className="flex flex-col justify-evenly items-center">
                <Checkbox
                    checked={allRowsSelected}
                    onChange={(e) => {
                        if (e.checked) {
                            const newSelected = [...selectedProducts, ...artworks.filter(row => !selectedProducts.some(item => item.id === row.id))];
                            setSelectedProducts(newSelected);
                        } else {
                            const newSelected = selectedProducts.filter(product => !artworks.some(row => row.id === product.id));
                            setSelectedProducts(newSelected);
                        }
                    }}
                />
                <div>
                    <Button badgeClassName="p-1" icon="pi pi-chevron-down" onClick={(e) => op.current?.toggle(e)} className="p-button-text" />
                    <OverlayPanel ref={op}>
                        <div className="p-1">
                            <h4 className="text-lg font-semibold mb-2">Select Rows</h4>
                            <InputNumber inputClassName="border-solid border-2 border-orange-300" value={rowsToSelect} onValueChange={(e) => setRowsToSelect(e.value || 0)} placeholder="Number of rows" className="w-full" />
                            <Button label="Select" onClick={handleSelectRows} className="mt-2 w-full bg-orange-500 text-white hover:bg-orange-600" />
                        </div>
                    </OverlayPanel>
                </div>
            </div>
        );
    };

    const rowSelectionTemplate = (rowData: Artwork) => {
        const isSelected = selectedProducts.some(product => product.id === rowData.id);

        return (
            <div className="flex justify-center items-center">
                <Checkbox
                    checked={isSelected}
                    onChange={(e) => {
                        let updatedSelectedProducts = [...selectedProducts];
                        if (e.checked) {
                            updatedSelectedProducts.push(rowData);
                        } else {
                            updatedSelectedProducts = updatedSelectedProducts.filter(product => product.id !== rowData.id);
                        }
                        setSelectedProducts(updatedSelectedProducts);
                    }}
                />
            </div>
        );
    };

    return (
        <div className="card bg-white shadow-lg p-6 rounded-lg">
            <DataTable
                value={artworks}
                selectionMode="multiple"
                selection={selectedProducts}
                onSelectionChange={(e) => setSelectedProducts(e.value)}
                dataKey="id"
                className="w-full bg-orange-100"
                paginator
                rows={12}
                totalRecords={totalRecords}
                lazy
                first={(page - 1) * 12}
                onPage={onPageChange}
                loading={loading}
                tableStyle={{ minWidth: '50rem', backgroundColor: 'gray' }}
            >
                <Column className="bg-orange-100" header={titleHeaderTemplate} body={rowSelectionTemplate} headerStyle={{ width: '4rem' }}></Column>
                <Column field="title" header="Title" className="text-center"></Column>
                <Column field="artist_display" header="Artist" className="text-center"></Column>
                <Column field="place_of_origin" header="Place of Origin" className="text-center"></Column>
                <Column field="inscriptions" header="Inscriptions" className="text-center"></Column>
                <Column field="date_start" header="Date Start" className="text-center"></Column>
                <Column field="date_end" header="Date End" className="text-center"></Column>
            </DataTable>
        </div>
    );
};

export default ArtworksTable;
