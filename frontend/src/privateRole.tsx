import { Box, CircularProgress } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, Route } from "react-router-dom";
import { AuthContext } from "./context/authContext";
import { useApi } from "./hooks/api/api";
import { NoAllowed } from "./pages/NoAllowed";

export const PrivateRole = ({ level }: { level: number }) => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const { userLogin } = useContext(AuthContext);

  const api = useApi();
  const verifyAllowed = async () => {
    api
      .user.getById(userLogin)
      .then((res) => {
        if (res.level >= level) {
          setAllowed(true);
        }
        setLoading(false);
      })
  };

  useEffect(() => {
    verifyAllowed();
  }, []);
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }} m={10}>
        <CircularProgress />
      </Box>
    );
  }
  return allowed ? <Outlet /> : <NoAllowed />;
};
