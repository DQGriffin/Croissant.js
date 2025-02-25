import { Drawer, Toolbar, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Collapse, IconButton } from "@mui/material";
import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import { Navbar, Group, Code, ScrollArea, createStyles, rem } from '@mantine/core';
import {
  IconNotes,
  IconCalendarStats,
  IconPresentationAnalytics,
  IconFileAnalytics,
  IconAdjustments,
  IconLock,
  IconSitemap,
  IconLayoutList,
  IconBuildingCommunity,
  Icon123,
  IconArrowRightCircle,
  IconSettings2,
  IconTransform,
  IconUserExclamation,
} from '@tabler/icons-react';
import { LinksGroup } from "./NavBarLinksGroup";
import { UserButton } from "./UserButton";

import { useAtomValue } from 'jotai'
import { userAtom } from "../../App";
import Modal from "./Modal";
import { Settings } from "../pages/Settings/Settings";

interface SidebarGroup {
  label: string
  icon: any
  initiallyOpened: boolean
  links: SidebarLink[]
}

interface SidebarLink {
  label: string
  link: string
}

const adminLinks: SidebarGroup[] = [
  {
    label: 'Admin',
    icon: IconUserExclamation,
    initiallyOpened: false,
    links: [
      { label: 'Management Console', link: '/management-console' },
      { label: 'Audit Trail', link: '/audit-trail' },
      { label: 'Usage by Tool', link: '/usage' },
      { label: 'Usage by User', link: '/user-usage' },
      { label: 'Alert Center', link: '/alert-center' },
    ],
  }
]

const mockdata: SidebarGroup[] = [
  {
    label: 'IVRs',
    icon: IconSitemap,
    initiallyOpened: false,
    links: [
      { label: 'Create IVRs', link: '/' },
      { label: 'Audit IVRs', link: '/auditmenus' },
    ],
  },
  {
    label: 'Call Queues',
    icon: IconLayoutList,
    initiallyOpened: false,
    links: [
      { label: 'Create Call Queues', link: '/createcallqueues' },
      { label: 'Audit Call Queues', link: '/auditcallqueues' },
      { label: 'Call Queue Templates', link: '/callqueuetemplates' },
    ],
  },
  {
    label: 'Custom Rules',
    icon: IconNotes,
    initiallyOpened: false,
    links: [
      { label: 'Export Custom Rules', link: '/exportrules' },
      { label: 'Build Custom Rules', link: '/customrules' },
      { label: 'Copy Custom Rules', link: '/copycustomrules' },
      { label: 'Delete Custom Rules', link: '/customruleedit' },
    ],
  },
  {
    label: 'Sites',
    icon: IconBuildingCommunity,
    initiallyOpened: false,
    links: [
      { label: 'Create Sites', link: '/sites' },
      { label: 'Edit Sites', link: '/editsites' },
    ],
  },
  {
    label: 'Phone Numbers',
    icon: Icon123,
    initiallyOpened: false,
    links: [
      { label: 'Bulk Assign', link: '/bulkassign' },
      { label: 'Rename Numbers', link: '/rename-numbers' },
    ],
  },
  {
    label: 'Migration',
    icon: IconArrowRightCircle,
    initiallyOpened: false,
    links: [
      { label: 'Auto Migrate', link: '/migrateusers' },
      { label: 'Auto Audit', link: '/autoaudit' },
    ],
  },
  {
    label: 'Utilities',
    icon: IconSettings2,
    initiallyOpened: false,
    links: [
      { label: 'Account Dump', link: '/accountdump' },
      { label: 'Insights', link: '/account-insights' },
      { label: 'Credentials', link: '/credentials' },
      { label: 'Upload Devices', link: '/uploaddevices' },
      { label: 'Account Templates', link: '/accounttemplates' },
      { label: 'Extension Upload', link: '/extensionupload' },
      { label: 'Delete Extensions', link: '/deleteextensions' },
      { label: 'Edit Extensions', link: '/editextensions' },
      { label: 'Notifications', link: '/notificationsaudit' },
      { label: 'Assign ERLs', link: '/device-erls' },
      { label: 'Custom Fields', link: '/customfields' },
      { label: 'Desk Phones', link: '/deskphones' },
      { label: 'Intercom', link: '/intercom' },
      { label: 'Presense', link: '/presence' },
      { label: 'Automatic Location Updates', link: '/locationupdates' },
    ],
  },
  {
    label: 'Conversion',
    icon: IconTransform,
    initiallyOpened: false,
    links: [
      { label: 'Call Queue → Ring Group', link: '/convert-call-queues' },
      // { label: 'User → Limited Extensino', link: '/convert-users' },
    ],
  },
  {
    label: 'Groups',
    icon: IconSettings2,
    initiallyOpened: false,
    links: [
      { label: 'Push to Talk', link: '/pushtotalk' },
      { label: 'User Groups', link: '/usergroups' },
      { label: 'Call Monitoring', link: '/callmonitoring' },
      { label: 'Paging Groups', link: '/paginggroups' },
      { label: 'Auto Park Locations', link: '/auto-park-locations' },
      { label: 'Park Locations', link: '/parklocations' },
    ],
  },
];

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
    paddingBottom: 0,
  },

  header: {
    padding: theme.spacing.md,
    paddingTop: 0,
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    borderBottom: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
      }`,
  },

  links: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
  },

  linksInner: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },

  footer: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
    borderTop: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
      }`,
  },
}));


function Sidebar({ setColorTheme }: SidebarProps) {
  const { classes } = useStyles();
  const [links, setLinks] = useState<JSX.Element[]>(mockdata.map((item) => <LinksGroup {...item} key={item.label} />))
  const user = useAtomValue(userAtom)
  const [isShowingSignOutModal, setIsShowingSignOutModal] = useState(false)

  useEffect(() => {
    console.log('user changed')
    if (user.isAdmin) {
      setLinks([...adminLinks, ...mockdata].map((item) => <LinksGroup {...item} key={item.label} />))
    }
  }, [user])

  const handleSignOutButtonClick = () => {
    localStorage.removeItem('rc_access_token')
    localStorage.removeItem('rc_refresh_token')
    localStorage.removeItem('rc_token_expiry')
    let url = `${process.env.REACT_APP_AUTH_BASE}&client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_AUTH_REDIRECT}&state=create-ivr`
    window.location.replace(url)
  }

  return (
    <div className="navigation-bar">
      {/* <Modal open={isShowingSignOutModal} setOpen={setIsShowingSignOutModal} handleAccept={handleSignOutButtonClick} title='Sign out?' body='Do you want to sign out and be redirected to the login page?' rejectLabel='No, go back' acceptLabel='Yes, sign out' /> */}
      <Settings isShowing={isShowingSignOutModal} close={() => setIsShowingSignOutModal(false)} />

      <Navbar sx={{ position: 'fixed', zIndex: 1 }} width={{ sm: 250 }} p="md" className={classes.navbar}>
        <Navbar.Section className={classes.header}>
          <Group position="apart">
            {/* <Logo width={rem(120)} /> */}
            <Code sx={{ fontWeight: 700 }}>{process.env.REACT_APP_APP_NAME} {process.env.REACT_APP_VERSION}</Code>
          </Group>
        </Navbar.Section>

        <Navbar.Section grow className={classes.links} component={ScrollArea}>
          <div className={classes.linksInner}>{links}</div>
        </Navbar.Section>

        <Navbar.Section className={classes.footer}>
          <UserButton
            image="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
            name='RC Professional Services'
            email='2025'
            onClick={() => setIsShowingSignOutModal(true)}
          />
        </Navbar.Section>
      </Navbar>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

interface SidebarProps {
  setColorTheme: (theme: 'light' | 'dark') => void
}

export default Sidebar;