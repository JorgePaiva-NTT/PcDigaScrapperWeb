import { useState, useEffect, useRef, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';

import dynamic from 'next/dynamic';
const AgGridReact = dynamic(() => import('ag-grid-react').then(mod => mod.AgGridReact), { ssr: false });

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import 'ag-grid-community/styles/ag-theme-balham.css'; // Optional theme CSS
import 'ag-grid-community/styles/ag-theme-material.css'; // Optional theme CSS

const AgChartsReact = dynamic(() => import('ag-charts-react').then(mod => mod.AgChartsReact), { ssr: false });
import { Product } from '../models/Product';
import { Seller } from '../models/Seller';
import Image from 'next/image'

import { Search } from 'grommet-icons'
import { Box, TextInput, Tag, Notification } from 'grommet';
import React from 'react';

import { cloneDeep } from 'lodash';
import { getApiUrl } from './main';


function TechScrapper() {

    const [Products, SetProducts] = useState<any[]>([]);
    const [SelectedRow, SetSelectedRow] = useState<Product>();
    const [urlInput, setUrlInput] = React.useState('');
    const [visible, setVisible] = useState(false);
    const [AGGOptions, setAGGOptions] = useState<any>({
        autoSize: true,
        theme: 'ag-material-dark',
        legend: {
            enabled: true,
            position: "top"
        },
        /*series: [ 
          {
            data: SelectedRow?.sellers[0].productPrices,
            xKey: 'date',
            yKey: 'currentPrice',
            xName: SelectedRow?.sellers[0].name,
            yName: SelectedRow?.sellers[0].name,
            label: {
              enabled: true,
              color: 'white',
              fontWeight: 'bold'
            }
          }
        ]*/
    });
    const placeholderImage = 'https://socialistmodernism.com/wp-content/uploads/2017/07/placeholder-image.png';
    const a: any[] = [];
    const [toastMessage, setToastMessage] = useState('');
    const [toastTitle, setToastTitle] = useState('');

    const [gridApi, setGridApi] = useState<any>(null);

    const theme = {
        global: {
            font: {
                family: 'Roboto',
                size: '18px',
                height: '20px',
            },
        },
    };

    const onOpen = () => setVisible(true);
    const onClose = () => setVisible(false);

    async function getProducts(): Promise<void> {
        var result = await axios.get<Product[]>(`${getApiUrl()}/product/filter`);
        SetProducts(result.data);
    }

    useEffect(() => {
        axios.get<Product[]>(`${getApiUrl()}/product/filter`)
            .then((v: AxiosResponse<Product[]>) => { SetProducts(v.data); })
            .catch(console.error);
    }, []);

    const openInNewTab = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    /*
    {
      data:  SelectedRow?.sellers[0].productPrices,
      type: 'line',
      xKey: 'date',
      yKey: 'currentPrice',
      label: {
        enabled: true,
        color: 'white',
        fontWeight: 'bold'
      }
    }*/

    // Each Column Definition results in one Column.
    const [columnDefs, setColumnDefs] = useState<any[]>([
        {
            field: 'image',
            autoHeight: true,
            resizable: true,
            cellRenderer: (prop: any) =>
                <div style={{}}>
                    {
                        (prop.value as String).includes('globaldata')
                            ? <Image loader={(value) => `${value.src}?w=${value.width}&q=${value.quality}`} placeholder='blur' blurDataURL={placeholderImage} src={prop.value} layout='fill' objectFit='contain' alt="prod_img" />
                            : <Image src={prop.value} placeholder='blur' blurDataURL={placeholderImage} layout='fill' objectFit='contain' alt="prod_img" />
                    }
                </div>

        },
        { field: 'sku', filter: true, resizable: true },
        { field: 'name', minWidth: 650, filter: true, resizable: true },
        {
            field: 'url',
            resizable: true,
            width: 300,
            cellRenderer: (prop: any) =>
                <Box
                    direction="column"
                    justify="center"
                    align="center"
                    pad="none"
                    margin={"none"}
                    gap="xsmall"
                >
                    <Box direction="row-responsive" fill="vertical" flex={true} pad="xsmall" gap='xsmall' wrap={true} responsive={true}>
                        {
                            (prop.data.sellers as Seller[]).map((seller: Seller, index: number) => {
                                return <Tag key={index} size='xsmall' value={seller.name} onClick={() => { openInNewTab(seller.url); }} />
                            })
                        }
                    </Box>
                    <button
                        style={{ marginLeft: "5px", marginRight: "5px", width: "80px" }}
                        onClick={async () => {
                            gridApi?.showLoadingOverlay();
                            try {
                                await axios.get<Product | any>(`${getApiUrl()}/scrape?sku=${prop.data.sku}`);
                                await getProducts();
                            } catch (error: any) {
                                setToastMessage('Error product/update');
                                setToastMessage(error.response.data.message);
                                setVisible(true);
                            }
                            gridApi?.hideOverlay();
                        }}>
                        Scrape
                    </button>
                    {
                        !prop.data.image ?
                            <button onClick={async () => {
                                gridApi?.showLoadingOverlay();
                                await axios.get<Product>(`${getApiUrl()}/product/update?prop=image&url=${prop.value}`);
                                await getProducts();
                                gridApi?.hideOverlay();
                            }}>
                                Update Image
                            </button>
                            : <div></div>
                    }

                </Box>
        }
    ]);

    const onSelectionChanged = useCallback(() => {
        if (!gridApi) return;
        const selectedRows: Product[] = gridApi.getSelectedRows();
        if (!selectedRows || selectedRows.length === 0) return;
        
        SetSelectedRow(selectedRows[0]);
        const options = cloneDeep(AGGOptions) as any;
        options.series = [];
        selectedRows[0].sellers.forEach(element => {
            var prices = element.productPrices;
            options.series?.push({
                data: prices,
                xKey: 'date',
                yKey: 'currentPrice',
                xName: element.name,
                yName: element.name,
                label: {
                    enabled: true,
                    color: 'white',
                    fontWeight: 'bold'
                }

            } as any,
                {
                    data: prices,
                    xKey: 'date',
                    yKey: 'originalPrice',
                    xName: 'Preco original ' + element.name,
                    yName: 'Preco original ' + element.name,
                    label: {
                        enabled: true,
                        color: 'white'
                    }
                } as any);
        });
        setAGGOptions(options);
    }, [AGGOptions, gridApi]);

    const onChange = (event: any) => setUrlInput(event.target.value);
    const onInpuitKeyDown = async (event: any) => {
        if (event.key === 'Enter') {
            gridApi?.showLoadingOverlay();
            const res = await axios.get<Product | any>(`${getApiUrl()}/product/create?url=${encodeURIComponent(urlInput)}`);
            if (res.status >= 400) {
                setToastTitle('Error product/create');
                setToastMessage(res.data.message);
                setVisible(true);
            }
            else {
                await getProducts();
            }
            gridApi?.hideOverlay();
        }
    };

    return (
        <div>
            <Box width="100%" align='center' justify='around'>
            <Box width="50%">
                <TextInput style={{ marginTop: 10, marginBottom: 10 }} size="medium" icon={<Search />} placeholder="https://www.pcdiga.com/componentes/processadores/..." value={urlInput} onChange={onChange} onKeyDown={onInpuitKeyDown} />
            </Box>
            <div className="ag-theme-balham-dark" style={{ width: '80%', height: 600, marginLeft: "10%", marginRight: "10%" }}>
                <AgGridReact
                    onGridReady={(params: any) => setGridApi(params.api)}
                    rowHeight={100}
                    rowData={Products} // Row Data for Rows
                    columnDefs={columnDefs} // Column Defs for Columns
                    animateRows={true} // Optional - set to 'true' to have rows animate when sorted
                    rowSelection='multiple' // Options - allows click selection of rows
                    onSelectionChanged={onSelectionChanged}
                />
            </div>
            {
                SelectedRow !== undefined ? <div style={{ width: "65%", height: "400px", marginTop: 10 }}> <AgChartsReact options={AGGOptions} /> </div> : <p>Select a row</p>
            }
        </Box>
        {
            visible && (
                <Notification
                    toast
                    title={toastTitle}
                    message={toastMessage}
                    onClose={onClose}

                />
            )}
        </div>
        
    );
}

export default TechScrapper;