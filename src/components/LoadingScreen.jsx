import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { keyframes } from "@emotion/react";

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const moveCard = keyframes`
  0% { transform: translateY(-10px); opacity: 0; }
  10% { transform: translateY(0); opacity: 1; }
  90% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(10px); opacity: 0; }
`;

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        textAlign: "center",
        padding: 2,
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 30% 50%, rgba(120, 119, 198, 0.3) 0%, rgba(0,0,0,0) 60%)",
          zIndex: 0,
        }
      }}
    >
      {/* Animated Kanban columns */}
      <Box sx={{ 
        display: "flex", 
        gap: 3, 
        mb: 4, 
        position: "relative",
        zIndex: 1,
        animation: `${fadeIn} 0.8s ease-out`,
      }}>
        {['To Do', 'In Progress', 'Done'].map((column, index) => (
          <Box key={index} sx={{ 
            width: 100, 
            background: 'rgba(255, 255, 255, 0.15)', 
            borderRadius: 2, 
            padding: 1.5,
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
              {column}
            </Typography>
            
            {/* Animated cards in each column */}
            {[0, 1, 2].map((cardIdx) => (
              <Box 
                key={cardIdx}
                sx={{
                  height: 16,
                  background: 'rgba(255, 255, 255, 0.25)',
                  borderRadius: 1,
                  mb: 1,
                  animation: `${moveCard} 2s infinite ease-in-out`,
                  animationDelay: `${index * 0.3 + cardIdx * 0.4}s`,
                }}
              />
            ))}
          </Box>
        ))}
      </Box>
      
      {/* Main title with animation */}
      <Typography 
        variant="h4" 
        fontWeight="bold" 
        sx={{ 
          mb: 2, 
          position: "relative",
          zIndex: 1,
          animation: `${fadeIn} 0.8s ease-out 0.2s both`,
        }}
      >
        Preparing Your Kanban Board
      </Typography>
      
      {/* Subtitle with animation */}
      <Typography 
        variant="body1" 
        sx={{ 
          opacity: 0.9, 
          mb: 3, 
          maxWidth: 400,
          position: "relative",
          zIndex: 1,
          animation: `${fadeIn} 0.8s ease-out 0.4s both`,
        }}
      >
        Organizing your tasks for maximum productivity
      </Typography>
      
      {/* Animated progress bar */}
      <Box sx={{ 
        width: 300, 
        maxWidth: '80%', 
        position: "relative",
        zIndex: 1,
        animation: `${fadeIn} 0.8s ease-out 0.6s both`,
      }}>
        <LinearProgress 
          sx={{ 
            height: 8, 
            borderRadius: 4, 
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'white',
              animation: `${pulse} 1.5s ease-in-out infinite`,
            }
          }} 
        />
      </Box>
      
      {/* Floating elements for visual interest */}
      <Box sx={{
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
        top: '20%',
        left: '15%',
        animation: `${pulse} 4s ease-in-out infinite`,
      }} />
      
      <Box sx={{
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
        bottom: '25%',
        right: '20%',
        animation: `${pulse} 3s ease-in-out infinite reverse`,
      }} />
    </Box>
  );
};

export default LoadingScreen;