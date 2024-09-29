import { Box, CircularProgress, Typography } from "@mui/material";
/**
 * Loading spinner
 */
const Spinner = () => {
  return (
    <Box
      sx={({ spacing }) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: spacing(2),
      })}
      role="status"
    >
      <Typography variant="h4" gutterBottom>
        Loading...
      </Typography>
      <CircularProgress />
    </Box>
  );
};

export default Spinner;
