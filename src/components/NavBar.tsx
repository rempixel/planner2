import React, { FC, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { useApp, useUpdateApp } from '../providers';
import { BSIcon } from '.';

export const NavBar: FC = () => {
  const { navbarCollapsed } = useApp();
  const updateApp = useUpdateApp();

  const toggle = useCallback(() => {
    updateApp('navbarCollapsed', !navbarCollapsed);
  }, [navbarCollapsed, updateApp]);

  return (
    <Navbar className="bg-danger border-bottom" dark expand="xs">
      <NavbarBrand href="/">Planner</NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse navbar isOpen={navbarCollapsed}>
        <div className="ms-auto" />
        <Nav navbar id="navbar" pills>
          <NavbarButton
            href="https://github.com/ZenIsBestWolf/planner2"
            label={
              <>
                <BSIcon name="bi-braces" /> Code
              </>
            }
          />
          <NavbarButton destination="/courses" label="Courses" />
          <NavbarButton destination="/info" label="Info" />
          <NavbarButton destination="/times" label="Times" />
          <NavbarButton destination="/schedules" label="Schedules" />
        </Nav>
      </Collapse>
    </Navbar>
  );
};

interface NavbarButtonProps {
  readonly destination?: string;
  readonly label: ReactNode;
  readonly href?: string;
}

const NavbarButton: FC<NavbarButtonProps> = ({ destination, label, href }) => {
  const navigate = useNavigate();

  const navHandler = useCallback(
    (e: React.MouseEvent) => {
      if (destination) {
        e.preventDefault();

        void navigate(destination);
      }
    },
    [destination, navigate],
  );

  return (
    <NavItem>
      <NavLink onClick={navHandler} href={href ?? '#'}>
        {label}
      </NavLink>
    </NavItem>
  );
};
