import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

export default function Table({ data }) {

  if (!data) {
    return null;
  }
  const columns = data ? Object.keys(data?.[0]).map((key) => ({ field: key })) : []

  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          autosizeOnMount
          columnVisibilityModel={{ _id: false }}
          columns={columns}
          rows={data}
          getRowId={(row) => row._id}
        />
      </div>
    </div>
  );
}