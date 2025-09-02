import React, { useState, memo } from "react";
import { useDrop } from "react-dnd";
import { useDispatch } from "react-redux";
import { addTask, deleteSection, updateSection, moveTask, addSection } from "../store/kanbanSlice";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  alpha,
  useTheme
} from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import { useSocket } from "../hooks/useSocket";
import { keyframes } from "@emotion/react";

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const Section = memo(({ section }) => {
  const dispatch = useDispatch();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const socket = useSocket();
  const theme = useTheme();

  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item) => {
      if (item.sourceSectionId !== section._id) {
        dispatch(moveTask({
          taskId: item.taskId,
          sourceSectionId: item.sourceSectionId,
          destinationSectionId: section._id,
          task: item.task
        }));
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const handleAddTask = (taskData) => {
    const newTask = { ...taskData, section: section._id };
    dispatch(addTask(newTask));
  };

  const handleAddSection = () => {
    if (newSectionTitle.trim() !== "") {
      const sectionData = {
        name: newSectionTitle,
        selectedSectionId: section._id
      };
      dispatch(addSection(sectionData));
      setNewSectionTitle("");
      setIsSectionFormOpen(false);
    }
  };

  const handleDeleteSection = () => {
    if (window.confirm(`Are you sure you want to delete the section "${section.name}"?`)) {
      dispatch(deleteSection(section._id));
    }
    setMenuAnchorEl(null);
  };

  const handleUpdateSection = () => {
    const newTitle = prompt("Enter new title for the section:", section.name);
    if (newTitle && newTitle.trim() !== "") {
      dispatch(updateSection({ sectionId: section._id, name: newTitle }));
    }
    setMenuAnchorEl(null);
  };

  // Get a color based on section name for visual distinction
  const getSectionColor = (name) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const sectionColor = getSectionColor(section.name);

  return (
    <Paper 
      ref={drop}
      elevation={isHovered ? 4 : 1}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: "100%",
        padding: 2,
        opacity: isOver ? 0.85 : 1,
        transition: 'all 0.2s ease',
        willChange: 'transform, opacity, box-shadow',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        background: `linear-gradient(135deg, ${alpha(sectionColor, 0.05)} 0%, ${alpha('#ffffff', 0.8)} 100%)`,
        border: `1px solid ${alpha(sectionColor, 0.2)}`,
        borderRadius: 3,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${sectionColor}, ${alpha(sectionColor, 0.5)})`,
          borderRadius: '3px 3px 0 0',
        }
      }}
    >
      {/* Section Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={2}
        sx={{ animation: `${fadeIn} 0.3s ease-out` }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box 
            component="span" 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: sectionColor,
              display: 'inline-block'
            }} 
          />
          {section.name}
          <Box 
            component="span" 
            sx={{ 
              ml: 1,
              backgroundColor: alpha(sectionColor, 0.1),
              color: sectionColor,
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: 10,
              fontWeight: 500
            }}
          >
            {section.tasks?.length || 0}
          </Box>
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton 
            onClick={() => setIsTaskFormOpen(true)}
            size="small"
            sx={{ 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <AddIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
          </IconButton>
          
          <IconButton
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
            aria-controls="section-menu"
            aria-haspopup="true"
            size="small"
            sx={{ 
              backgroundColor: alpha(theme.palette.text.secondary, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.secondary, 0.2),
              }
            }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
          
          <Menu
            id="section-menu"
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                mt: 1
              }
            }}
          >
            <MenuItem onClick={handleUpdateSection} sx={{ py: 1 }}>
              <EditIcon sx={{ mr: 1, fontSize: 20, color: theme.palette.text.secondary }} />
              Update Title
            </MenuItem>
            <MenuItem onClick={handleDeleteSection} sx={{ py: 1, color: theme.palette.error.main }}>
              <DeleteOutlineIcon sx={{ mr: 1, fontSize: 20 }} />
              Delete Section
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Task Container */}
      <Paper
        sx={{
          height: "calc(100% - 80px)",
          overflowY: "auto",
          bgcolor: alpha(theme.palette.background.default, 0.5),
          padding: 2,
          borderRadius: 2,
          minHeight: "200px",
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          animation: `${fadeIn} 0.4s ease-out 0.1s both`,
        }}
      >
        {(!section.tasks || section.tasks.length === 0) ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme.palette.text.secondary,
              border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
              borderRadius: 2,
              py: 4,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                animation: `${pulse} 1s ease-in-out`,
              }
            }}
            onClick={() => setIsTaskFormOpen(true)}
          >
            <AddIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              Drop tasks here or click to add
            </Typography>
          </Box>
        ) : (
          <>
            {section.tasks?.map((task, index) => (
              <TaskCard 
                key={`${task._id}-${section._id}`} 
                task={task} 
                sectionId={section._id}
                style={{ animation: `${fadeIn} 0.3s ease-out ${index * 0.05}s both` }}
              />
            ))}
            
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => setIsTaskFormOpen(true)} 
              startIcon={<AddIcon />}
              sx={{ 
                mt: 1,
                py: 1,
                borderRadius: 2,
                borderStyle: 'dashed',
                borderColor: alpha(theme.palette.primary.main, 0.5),
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: theme.palette.primary.main,
                  borderStyle: 'solid',
                }
              }}
            >
              Add Task
            </Button>
          </>
        )}
      </Paper>

      {/* Add Section Dialog */}
      <Dialog 
        open={isSectionFormOpen} 
        onClose={() => {
          setIsSectionFormOpen(false);
          setNewSectionTitle("");
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: alpha(sectionColor, 0.1),
          borderBottom: `1px solid ${alpha(sectionColor, 0.2)}`,
          fontWeight: 600
        }}>
          Add New Section
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Section Title"
            fullWidth
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setIsSectionFormOpen(false);
              setNewSectionTitle("");
            }}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddSection} 
            variant="contained" 
            sx={{ borderRadius: 2 }}
            disabled={!newSectionTitle.trim()}
          >
            Add Section
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Task Dialog */}
      <TaskForm
        open={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleAddTask}
        defaultAssignee="Current User"
        sectionColor={sectionColor}
      />
    </Paper>
  );
});

export default Section;