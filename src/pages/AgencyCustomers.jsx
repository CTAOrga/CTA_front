import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getMyCustomers } from "../infra/agencySalesService";

export default function AgencyCustomers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyCustomers();
        setRows(data || []);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar los clientes");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity='error'>{error}</Alert>;
  }

  return (
    <>
      <Typography variant='h5' sx={{ mb: 2 }}>
        Mis clientes
      </Typography>

      <Paper variant='outlined' sx={{ p: 2 }}>
        {rows.length === 0 ? (
          <Typography color='text.secondary'>
            Todavía no tenés clientes (no hay compras asociadas).
          </Typography>
        ) : (
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Cantidad de compras</TableCell>
                <TableCell>Total gastado</TableCell>
                <TableCell>Última compra</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.customer_id}>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.total_purchases}</TableCell>
                  <TableCell>{r.total_spent}</TableCell>
                  <TableCell>
                    {new Date(r.last_purchase_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </>
  );
}
