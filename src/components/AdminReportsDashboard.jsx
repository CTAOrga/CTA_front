import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  TablePagination,
  CircularProgress,
  Alert,
} from "@mui/material";

import {
  getTopSoldCars,
  getTopBuyers,
  getTopFavorites,
  getTopAgencies,
} from "../infra/adminReportsService";

export default function AdminReportsDashboard() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [limit, setLimit] = useState(5); // Top N: 5, 10, 15

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [topSoldCars, setTopSoldCars] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [topFavorites, setTopFavorites] = useState([]);
  const [topAgencies, setTopAgencies] = useState([]);

  // paginación local por tabla
  const [carsPage, setCarsPage] = useState(0);
  const [carsRowsPerPage, setCarsRowsPerPage] = useState(5);

  const [buyersPage, setBuyersPage] = useState(0);
  const [buyersRowsPerPage, setBuyersRowsPerPage] = useState(5);

  const [favoritesPage, setFavoritesPage] = useState(0);
  const [favoritesRowsPerPage, setFavoritesRowsPerPage] = useState(5);

  const [agenciesPage, setAgenciesPage] = useState(0);
  const [agenciesRowsPerPage, setAgenciesRowsPerPage] = useState(5);

  // helper simple: slice para paginar en el front
  const paginate = (rows, page, rowsPerPage) =>
    rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // cargar datos cada vez que cambian filtros globales o el límite
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const params = {
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          limit,
        };

        const results = await Promise.allSettled([
          getTopSoldCars(params),
          getTopBuyers(params),
          getTopFavorites(params),
          getTopAgencies(params),
        ]);

        if (cancelled) return;

        const [carsRes, buyersRes, favRes, agenciesRes] = results;

        // Autos más vendidos
        if (carsRes.status === "fulfilled") {
          setTopSoldCars(
            Array.isArray(carsRes.value)
              ? carsRes.value
              : carsRes.value?.items ?? []
          );
        } else {
          console.warn("Error en getTopSoldCars:", carsRes.reason);
          setTopSoldCars([]);
        }

        // Usuarios con más compras
        if (buyersRes.status === "fulfilled") {
          setTopBuyers(
            Array.isArray(buyersRes.value)
              ? buyersRes.value
              : buyersRes.value?.items ?? []
          );
        } else {
          console.warn("Error en getTopBuyers:", buyersRes.reason);
          setTopBuyers([]);
        }

        // Autos favoritos
        if (favRes.status === "fulfilled") {
          setTopFavorites(
            Array.isArray(favRes.value)
              ? favRes.value
              : favRes.value?.items ?? []
          );
        } else {
          console.warn("Error en getTopFavorites:", favRes.reason);
          setTopFavorites([]);
        }

        // Agencias con más ventas
        if (agenciesRes.status === "fulfilled") {
          setTopAgencies(
            Array.isArray(agenciesRes.value)
              ? agenciesRes.value
              : agenciesRes.value?.items ?? []
          );
        } else {
          console.warn("Error en getTopAgencies:", agenciesRes.reason);
          setTopAgencies([]);
        }

        // resetear páginas cuando cambian los filtros
        setCarsPage(0);
        setBuyersPage(0);
        setFavoritesPage(0);
        setAgenciesPage(0);
      } catch (e) {
        console.error("[AdminReportsDashboard] error inesperado:", e);
        if (!cancelled) {
          setError("No se pudieron cargar los reportes");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [dateFrom, dateTo, limit]);

  return (
    <Container maxWidth='lg' sx={{ py: 2 }}>
      <Typography variant='h4' gutterBottom>
        Reportes de utilización
      </Typography>

      {/* Filtros globales */}
      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              type='date'
              label='Desde'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              fullWidth
              size='small'
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              type='date'
              label='Hasta'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              fullWidth
              size='small'
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label='Top N'
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              fullWidth
              size='small'
            >
              {[5, 10, 15].map((n) => (
                <MenuItem key={n} value={n}>
                  Top {n}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
          <CircularProgress size={24} />
        </Paper>
      )}

      {error && (
        <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
          <Alert severity='error'>{error}</Alert>
        </Paper>
      )}

      {/* Grilla con los 4 Top N */}
      <Grid container spacing={2}>
        {/* Autos más vendidos */}
        <Grid item xs={12} md={6}>
          <Paper
            variant='outlined'
            sx={{ p: 2, display: "flex", flexDirection: "column" }}
          >
            <Typography variant='h6' gutterBottom>
              Autos más vendidos (Top {limit})
            </Typography>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Auto</TableCell>
                  <TableCell align='right'>Unidades</TableCell>
                  <TableCell align='right'>Total vendido</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginate(topSoldCars, carsPage, carsRowsPerPage).map(
                  (row, idx) => (
                    <TableRow key={`${row.brand}-${row.model}-${idx}`}>
                      <TableCell>
                        {row.brand} {row.model}
                      </TableCell>
                      <TableCell align='right'>{row.units_sold}</TableCell>
                      <TableCell align='right'>
                        {row.total_amount != null
                          ? row.total_amount.toLocaleString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  )
                )}

                {!loading && topSoldCars.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography color='text.secondary'>
                        No hay datos para el filtro seleccionado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component='div'
              rowsPerPageOptions={[5, 10, 15]}
              count={topSoldCars.length}
              rowsPerPage={carsRowsPerPage}
              page={carsPage}
              onPageChange={(_, p) => setCarsPage(p)}
              onRowsPerPageChange={(e) => {
                setCarsRowsPerPage(parseInt(e.target.value, 10));
                setCarsPage(0);
              }}
            />
          </Paper>
        </Grid>

        {/* Usuarios con más compras */}
        <Grid item xs={12} md={6}>
          <Paper
            variant='outlined'
            sx={{ p: 2, display: "flex", flexDirection: "column" }}
          >
            <Typography variant='h6' gutterBottom>
              Usuarios con más compras (Top {limit})
            </Typography>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell align='right'>Compras</TableCell>
                  <TableCell align='right'>Total gastado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginate(topBuyers, buyersPage, buyersRowsPerPage).map(
                  (row, idx) => (
                    <TableRow key={`${row.email}-${idx}`}>
                      <TableCell>{row.email}</TableCell>
                      <TableCell align='right'>{row.purchases_count}</TableCell>
                      <TableCell align='right'>
                        {row.total_spent != null
                          ? row.total_spent.toLocaleString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  )
                )}

                {!loading && topBuyers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography color='text.secondary'>
                        No hay datos para el filtro seleccionado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component='div'
              rowsPerPageOptions={[5, 10, 15]}
              count={topBuyers.length}
              rowsPerPage={buyersRowsPerPage}
              page={buyersPage}
              onPageChange={(_, p) => setBuyersPage(p)}
              onRowsPerPageChange={(e) => {
                setBuyersRowsPerPage(parseInt(e.target.value, 10));
                setBuyersPage(0);
              }}
            />
          </Paper>
        </Grid>

        {/* Autos favoritos */}
        <Grid item xs={12} md={6}>
          <Paper
            variant='outlined'
            sx={{ p: 2, display: "flex", flexDirection: "column" }}
          >
            <Typography variant='h6' gutterBottom>
              Autos favoritos (Top {limit})
            </Typography>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Auto</TableCell>
                  <TableCell align='right'>Favoritos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginate(
                  topFavorites,
                  favoritesPage,
                  favoritesRowsPerPage
                ).map((row, idx) => (
                  <TableRow key={`${row.brand}-${row.model}-${idx}`}>
                    <TableCell>
                      {row.brand} {row.model}
                    </TableCell>
                    <TableCell align='right'>{row.favorites_count}</TableCell>
                  </TableRow>
                ))}

                {!loading && topFavorites.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography color='text.secondary'>
                        No hay datos para el filtro seleccionado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component='div'
              rowsPerPageOptions={[5, 10, 15]}
              count={topFavorites.length}
              rowsPerPage={favoritesRowsPerPage}
              page={favoritesPage}
              onPageChange={(_, p) => setFavoritesPage(p)}
              onRowsPerPageChange={(e) => {
                setFavoritesRowsPerPage(parseInt(e.target.value, 10));
                setFavoritesPage(0);
              }}
            />
          </Paper>
        </Grid>

        {/* Agencias con más ventas */}
        <Grid item xs={12} md={6}>
          <Paper
            variant='outlined'
            sx={{ p: 2, display: "flex", flexDirection: "column" }}
          >
            <Typography variant='h6' gutterBottom>
              Agencias con más ventas (Top {limit})
            </Typography>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Agencia</TableCell>
                  <TableCell align='right'>Ventas</TableCell>
                  <TableCell align='right'>Total vendido</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginate(topAgencies, agenciesPage, agenciesRowsPerPage).map(
                  (row, idx) => (
                    <TableRow key={`${row.agency_name}-${idx}`}>
                      <TableCell>{row.agency_name}</TableCell>
                      <TableCell align='right'>{row.sales_count}</TableCell>
                      <TableCell align='right'>
                        {row.total_amount != null
                          ? row.total_amount.toLocaleString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  )
                )}

                {!loading && topAgencies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography color='text.secondary'>
                        No hay datos para el filtro seleccionado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component='div'
              rowsPerPageOptions={[5, 10, 15]}
              count={topAgencies.length}
              rowsPerPage={agenciesRowsPerPage}
              page={agenciesPage}
              onPageChange={(_, p) => setAgenciesPage(p)}
              onRowsPerPageChange={(e) => {
                setAgenciesRowsPerPage(parseInt(e.target.value, 10));
                setAgenciesPage(0);
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
