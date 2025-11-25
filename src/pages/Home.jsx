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
import {
  getMyListings,
  cancelListing,
  activateListing,
  deleteListing,
} from "../infra/agencyListingsService.js";
import { useNavigate } from "react-router-dom";

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
  const isAgency = role === "agency";
  const navigate = useNavigate();

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

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [agencyRows, setAgencyRows] = useState([]);
  const [agencyLoading, setAgencyLoading] = useState(false);
  const [agencyTotal, setAgencyTotal] = useState(0);
  const [agencyPage, setAgencyPage] = useState(0); // UI 0-based
  const [agencyPageSize, setAgencyPageSize] = useState(10);

  const runSearch = async () => {
    if (isAgency) return;
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

  const loadAgencyListings = async () => {
    if (!isAuthenticated || !isAgency) return;
    setAgencyLoading(true);
    try {
      const data = await getMyListings({
        page: agencyPage + 1, // backend 1-based
        pageSize: agencyPageSize,
      });
      setAgencyRows(data.items ?? []);
      setAgencyTotal(Number(data.total) || 0);
    } catch (err) {
      console.error("Error cargando listings de la agencia:", err);
      setAgencyRows([]);
      setAgencyTotal(0);
    } finally {
      setAgencyLoading(false);
    }
  };

  const goToAgencyDetail = (id) => {
    navigate(`/agencies/listings/${id}`);
  };

  const goToAgencyEdit = (id) => {
    navigate(`/agencies/listings/${id}/edit`);
  };

  // Buscar al cargar
  useEffect(() => {
    if (!isAuthenticated || isAgency) return;
    runSearch();
  }, [isAuthenticated, isAgency]);

  useEffect(() => {
    if (!isAuthenticated || isAgency) return;
    runSearch();
  }, [page, pageSize, sort]);

  // Columnas compactas
  const showAgency = !isXs;

  const goToDetail = (id) => {
    navigate(`/listings/${id}`);
  };

  useEffect(() => {
    if (!isAuthenticated || !isAgency) return;
    loadAgencyListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAgency, agencyPage, agencyPageSize]);

  const handleCancelListing = async (id) => {
    try {
      await cancelListing(id);
      setAgencyRows((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_active: false } : l))
      );
    } catch (err) {
      console.error("No se pudo cancelar listing:", err);
    }
  };

  const handleActivateListing = async (id) => {
    try {
      await activateListing(id);
      setAgencyRows((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_active: true } : l))
      );
    } catch (err) {
      console.error("No se pudo activar listing:", err);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("¿Eliminar definitivamente esta oferta?")) return;
    try {
      await deleteListing(id);
      setAgencyRows((prev) => prev.filter((l) => l.id !== id));
      setAgencyTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("No se pudo eliminar listing:", err);
    }
  };

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
      ) : isAgency ? (
        // =========================
        // Vista AGENCY: Mis autos publicados
        // =========================
        <Container maxWidth='lg' sx={{ py: 2 }}>
          <Typography variant='h4' gutterBottom>
            Mis autos publicados
          </Typography>

          <Paper variant='outlined'>
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table stickyHeader size='small' aria-label='mis-listings'>
                <TableHead>
                  <TableRow>
                    <TableCell>Marca</TableCell>
                    <TableCell>Modelo</TableCell>
                    <TableCell align='right'>Precio</TableCell>
                    <TableCell align='center'>Stock</TableCell>
                    <TableCell align='center'>Estado</TableCell>
                    <TableCell align='center'>Creado</TableCell>
                    <TableCell align='center'>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agencyLoading &&
                    [...Array(5)].map((_, i) => (
                      <TableRow key={`sk-ag-${i}`}>
                        <TableCell colSpan={7}>
                          <Skeleton height={24} />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!agencyLoading &&
                    agencyRows.map((l) => {
                      const price = formatPrice(l.price, l.currency);
                      const created =
                        l.created_at &&
                        new Date(l.created_at).toLocaleDateString();

                      return (
                        <TableRow
                          hover
                          key={l.id}
                          data-testid='row-agency-listing'
                        >
                          <TableCell>{l.brand}</TableCell>
                          <TableCell>{l.model}</TableCell>
                          <TableCell align='right'>{price}</TableCell>
                          <TableCell align='center'>{l.stock ?? "—"}</TableCell>
                          <TableCell align='center'>
                            {l.is_active ? "Activo" : "Cancelado"}
                          </TableCell>
                          <TableCell align='center'>{created ?? "—"}</TableCell>
                          <TableCell align='center'>
                            {l.is_active ? (
                              <Button
                                size='small'
                                variant='outlined'
                                onClick={() => handleCancelListing(l.id)}
                                sx={{ mr: 1, mb: 0.5 }}
                              >
                                Cancelar
                              </Button>
                            ) : (
                              <Button
                                size='small'
                                variant='outlined'
                                onClick={() => handleActivateListing(l.id)}
                                sx={{ mr: 1, mb: 0.5 }}
                              >
                                Activar
                              </Button>
                            )}
                            <Button
                              size='small'
                              variant='outlined'
                              color='error'
                              onClick={() => handleDeleteListing(l.id)}
                              sx={{ mr: 1, mb: 0.5 }}
                            >
                              Eliminar
                            </Button>
                            <Button
                              size='small'
                              variant='outlined'
                              onClick={() => goToAgencyDetail(l.id)}
                              sx={{ mb: 0.5 }}
                            >
                              Ver detalle
                            </Button>
                            <Button
                              variant='contained'
                              size='small'
                              sx={{ ml: 1 }}
                              onClick={() => goToAgencyEdit(l.id)}
                            >
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {!agencyLoading && agencyRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography color='text.secondary'>
                          No tenés autos publicados todavía.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component='div'
              rowsPerPageOptions={[5, 10, 20]}
              count={agencyTotal}
              rowsPerPage={agencyPageSize}
              page={agencyPage}
              onPageChange={(_, p) => setAgencyPage(p)}
              onRowsPerPageChange={(e) => {
                setAgencyPage(0);
                setAgencyPageSize(parseInt(e.target.value, 10));
              }}
            />
          </Paper>
        </Container>
      ) : (
        // =========================
        // Vista BUYER/ADMIN: buscador general (tu vista original)
        // =========================
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
              <Grid item xs={12} md='auto'>
                <Stack direction='row' spacing={1}>
                  <Button
                    variant='contained'
                    onClick={runSearch}
                    disabled={loading}
                    data-testid='btn-buscar'
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
                        <TableCell colSpan={showAgency ? 7 : 6}>
                          <Skeleton height={24} />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!loading &&
                    rows.map((r) => {
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
                        <TableRow
                          hover
                          key={id ?? `${brand}-${model}`}
                          data-testid='row-listing'
                          data-listing-id={id}
                        >
                          <TableCell>{brand}</TableCell>
                          <TableCell title={r.seller_notes || ""}>
                            {model}
                          </TableCell>
                          {showAgency && <TableCell>{agency}</TableCell>}
                          <TableCell align='right'>{price}</TableCell>
                          <TableCell align='center'>{stock}</TableCell>

                          {/* Estrella de estado */}
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

                          <TableCell
                            align='center'
                            sx={{ whiteSpace: "nowrap" }}
                          >
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
      )}
    </>
  );
}
