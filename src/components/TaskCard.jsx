import React, { useState, memo, useCallback } from "react";
import { useDrag } from "react-dnd";
import { useDispatch } from "react-redux";
import { deleteTask } from "../store/kanbanSlice";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Chip,
  alpha,
  useTheme,
  Card,
  CardContent,
  Slide,
  Badge
} from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import dayjs from "dayjs";
import UpdateTaskForm from "./UpdateTaskForm";
import { useSocket } from "../hooks/useSocket";

// Import plugins for relative date formatting
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import isTomorrow from "dayjs/plugin/isTomorrow";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isTomorrow);

const formatDueDate = (dueDate) => {
  if (!dueDate) return { text: "No due date", color: "#9CA3AF", icon: <EventIcon sx={{ fontSize: 14 }} /> };
  
  const date = dayjs(dueDate);
  if (date.isToday()) return { text: "Today", color: "#EF4444", icon: <EventIcon sx={{ fontSize: 14 }} /> };
  if (date.isTomorrow()) return { text: "Tomorrow", color: "#F59E0B", icon: <EventIcon sx={{ fontSize: 14 }} /> };
  if (date.isYesterday()) return { text: "Overdue", color: "#DC2626", icon: <EventIcon sx={{ fontSize: 14 }} /> };
  return { text: date.format("MMM D"), color: "#3B82F6", icon: <EventIcon sx={{ fontSize: 14 }} /> };
};

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return '#DC2626';
    case 'medium': return '#F59E0B';
    case 'low': return '#10B981';
    default: return '#9CA3AF';
  }
};

const getPriorityIcon = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return '🔥';
    case 'medium': return '⚠️';
    case 'low': return '💤';
    default: return '';
  }
};

const TaskCard = memo(({ task, sectionId }) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const socket = useSocket();
  const theme = useTheme();

  const { text: dueText, color: dueColor, icon: dueIcon } = formatDueDate(task.dueDate);
  const priorityColor = getPriorityColor(task.priority);
  const priorityIcon = getPriorityIcon(task.priority);

  // Drag handling
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: () => ({
      taskId: task._id,
      sourceSectionId: sectionId,
      task: task
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleMenuOpen = useCallback((event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleUpdateTask = useCallback(() => {
    setIsUpdateFormOpen(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete the task "${task.name}"?`)) {
      dispatch(deleteTask({ sectionId, taskId: task._id }));
    }
    handleMenuClose();
  }, [dispatch, handleMenuClose, sectionId, task._id, task.name, socket]);

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Card
        ref={drag}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        elevation={isHovered ? 4 : 1}
        sx={{
          m: 0.5,
          mb: 1.5,
          borderRadius: 3,
          cursor: "grab",
          opacity: isDragging ? 0.5 : 1,
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.2s ease-in-out',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: theme.palette.background.paper,
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {/* Priority indicator bar on the left */}
        {task.priority && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: 4, 
              height: '100%', 
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              backgroundColor: priorityColor 
            }} 
          />
        )}

        <CardContent sx={{ p: 2, pl: task.priority ? 3 : 2, '&:last-child': { pb: 2 } }}>
          {/* Task Title and Menu Button */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                pr: 1,
                lineHeight: 1.3,
                flex: 1
              }}
            >
              {task.name}
            </Typography>
            
            <IconButton 
              size="small" 
              onClick={handleMenuOpen}
              sx={{ 
                opacity: isHovered ? 1 : 0.5,
                transition: 'opacity 0.2s ease',
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                }
              }}
            >
              <MoreHorizIcon fontSize="small" />
            </IconButton>
            
            <Menu 
              anchorEl={anchorEl} 
              open={Boolean(anchorEl)} 
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  mt: 0.5
                }
              }}
            >
              <MenuItem onClick={handleUpdateTask} sx={{ py: 1 }}>
                <EditIcon sx={{ mr: 1.5, fontSize: 20, color: theme.palette.text.secondary }} />
                Edit Task
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ py: 1, color: theme.palette.error.main }}>
                <DeleteOutlineIcon sx={{ mr: 1.5, fontSize: 20 }} />
                Delete
              </MenuItem>
            </Menu>
          </Box>

          {/* Task description (if exists) */}
          {task.description && (
            <Tooltip title={task.description} arrow>
              <Chip
                icon={<DescriptionIcon sx={{ fontSize: 14 }} />}
                label={task.description.length > 30 ? `${task.description.substring(0, 30)}...` : task.description}
                size="small"
                variant="outlined"
                sx={{
                  mb: 1.5,
                  height: 24,
                  fontSize: '0.7rem',
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.text.secondary,
                  '& .MuiChip-icon': {
                    color: theme.palette.primary.main,
                    ml: 0.5
                  }
                }}
              />
            </Tooltip>
          )}

          {/* Metadata row */}
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
            {/* Left side: Due date and assignee */}
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              {/* Due Date */}
              <Chip
                icon={dueIcon}
                label={dueText}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  backgroundColor: alpha(dueColor, 0.1),
                  color: dueColor,
                  '& .MuiChip-icon': {
                    color: dueColor,
                    ml: 0.5
                  }
                }}
              />

              {/* Assignee */}
              {task.assignee && (
                <Tooltip title={task.assignee} arrow>
                  <Avatar
                    src={`https://avatar.iran.liara.run/username?username=${task.assignee}`}
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      fontSize: "0.7rem",
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      color: theme.palette.primary.main
                    }}
                  >
                    {task.assignee.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              )}
            </Box>

            {/* Right side: Priority badge (always show if priority exists) */}
            {task.priority && (
              <Chip
                icon={<span>{priorityIcon}</span>}
                label={task.priority}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: alpha(priorityColor, 0.15),
                  color: priorityColor,
                  textTransform: 'capitalize',
                  border: `1px solid ${alpha(priorityColor, 0.3)}`,
                  '& .MuiChip-icon': {
                    fontSize: '0.85rem',
                    ml: 0.5
                  }
                }}
              />
            )}
          </Box>
        </CardContent>

        {/* Update Task Dialog */}
        <UpdateTaskForm
          open={isUpdateFormOpen}
          onClose={() => setIsUpdateFormOpen(false)}
          task={task}
          sectionId={sectionId}
        />
      </Card>
    </Slide>
  );
});

export default TaskCard;