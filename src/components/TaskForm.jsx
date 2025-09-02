import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  alpha,
  useTheme,
  InputAdornment,
  MenuItem,
  Chip
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Title as TitleIcon,
  LowPriority as PriorityIcon
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const TaskForm = ({ open, onClose, onSubmit, sectionColor = "#3B82F6" }) => {
  const theme = useTheme();
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: null,
    assignee: user ? user.name : "",
    priority: ""
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        description: "",
        dueDate: null,
        assignee: user ? user.name : "",
        priority: ""
      });
    }
  }, [open, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, dueDate: newDate });
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      dueDate: formData.dueDate ? formData.dueDate.toISOString() : ""
    };
    onSubmit(submitData);
    onClose();
  };

  const priorities = [
    { value: "high", label: "High", color: "#DC2626" },
    { value: "medium", label: "Medium", color: "#F59E0B" },
    { value: "low", label: "Low", color: "#10B981" }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: `linear-gradient(135deg, ${alpha(sectionColor, 0.2)} 0%, ${alpha(sectionColor, 0.05)} 100%)`,
          borderBottom: `1px solid ${alpha(sectionColor, 0.2)}`,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: sectionColor
          }}
        />
        <Typography variant="h6" fontWeight={600}>
          Create New Task
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <TextField
          name="name"
          label="Task Name"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TitleIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <TextField
          name="description"
          label="Description"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={formData.description}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DescriptionIcon sx={{ color: theme.palette.text.secondary, mt: 'auto', mb: 'auto' }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <Box display="flex" gap={2} sx={{ mb: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  }
                }
              }}
            />
          </LocalizationProvider>
          
          <TextField
            name="assignee"
            label="Assignee"
            fullWidth
            margin="normal"
            value={formData.assignee}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <TextField
          name="priority"
          label="Priority"
          select
          fullWidth
          margin="normal"
          value={formData.priority}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PriorityIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="">None</MenuItem>
          {priorities.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: option.color
                  }}
                />
                {option.label}
              </Box>
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            borderRadius: 2,
            px: 2,
            py: 1
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!formData.name.trim()}
          sx={{ 
            borderRadius: 2,
            px: 2,
            py: 1,
            background: `linear-gradient(135deg, ${sectionColor} 0%, ${alpha(sectionColor, 0.8)} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(sectionColor, 0.9)} 0%, ${alpha(sectionColor, 0.7)} 100%)`,
            }
          }}
        >
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;

