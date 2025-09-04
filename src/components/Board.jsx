import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addSection, fetchSections } from '../store/kanbanSlice';
import {
  logoutUser,
  fetchUserCount,
  fetchCurrentUser,
} from '../store/authSlice';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  AppBar,
  Toolbar,
  InputAdornment,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Drawer,
  Chip,
  Fab,
  SwipeableDrawer,
} from '@mui/material';
import Section from './Section';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import AuthForm from './AuthForm';
import LoadingScreen from './LoadingScreen';
import { useSocket } from '../hooks/useSocket';
import {
  addTaskLocal,
  updateTaskLocal,
  addSectionLocal,
  updateSectionLocal,
  deleteSectionLocal,
  moveTaskLocal,
  deleteTaskLocal,
} from '../store/kanbanSlice';

const Board = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { sections, loading } = useSelector((state) => state.kanban);
  const auth = useSelector((state) => state.auth) || {};
  const user = auth?.user;
  const token = auth?.token;
  const userPhoto = auth?.user?.userPhoto;
  const userCount = useSelector((state) => state.auth.userCount);

  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isAuthFormOpen, setIsAuthFormOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the default board room when connected
    socket.emit('join-board', 'default-board');

    // Listen for section events
    socket.on('section-added', (data) => {
      dispatch(addSectionLocal(data.section));
    });

    socket.on('section-updated', (data) => {
      dispatch(updateSectionLocal(data.section));
    });

    socket.on('section-deleted', (data) => {
      dispatch(deleteSectionLocal(data.sectionId));
    });

    // Listen for task events
    socket.on('task-added', (data) => {
      dispatch(addTaskLocal({ sectionId: data.sectionId, task: data.task }));
    });

    socket.on('task-updated', (data) => {
      dispatch(
        updateTaskLocal({ taskId: data.task._id, updatedTask: data.task })
      );
    });

    socket.on('task-moved', (data) => {
      dispatch(moveTaskLocal(data));
    });

    socket.on('task-deleted', (data) => {
      dispatch(deleteTaskLocal({ taskId: data.taskId }));
    });

    return () => {
      socket.emit('leave-board', 'default-board');
      socket.off('section-added');
      socket.off('section-updated');
      socket.off('section-deleted');
      socket.off('task-added');
      socket.off('task-updated');
      socket.off('task-moved');
      socket.off('task-deleted');
    };
  }, [socket, isConnected, dispatch]);

  useEffect(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  // Ensure re-render when token changes
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    dispatch(fetchUserCount()); // Fetch user count on mount
  }, [dispatch]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (isMobile) {
      setShowSearch(false);
    }
  };

  const handleAddSection = () => {
    if (newSectionTitle.trim() !== '') {
      dispatch(addSection({ name: newSectionTitle }));
      setNewSectionTitle('');
      setIsSectionFormOpen(false);
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    handleUserMenuClose();
  };

  // Filter sections and tasks based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    
    const query = searchQuery.toLowerCase();
    
    return sections
      .map(section => ({
        ...section,
        tasks: section.tasks?.filter(task => 
          task.name?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.assignee?.toLowerCase().includes(query) ||
          task.priority?.toLowerCase().includes(query)
        ) || []
      }))
      .filter(section => section.tasks.length > 0);
  }, [sections, searchQuery]);

  const renderAuthButton = () => {
    if (!token) {
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsAuthFormOpen(true)}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
            },
            minWidth: isMobile ? 'auto' : 'inherit',
            px: isMobile ? 1 : 2,
          }}
        >
          {isMobile ? 'Login' : 'Sign Up / Login'}
        </Button>
      );
    }

    return (
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={handleUserMenuOpen} size="small">
          <Avatar
            src={userPhoto}
            alt={user?.name}
            sx={{
              width: isMobile ? 32 : 40,
              height: isMobile ? 32 : 40,
              cursor: 'pointer',
              border: '2px solid #667eea',
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : '?'}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={userMenuAnchorEl}
          open={Boolean(userMenuAnchorEl)}
          onClose={handleUserMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
          }}
        >
          <MenuItem sx={{ cursor: 'default' }}>
            <Box>
              <Typography variant="body2" fontWeight="600">
                {user?.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user?.email}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: '#ff4444' }}>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  const renderSearchBar = () => {
    if (isMobile && !showSearch) {
      return (
        <IconButton 
          onClick={() => setShowSearch(true)}
          sx={{ color: '#667eea' }}
        >
          <SearchIcon />
        </IconButton>
      );
    }

    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          width: isMobile ? '100%' : (isTablet ? 200 : 300),
          ...(isMobile && {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            bgcolor: 'white',
            px: 1,
          })
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search tasks..."
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          sx={{
            width: '100%',
            bgcolor: 'white',
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (searchQuery || isMobile) && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={clearSearch}
                  edge="end"
                >
                  {isMobile ? <CloseIcon fontSize="small" /> : <ClearIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          autoFocus={isMobile && showSearch}
        />
      </Box>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <AppBar
        position="static"
        elevation={1}
        sx={{ 
          bgcolor: 'white', 
          color: 'text.primary',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderBottom: '1px solid #e9ecef',
          position: 'relative',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1,
            minHeight: { xs: '56px', sm: '64px' },
          }}
        >
          {/* Left: Logo & Title */}
          <Box display="flex" alignItems="center" gap={1} sx={{ 
            flex: isMobile && showSearch ? 0 : 1,
            minWidth: isMobile && showSearch ? 0 : 'auto',
            overflow: isMobile && showSearch ? 'hidden' : 'visible',
          }}>
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                edge="start"
                sx={{ color: '#667eea', mr: 1 }}
                size="small"
              >
                <MenuIcon />
              </IconButton>
            )}
            <ViewKanbanIcon 
              sx={{ 
                color: '#667eea', 
                fontSize: isMobile ? '28px' : '32px',
                mr: 1,
                display: isMobile && showSearch ? 'none' : 'block',
              }} 
            />
            <Box sx={{ display: isMobile && showSearch ? 'none' : 'block' }}>
              <Typography 
                variant={isMobile ? 'h6' : 'h5'} 
                fontWeight="700"
                noWrap
                sx={{ 
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                KanbanFlow
              </Typography>
              {!isMobile && (
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Chip
                    icon={<DashboardIcon />}
                    label={`${sections.length} boards`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 24 }}
                  />
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${userCount} members`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 24 }}
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* Search Bar & Auth Buttons */}
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            sx={{
              flex: isMobile && showSearch ? 1 : 0,
              justifyContent: 'flex-end',
              ...(isMobile && showSearch ? {
                position: 'absolute',
                left: 0,
                right: 0,
                px: 1,
              } : {})
            }}
          >
            {!isMobile && renderSearchBar()}
            {isMobile && !showSearch && renderAuthButton()}
            {isMobile && showSearch && (
              <Box sx={{ flex: 1 }}>
                {renderSearchBar()}
              </Box>
            )}
            {!isMobile && renderAuthButton()}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpen={() => setMobileMenuOpen(true)}
        PaperProps={{
          sx: {
            width: 280,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <ViewKanbanIcon sx={{ color: '#667eea', fontSize: '28px' }} />
              <Typography variant="h6" fontWeight="700">
                KanbanFlow
              </Typography>
            </Box>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <TextField
            variant="outlined"
            placeholder="Search tasks..."
            size="small"
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={clearSearch}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Box display="flex" flexDirection="column" gap={2} mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <DashboardIcon sx={{ color: '#667eea', fontSize: '20px' }} />
              <Typography variant="body1" fontWeight="500">
                {sections.length} boards
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <PeopleIcon sx={{ color: '#667eea', fontSize: '20px' }} />
              <Typography variant="body1" fontWeight="500">
                {userCount} members
              </Typography>
            </Box>
          </Box>
          
          {!token && (
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setIsAuthFormOpen(true);
                setMobileMenuOpen(false);
              }}
              sx={{
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                },
                mb: 2,
              }}
            >
              Sign Up / Login
            </Button>
          )}
          
          {token && (
            <Box>
              <Typography variant="body2" fontWeight="600" gutterBottom>
                Welcome, {user?.name}
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                sx={{ color: '#ff4444', borderColor: '#ff4444' }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Box>
      </SwipeableDrawer>

      {/* Board Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: { xs: 1, sm: 2 },
          gap: { xs: 1, sm: 2 },
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
          },
          position: 'relative',
        }}
      >
        {filteredSections.map((section) => (
          <Box
            key={section._id}
            sx={{
              minWidth: { xs: '85vw', sm: 320 },
              maxWidth: { xs: '85vw', sm: 320 },
            }}
          >
            <Section
              key={`${section._id}-${section.tasks.length}`}
              section={section}
            />
          </Box>
        ))}

        {/* Show message when no results found */}
        {searchQuery && filteredSections.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              color: 'text.secondary',
              fontSize: '1.1rem',
              textAlign: 'center',
              padding: 4,
            }}
          >
            No tasks found for "{searchQuery}"
          </Box>
        )}

        {/* Only show Add Section button when not searching */}
        {!searchQuery && (
          <Box
            sx={{
              minWidth: { xs: '85vw', sm: 320 },
              maxWidth: { xs: '85vw', sm: 320 },
              display: 'flex',
              alignItems: 'flex-start',
              pt: '10px',
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setIsSectionFormOpen(true)}
              sx={{
                height: '48px',
                width: '100%',
                border: '2px dashed #dee2e6',
                borderRadius: 2,
                color: '#6c757d',
                '&:hover': {
                  border: '2px dashed #667eea',
                  color: '#667eea',
                  background: 'rgba(102, 126, 234, 0.04)',
                },
              }}
            >
              <AddIcon sx={{ mr: 1 }} />
              Add Section
            </Button>
          </Box>
        )}
      </Box>

      {/* Floating Action Button for Mobile */}
      {isMobile && !searchQuery && (
        <Fab
          color="primary"
          aria-label="add section"
          onClick={() => setIsSectionFormOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Add Section Popup */}
      <Dialog
        open={isSectionFormOpen}
        onClose={() => setIsSectionFormOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            mx: { xs: 2, sm: 0 },
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: 'none', sm: 500 },
          },
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: '600'
        }}>
          Add New Section
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Section Title"
            fullWidth
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            autoFocus
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setIsSectionFormOpen(false)}
            sx={{ color: '#6c757d' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddSection}
            sx={{
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Add Section
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auth Form Popup */}
      <AuthForm
        open={isAuthFormOpen}
        handleClose={() => setIsAuthFormOpen(false)}
      />
    </Box>
  );
};

export default Board;