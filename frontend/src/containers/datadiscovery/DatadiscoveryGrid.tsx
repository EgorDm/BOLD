import { Box } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { GridSortModel } from "@mui/x-data-grid/models/gridSortModel";
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity";
import React from "react";
import { ServerDataGrid } from "../../components/data/ServerDataGrid";
import { Discovery } from "../../types/discoveries";
import { formatUUIDShort } from "../../utils/formatting";

const COLUMNS: GridColDef[] = [
  {
    field: 'id', headerName: 'Dataset ID', flex: 0.5,
    valueFormatter: (params) => formatUUIDShort(params.value)
  },
  { field: 'name', headerName: 'Dataset Name', flex: 0.5 },
  { field: 'terms', headerName: 'Terms', flex: 2.0,
    valueGetter: (params) => params.value.map(t => t['term']).join('. '),
    renderCell: (params: GridRenderCellParams<any, any>) => {
      let triples = params.value.split(". ").filter(i => i !== "");
      let items = triples.map((v, i) => {
        let terms = v.split(" ")
          .map(v => v.startsWith("http") ? <a href={v}>{v} </a> : v);

        return (<li key={i}>{terms}</li>);
      });

      return (
        <details>
          <summary>Number of matching triples is {triples.length}</summary>
            <ul style={{ paddingInlineStart: '1rem' }} >{items}</ul>
        </details>
    );},
  },
]

const INITIAL_STATE: GridInitialStateCommunity = {
  columns: {
    columnVisibilityModel: {
      database: true,
      updated_at: false,
    }
  }
}

const INITIAL_SORTING: GridSortModel = [
  { field: 'dataset_id', sort: 'desc' }
]


export const DatadiscoveryGrid = (props: {}) => {
  return (
    <Box sx={{ width: '100%', height: 600 }}>
      <ServerDataGrid<Discovery>
        endpoint="/datadiscovery/"
        columns={COLUMNS}
        initialState={INITIAL_STATE}
        initialSorting={INITIAL_SORTING}
        actions={(params, actions) => []}
      />
    </Box>
  )
}