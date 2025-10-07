import React, { useMemo } from "react";
import {
  Typography,
  Button,
  Stack,
  Paper,
  Chip,
  Alert,
  Container,
  Grid,
  TextField,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  CircularProgress,
  Skeleton,
  Tooltip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../infra/useAuth.js";
import { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { searchListings } from "../infra/listingsService.js";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { addFavorite, removeFavorite } from "../infra/favoritesService.js";

// Decide un rol “principal” a partir del array de roles
const getPrimaryRole = (roles = []) => {
  const L = roles.map((r) => String(r).toLowerCase());
  if (L.includes("admin")) return "admin";
  if (L.includes("buyer")) return "buyer";
  if (L.includes("agency")) return "agency";
  return "guest";
};

// Texto/color por rol
const ROLE_UI = {
  admin: {
    label: "Administrador",
    color: "secondary",
    message: "Tenés acceso completo al panel.",
  },
  buyer: {
    label: "Compras",
    color: "success",
    message: "Gestioná órdenes y compras.",
  },
  agency: {
    label: "Agencia",
    color: "warning",
    message: "Accedé a las funciones de agencia.",
  },
  guest: {
    label: "Invitado",
    color: "default",
    message: "Estás en modo invitado. Iniciá sesión para más funciones.",
  },
};

const asArray = (x) => (Array.isArray(x) ? x : x?.items ?? []);

const formatPrice = (amount, currency) => {
  if (amount == null) return "—";
  const cur = currency ? `${currency} ` : "";
  return cur + Number(amount).toLocaleString();
};

export default function Home() {
  const { isAuthenticated, roles = [] } = useAuth();
  const role = useMemo(() => getPrimaryRole(roles), [roles]);
  const ui = ROLE_UI[role];

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  // Filtros
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  // Resultados
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // UI 0-based
  const [pageSize, setPageSize] = useState(20);

  const runSearch = async () => {
    // validate min/max
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      alert("min_price no puede ser mayor que max_price");
      return;
    }
    setLoading(true);
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
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Buscar al cargar
  useEffect(() => {
    runSearch();
  }, []);

  // Rebuscar cuando cambie paginación
  useEffect(() => {
    runSearch();
  }, [page, pageSize]);

  // Columnas compactas
  const showAgency = !isXs;

  const handleMarkFavorite = async (listingId, current) => {
    try {
      if (!current) {
        await addFavorite(listingId);
      } else {
        await removeFavorite(listingId);
      }
      // Actualizá el estado local para reflejar el cambio al instante
      setRows((prev) =>
        prev.map((r) =>
          r.id === listingId ? { ...r, is_favorite: !current } : r
        )
      );
    } catch (err) {
      console.error("No se pudo actualizar favorito", err);
      // acá podés mostrar un Snackbar si querés
    }
  };

  console.log("Rows:", rows);

  return (
    <>
      {!isAuthenticated ? (
        <Stack spacing={3}>
          <Typography variant='h4' component='h1'>
            {"Bienvenido 👋"}
          </Typography>
          <Paper variant='outlined' sx={{ p: 2 }}>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Chip
                label={`Rol: ${ui.label}`}
                color={ui.color}
                variant={"outlined"}
              />
              <Chip label='Invitado' variant='outlined' />
            </Stack>
            <Typography sx={{ mt: 2 }}>{ui.message}</Typography>

            <Alert severity='info' sx={{ mt: 2 }}>
              Para acceder a tus módulos,&nbsp;
              <Button component={RouterLink} to='/login' size='small'>
                iniciá sesión
              </Button>
              &nbsp;o&nbsp;
              <Button component={RouterLink} to='/register' size='small'>
                creá tu cuenta
              </Button>
            </Alert>
          </Paper>
        </Stack>
      ) : (
        <Container maxWidth='lg' sx={{ py: 2 }}>
          {/* Filtro */}
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
              <Grid item xs={12} md='auto'>
                <Stack direction='row' spacing={1}>
                  <Button
                    variant='contained'
                    onClick={runSearch}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : "Buscar"}
                  </Button>
                  <Button
                    variant='outlined'
                    onClick={() => {
                      setQ("");
                      setBrand("");
                      setModel("");
                      setAgencyId("");
                      setMinPrice("");
                      setMaxPrice("");
                      setSort("newest");
                      setPage(0);
                      setPageSize(20);
                      runSearch();
                    }}
                  >
                    Limpiar
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Tabla */}
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
                        <TableCell colSpan={showAgency ? 5 : 4}>
                          <Skeleton height={24} />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!loading &&
                    rows.map((r) => {
                      // Toma campos exactamente como los devuelve tu API
                      const id = r.id;
                      const brand = r.brand ?? "—";
                      const model = r.model ?? "—";
                      const agency =
                        r.agency_id != null ? `#${r.agency_id}` : "—";
                      const price = formatPrice(
                        r.current_price_amount,
                        r.current_price_currency
                      );
                      const stock = r.stock ?? "—";
                      const fav = !!r.is_favorite;

                      return (
                        <TableRow hover key={id ?? `${brand}-${model}`}>
                          <TableCell>{brand}</TableCell>
                          <TableCell title={r.seller_notes || ""}>
                            {model}
                          </TableCell>
                          {showAgency && <TableCell>{agency}</TableCell>}
                          <TableCell align='right'>{price}</TableCell>
                          <TableCell align='center'>{stock}</TableCell>

                          {/* Estrella de estado */}
                          <TableCell align='center' sx={{ width: 56 }}>
                            <Tooltip
                              title={
                                fav ? "Marcado como favorito" : "No es favorito"
                              }
                            >
                              <span>
                                {fav ? (
                                  <StarIcon color='warning' fontSize='small' />
                                ) : (
                                  <StarBorderIcon
                                    color='disabled'
                                    fontSize='small'
                                  />
                                )}
                              </span>
                            </Tooltip>
                          </TableCell>
                          {/* Botón para marcar/quitar (placeholder) */}
                          <TableCell
                            align='center'
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            <Button
                              size='small'
                              variant={fav ? "outlined" : "contained"}
                              color={fav ? "warning" : "primary"}
                              onClick={() => handleMarkFavorite(id, fav)}
                            >
                              {fav ? "Quitar" : "Marcar"}
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
      )}
    </>
  );
}
