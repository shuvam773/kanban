import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateTask } from "../store/kanbanSlice";
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
  MenuItem
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
import dayjs from "dayjs";


const UpdateTaskForm = ({ open, onClose, task, sectionId }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    dueDate: null,
    assignee: "",
    priority: ""
  });

  useEffect(() => {
    if (task) {
      setTaskData({
        name: task.name || "",
        description: task.description || "",
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        assignee: task.assignee || "",
        priority: task.priority || ""
      });
    }
  }, [task, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (newDate) => {
    setTaskData((prev) => ({
      ...prev,
      dueDate: newDate,
    }));
  };

  const handleSubmit = () => {
    const updatedData = {
      ...taskData,
      dueDate: taskData.dueDate ? taskData.dueDate.toISOString() : "",
      section: sectionId,
    };
    
    dispatch(updateTask({
      taskId: task._id,
      sectionId,
      taskData: updatedData,
    }));
    
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
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
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
            backgroundColor: theme.palette.primary.main
          }}
        />
        <Typography variant="h6" fontWeight={600}>
          Update Task
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <TextField
          autoFocus
          name="name"
          label="Task Name"
          fullWidth
          margin="normal"
          value={taskData.name}
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
          value={taskData.description}
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
              value={taskData.dueDate}
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
            value={taskData.assignee}
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
          value={taskData.priority}
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
          disabled={!taskData.name.trim()}
          sx={{ 
            borderRadius: 2,
            px: 2,
            py: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.7)} 100%)`,
            }
          }}
        >
          Update Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateTaskForm;