import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getMySales } from "../infra/agencySalesService";

export default function AgencySales() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getMySales();
        setRows(data || []);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar las ventas");
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
        Mis ventas
      </Typography>

      <Paper variant='outlined' sx={{ p: 2 }}>
        {rows.length === 0 ? (
          <Typography color='text.secondary'>
            Todavía no tenés ventas registradas.
          </Typography>
        ) : (
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Auto</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>
                    {r.brand} {r.model}
                  </TableCell>
                  <TableCell>{r.buyer_email}</TableCell>
                  <TableCell>{r.quantity}</TableCell>
                  <TableCell>
                    {r.unit_price_currency} {r.total_amount}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        r.status === "CANCELLED"
                          ? "Cancelada"
                          : r.status === "COMPLETED"
                          ? "Completada"
                          : "Desconocido"
                      }
                      color={
                        r.status === "CANCELLED"
                          ? "default"
                          : r.status === "COMPLETED"
                          ? "success"
                          : "warning"
                      }
                      size='small'
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(r.created_at).toLocaleString()}
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
