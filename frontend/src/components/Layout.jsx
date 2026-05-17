import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Header,
  HeaderName,
  Breadcrumb,
  BreadcrumbItem,
} from '@carbon/react';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine breadcrumb items based on current route
  const getBreadcrumbs = () => {
    const path = location.pathname;
    
    if (path === '/' || path === '/packages') {
      return [
        { label: 'Visa Application Packages', path: '/packages', isCurrentPage: true }
      ];
    }
    
    if (path === '/create') {
      return [
        { label: 'Visa Application Packages', path: '/packages', isCurrentPage: false },
        { label: 'Create Visa Package', path: '/create', isCurrentPage: true }
      ];
    }
    
    return [];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="layout-container">
      {/* Header */}
      <Header aria-label="Agentic VISA Assistant">
        <HeaderName prefix="">Agentic VISA Assistant</HeaderName>
      </Header>

      {/* Main Content */}
      <div className="layout-content" style={{marginTop : "2rem"}}>
        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <Breadcrumb noTrailingSlash>
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem
                key={index}
                href={crumb.path}
                isCurrentPage={crumb.isCurrentPage}
                onClick={(e) => {
                  e.preventDefault();
                  if (!crumb.isCurrentPage) {
                    navigate(crumb.path);
                  }
                }}
              >
                {crumb.label}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        )}

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
};

export default Layout;

// Made with Bob
