import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Stack,
  Chip,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getMyListings,
  cancelListing,
  activateListing,
  deleteListing,
} from "../infra/agencyListingsService";

const formatPrice = (amount, currency) => {
  if (amount == null) return "—";
  const cur = currency ? `${currency} ` : "";
  return cur + Number(amount).toLocaleString();
};

export default function AgencyHomeListings() {
  const navigate = useNavigate();

  const [agencyBrand, setAgencyBrand] = useState("");
  const [agencyModel, setAgencyModel] = useState("");
  const [agencyOnlyActive, setAgencyOnlyActive] = useState(false);
  const [agencyMinPrice, setAgencyMinPrice] = useState("");
  const [agencyMaxPrice, setAgencyMaxPrice] = useState("");
  const [agencySort, setAgencySort] = useState("newest");

  const [agencyRows, setAgencyRows] = useState([]);
  const [agencyLoading, setAgencyLoading] = useState(false);
  const [agencyTotal, setAgencyTotal] = useState(0);
  const [agencyPage, setAgencyPage] = useState(0); // UI 0-based
  const [agencyPageSize, setAgencyPageSize] = useState(10);

  const loadAgencyListings = async () => {
    if (
      agencyMinPrice &&
      agencyMaxPrice &&
      Number(agencyMinPrice) > Number(agencyMaxPrice)
    ) {
      alert("min_price no puede ser mayor que max_price");
      return;
    }

    setAgencyLoading(true);
    try {
      const data = await getMyListings({
        page: agencyPage + 1, // backend 1-based
        pageSize: agencyPageSize,
        brand: agencyBrand || undefined,
        model: agencyModel || undefined,
        isActive: agencyOnlyActive ? true : undefined,
        minPrice: agencyMinPrice ? Number(agencyMinPrice) : undefined,
        maxPrice: agencyMaxPrice ? Number(agencyMaxPrice) : undefined,
        sort: agencySort,
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

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (cancelled) return;
      await loadAgencyListings();
    }

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    agencyPage,
    agencyPageSize,
    agencyBrand,
    agencyModel,
    agencyOnlyActive,
    agencyMinPrice,
    agencyMaxPrice,
    agencySort,
  ]);

  const goToAgencyDetail = (id) => {
    navigate(`/agencies/listings/${id}`);
  };

  const goToAgencyEdit = (id) => {
    navigate(`/agencies/listings/${id}/edit`);
  };

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

  const handleClearFilters = () => {
    setAgencyBrand("");
    setAgencyModel("");
    setAgencyOnlyActive(false);
    setAgencyMinPrice("");
    setAgencyMaxPrice("");
    setAgencySort("newest");
    setAgencyPage(0);
    setAgencyPageSize(10);
    // no llamamos a loadAgencyListings: el useEffect se dispara solo
  };

  return (
    <Container maxWidth='lg' sx={{ py: 2 }}>
      <Typography variant='h4' gutterBottom>
        Mis autos publicados
      </Typography>

      <Paper
        variant='outlined'
        sx={{
          p: 2,
          mb: 2,
          borderTop: (t) => `3px solid ${t.palette.warning.main}`,
        }}
      >
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={3}>
            <TextField
              label='Marca'
              value={agencyBrand}
              onChange={(e) => {
                setAgencyBrand(e.target.value);
                setAgencyPage(0);
              }}
              fullWidth
              size='small'
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label='Modelo'
              value={agencyModel}
              onChange={(e) => {
                setAgencyModel(e.target.value);
                setAgencyPage(0);
              }}
              fullWidth
              size='small'
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              label='min_price'
              value={agencyMinPrice}
              onChange={(e) => {
                setAgencyMinPrice(e.target.value.replace(/[^\d]/g, ""));
                setAgencyPage(0);
              }}
              fullWidth
              size='small'
              inputMode='numeric'
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              label='max_price'
              value={agencyMaxPrice}
              onChange={(e) => {
                setAgencyMaxPrice(e.target.value.replace(/[^\d]/g, ""));
                setAgencyPage(0);
              }}
              fullWidth
              size='small'
              inputMode='numeric'
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              select
              label='Orden'
              value={agencySort}
              onChange={(e) => {
                setAgencySort(e.target.value);
                setAgencyPage(0);
              }}
              fullWidth
              size='small'
            >
              <MenuItem value='newest'>Más nuevos</MenuItem>
              <MenuItem value='price_asc'>Precio ↑</MenuItem>
              <MenuItem value='price_desc'>Precio ↓</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6} md={3}>
            <Stack direction='row' alignItems='center'>
              <Chip
                label={agencyOnlyActive ? "Sólo activas" : "Todas"}
                variant={agencyOnlyActive ? "filled" : "outlined"}
                color='warning'
                onClick={() => {
                  setAgencyOnlyActive((prev) => !prev);
                  setAgencyPage(0);
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md='auto'>
            <Button variant='outlined' onClick={handleClearFilters}>
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
                    l.created_at && new Date(l.created_at).toLocaleDateString();

                  return (
                    <TableRow hover key={l.id} data-testid='row-agency-listing'>
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
  );
}
