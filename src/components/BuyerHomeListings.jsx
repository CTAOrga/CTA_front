// src/components/BuyerListingsSearch.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Stack,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { searchListings } from "../infra/listingsService";

const asArray = (x) => (Array.isArray(x) ? x : x?.items ?? []);

const formatPrice = (amount, currency) => {
  if (amount == null) return "—";
  const cur = currency ? `${currency} ` : "";
  return cur + Number(amount).toLocaleString();
};

export default function BuyerHomeListings() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const showAgency = !isXs;

  // Filtros
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Datos
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goToDetail = (id) => {
    navigate(`/listings/${id}`);
  };

  const runSearch = async () => {
    // validación simple de precios
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setError('"min_price" no puede ser mayor que "max_price"');
      setRows([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await searchListings({
        q,
        brand,
        model,
        agency_id: agencyId || "",
        min_price: minPrice || "",
        max_price: maxPrice || "",
        sort,
        page: page + 1, // backend 1-based
        page_size: pageSize,
      });
      const arr = asArray(data);
      setRows(arr);
      setTotal(Number(data?.total) || arr.length);
    } catch (e) {
      console.error(e);
      setRows([]);
      setTotal(0);
      setError("No se pudieron cargar los autos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda automática cuando cambian filtros o paginación
  useEffect(() => {
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setError('"min_price" no puede ser mayor que "max_price"');
      setRows([]);
      setTotal(0);
      return;
    }
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, brand, model, agencyId, minPrice, maxPrice, sort, page, pageSize]);

  const handleClear = () => {
    setQ("");
    setBrand("");
    setModel("");
    setAgencyId("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(0);
    setPageSize(20);
  };

  return (
    <Container maxWidth='lg' sx={{ py: 2 }}>
      {/* Filtros */}
      <Paper
        variant='outlined'
        sx={{
          p: 2,
          mb: 2,
          borderTop: (t) => `3px solid ${t.palette.primary.main}`,
        }}
      >
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={4}>
            <TextField
              label='Búsqueda por marca o modelo (q)'
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
              placeholder='Fiat, Gol, etc.'
              inputProps={{ "data-testid": "input-q" }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              label='brand'
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              label='model'
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              label='agency_id'
              value={agencyId}
              onChange={(e) => {
                setAgencyId(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
              placeholder='e.g. 12'
            />
          </Grid>
          <Grid item xs={6} md={1.5}>
            <TextField
              label='min_price'
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value.replace(/[^\d]/g, ""));
                setPage(0);
              }}
              fullWidth
              size='small'
              inputMode='numeric'
            />
          </Grid>
          <Grid item xs={6} md={1.5}>
            <TextField
              label='max_price'
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value.replace(/[^\d]/g, ""));
                setPage(0);
              }}
              fullWidth
              size='small'
              inputMode='numeric'
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              select
              label='sort'
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
            >
              <MenuItem value='newest'>newest</MenuItem>
              <MenuItem value='price_asc'>price_asc</MenuItem>
              <MenuItem value='price_desc'>price_desc</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              select
              label='page_size'
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              fullWidth
              size='small'
            >
              {[10, 20, 50].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Solo botón LIMPIAR, nada de Buscar */}
          <Grid item xs={12} md='auto'>
            <Stack direction='row' spacing={1}>
              <Button variant='outlined' onClick={handleClear}>
                Limpiar
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {error && (
          <Typography color='error' sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Paper>

      {/* Tabla de resultados */}
      <Paper variant='outlined'>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size='small' aria-label='ofertas'>
            <TableHead>
              <TableRow>
                <TableCell>Marca</TableCell>
                <TableCell>Modelo</TableCell>
                {showAgency && <TableCell>Agencia</TableCell>}
                <TableCell align='right'>Precio</TableCell>
                <TableCell align='center'>Stock</TableCell>
                <TableCell align='center'>Fav</TableCell>
                <TableCell align='center'>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading &&
                [...Array(5)].map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell colSpan={showAgency ? 7 : 6}>
                      <Skeleton height={24} />
                    </TableCell>
                  </TableRow>
                ))}

              {!loading &&
                rows.map((r) => {
                  const id = r.id;
                  const b = r.brand ?? "—";
                  const m = r.model ?? "—";
                  const agency = r.agency_id != null ? `#${r.agency_id}` : "—";
                  const price = formatPrice(
                    r.current_price_amount,
                    r.current_price_currency
                  );
                  const stock = r.stock ?? "—";
                  const fav = !!r.is_favorite;

                  return (
                    <TableRow
                      hover
                      key={id ?? `${b}-${m}`}
                      data-testid='row-listing'
                      data-listing-id={id}
                    >
                      <TableCell>{b}</TableCell>
                      <TableCell title={r.seller_notes || ""}>{m}</TableCell>
                      {showAgency && <TableCell>{agency}</TableCell>}
                      <TableCell align='right'>{price}</TableCell>
                      <TableCell align='center'>{stock}</TableCell>

                      <TableCell
                        align='center'
                        sx={{ width: 56 }}
                        data-testid='cell-fav'
                      >
                        <Tooltip
                          title={
                            fav ? "Marcado como favorito" : "No es favorito"
                          }
                        >
                          <span>
                            {fav ? (
                              <StarIcon
                                color='warning'
                                fontSize='small'
                                aria-label='fav-true'
                              />
                            ) : (
                              <StarBorderIcon
                                color='disabled'
                                fontSize='small'
                                aria-label='fav-false'
                              />
                            )}
                          </span>
                        </Tooltip>
                      </TableCell>

                      <TableCell align='center' sx={{ whiteSpace: "nowrap" }}>
                        <Button
                          variant='outlined'
                          size='small'
                          onClick={() => goToDetail(id)}
                          sx={{ ml: 1 }}
                        >
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={showAgency ? 7 : 6}>
                    <Typography color='text.secondary'>
                      Sin resultados.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component='div'
          rowsPerPageOptions={[10, 20, 50]}
          count={total}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setPage(0);
            setPageSize(parseInt(e.target.value, 10));
          }}
        />
      </Paper>
    </Container>
  );
}
