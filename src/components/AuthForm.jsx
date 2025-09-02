import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser, loginUser } from "../store/authSlice";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Fade,
  Zoom,
  Divider,
  InputAdornment,
  IconButton,
  Avatar,
  CircularProgress
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  PhotoCamera,
  Close
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";


const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 16,
    background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    overflow: "hidden",
    maxWidth: "450px",
  },
}));

const DialogHeader = styled(Box)(({ theme, isLogin }) => ({
  background: isLogin 
    ? "linear-gradient(45deg, #2196F3, #21CBF3)"
    : "linear-gradient(45deg, #FF4081, #F50057)",
  color: "white",
  padding: "24px 24px 16px",
  position: "relative",
}));

const ToggleContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  marginTop: 16,
});

const ToggleButton = styled(Button)(({ active, theme }) => ({
  fontWeight: active ? 600 : 400,
  fontSize: "1.1rem",
  color: active ? "white" : "rgba(255, 255, 255, 0.7)",
  borderBottom: active ? "2px solid white" : "none",
  borderRadius: 0,
  padding: "4px 16px",
  minWidth: "auto",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: 16,
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    "&:hover fieldset": {
      borderColor: "#2196F3",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2196F3",
      borderWidth: "1px",
    },
  },
}));

const SubmitButton = styled(Button)(({ isLogin, theme }) => ({
  background: isLogin
    ? "linear-gradient(45deg, #2196F3, #21CBF3)"
    : "linear-gradient(45deg, #FF4081, #F50057)",
  color: "white",
  borderRadius: 12,
  padding: "12px 0",
  fontWeight: 600,
  fontSize: "1rem",
  marginBottom: 16,
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    boxShadow: "0 6px 14px rgba(0, 0, 0, 0.15)",
    transform: "translateY(-1px)",
  },
  transition: "all 0.2s ease",
}));

const SocialLogin = styled(Box)({
  display: "flex",
  justifyContent: "center",
  gap: 16,
  margin: "24px 0",
});

const SocialButton = styled(IconButton)({
  border: "1px solid #e0e0e0",
  borderRadius: "50%",
  padding: 12,
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
});

const AuthForm = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const { token, loading, error, signupSuccess } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", userPhoto: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", userPhoto: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(loginUser({ email: formData.email, password: formData.password }));
    } else {
      dispatch(signupUser(formData));
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

 
  useEffect(() => {
    if (signupSuccess) {
      
      setIsLogin(true);
      setFormData(prev => ({
        name: "",
        email: prev.email, 
        password: "",
        userPhoto: ""
      }));
    }
  }, [signupSuccess]);

  // Close form when user is authenticated
  useEffect(() => {
    if (token) {
      resetForm();
      handleClose();
    }
  }, [token, handleClose]);

  return (
    <StyledDialog open={open} onClose={handleClose} TransitionComponent={Fade}>
      <DialogHeader isLogin={isLogin}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "white",
          }}
        >
          <Close />
        </IconButton>
        <Box display="flex" justifyContent="center" mb={2}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            {isLogin ? (
              <Lock sx={{ fontSize: 40 }} />
            ) : (
              <Person sx={{ fontSize: 40 }} />
            )}
          </Avatar>
        </Box>
        <Typography variant="h4" align="center" fontWeight="600">
          {isLogin ? "Welcome Back" : "Create Account"}
        </Typography>
        <ToggleContainer>
          <ToggleButton 
            active={isLogin} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </ToggleButton>
          <ToggleButton 
            active={!isLogin} 
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </ToggleButton>
        </ToggleContainer>
      </DialogHeader>

      <DialogContent sx={{ p: 3 }}>
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Box component="form" noValidate onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <StyledTextField
                  label="Full Name"
                  name="name"
                  fullWidth
                  onChange={handleChange}
                  value={formData.name}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <StyledTextField
                  label="Photo URL (optional)"
                  name="userPhoto"
                  fullWidth
                  onChange={handleChange}
                  value={formData.userPhoto}
                  placeholder="Enter image URL"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhotoCamera color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}
            <StyledTextField
              label="Email Address"
              name="email"
              type="email"
              fullWidth
              onChange={handleChange}
              value={formData.email}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <StyledTextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              fullWidth
              onChange={handleChange}
              value={formData.password}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && (
              <Typography 
                color="error" 
                variant="body2" 
                align="center" 
                sx={{ 
                  mt: 1, 
                  p: 1, 
                  backgroundColor: 'rgba(244, 67, 54, 0.1)', 
                  borderRadius: 1 
                }}
              >
                {error}
              </Typography>
            )}
            
            {!isLogin && (
              <>
                <Divider sx={{ my: 3 }}>Or continue with</Divider>
                <SocialLogin>
                  <SocialButton>
                    <Avatar src="/static/images/google-logo.png" sx={{ width: 24, height: 24 }} />
                  </SocialButton>
                  <SocialButton>
                    <Avatar src="/static/images/facebook-logo.png" sx={{ width: 24, height: 24 }} />
                  </SocialButton>
                  <SocialButton>
                    <Avatar src="/static/images/twitter-logo.png" sx={{ width: 24, height: 24 }} />
                  </SocialButton>
                </SocialLogin>
              </>
            )}
            
            <SubmitButton
              type="submit"
              fullWidth
              disabled={loading}
              isLogin={isLogin}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isLogin ? (
                "Login"
              ) : (
                "Create Account"
              )}
            </SubmitButton>
            
            <Box textAlign="center">
              <Button
                onClick={handleToggleMode}
                color="primary"
                sx={{ textTransform: 'none', fontSize: '0.9rem' }}
              >
                {isLogin 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Sign In"}
              </Button>
            </Box>
          </Box>
        </Zoom>
      </DialogContent>
    </StyledDialog>
  );
};

export default AuthForm;