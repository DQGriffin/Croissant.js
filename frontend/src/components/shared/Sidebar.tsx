import { Drawer, Toolbar, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Collapse } from "@mui/material";
import React from "react";
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { SidebarItem } from "../../models/SidebarItem";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const Sidebar = () => {
    const [selectedItem, setSelectedItem] = useState("Create IVRs")
    const [isIVRListOpen, setIsIVRListOpen] = useState(true)
    const [isCallQueueListOpen, setIsCallQueueListOpen] = useState(false)
    const navigate = useNavigate()

    const handleClick = (text: string, destination: string) => {
        setSelectedItem(text)
        navigate(destination)
    }

    const sidebarItems: SidebarItem[] = [
        {label: 'Edit Sites', destination: '/editsites'},
        {label: 'Edit Extensions', destination: '/editextensions'},
        {label: 'Account Dump', destination: '/accountdump'},
        {label: 'Delete Extensions', destination: '/deleteextensions'},
        {label: 'Notifications', destination: '/notificationsaudit'},
        {label: 'Deskphones', destination: '/deskphones'},
    ]

    const ivrItems: SidebarItem[] = [
        {label: 'Create IVRs', destination: '/'},
        {label: 'Audit IVRs', destination: '/auditmenus'},
    ]

    const callQueueItems: SidebarItem[] = [
        {label: 'Create Call Queues', destination: '/createcallqueues'},
        {label: 'Audit Call Queues', destination: '/auditcallqueues'},
        {label: 'Call Queue Templates', destination: '/callqueuetemplates'},
    ]

    const handleToggle = () => {
        setIsIVRListOpen(!isIVRListOpen)
    }

    const handleCallQueueToggle = () => {
        setIsCallQueueListOpen(!isCallQueueListOpen)
    }

    return ( 
        <Drawer
        sx={{
          width: 230,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 230,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar className="nav-toolbar" >
            <Typography variant="h6">Croissant</Typography>
        </Toolbar>
        <Divider />
        <List>
            <ListItemButton onClick={handleToggle}>
                <ListItemText primary="IVRs" />
                {isIVRListOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isIVRListOpen} timeout='auto' unmountOnExit>
                <List>
                    {ivrItems.map((item) => (
                        <ListItem className={selectedItem === item.label ? 'nav-item-selected' : ''} key={item.label} disablePadding>
                        <ListItemButton onClick={() => handleClick(item.label, item.destination)}>
                        <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                    ))}
                </List>
            </Collapse>
            <Divider />
            <ListItemButton onClick={handleCallQueueToggle}>
                <ListItemText primary="Call Queues" />
                {isCallQueueListOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isCallQueueListOpen} timeout='auto' unmountOnExit>
                <List>
                    {callQueueItems.map((item) => (
                        <ListItem className={selectedItem === item.label ? 'nav-item-selected' : ''} key={item.label} disablePadding>
                        <ListItemButton onClick={() => handleClick(item.label, item.destination)}>
                        <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                    ))}
                </List>
            </Collapse>
            <Divider />
          {sidebarItems.map((item) => (
            <ListItem className={selectedItem === item.label ? 'nav-item-selected' : ''} key={item.label} disablePadding>
              <ListItemButton onClick={() => handleClick(item.label, item.destination)}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
     );
}
 
export default Sidebar;