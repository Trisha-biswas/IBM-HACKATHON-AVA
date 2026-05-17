import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tag,
  OverflowMenu,
  OverflowMenuItem,
  Modal,
  Loading,
} from '@carbon/react';
import { Add, Download, Document } from '@carbon/icons-react';
import axios from 'axios';
import './Dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/visa`
  : 'http://localhost:3001/api/visa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/dashboard`);
      setRequests(response.data.requests || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Country code to full name mapping
  const getCountryName = (code) => {
    const countryMap = {
      'IN': 'India',
      'US': 'United States',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'JP': 'Japan',
      'CN': 'China',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'KR': 'South Korea',
      'NL': 'Netherlands',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'BE': 'Belgium',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'IE': 'Ireland',
      'PT': 'Portugal',
      'GR': 'Greece',
      'PL': 'Poland',
      'CZ': 'Czech Republic',
      'HU': 'Hungary'
    };
    return countryMap[code] || code;
  };

  // Transform data for DataTable
  const rows = requests.map((request) => {
    // Extract from/to countries from travelers data
    const firstTraveler = request.travelers?.[0];
    const fromCountry = 'India'; // Default
    const toCountryCode = firstTraveler?.destination || 'N/A';
    const toCountry = getCountryName(toCountryCode);
    
    // Get traveler names
    const travelerNames = request.travelers
      ?.map(t => t.name)
      .filter(Boolean)
      .join(', ') || 'N/A';
    
    // Format created date
    const createdDate = request.createdAt
      ? new Date(request.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : 'N/A';

    // Get travel dates from first traveler's data
    const departureDate = firstTraveler?.travelerData?.departureDate || 'N/A';
    const returnDate = firstTraveler?.travelerData?.returnDate || 'N/A';
    const travelDates = `${departureDate} - ${returnDate}`;

    // Determine status
    const status = request.summary?.successful > 0 ? 'Complete' : 'Pending';

    return {
      id: request.requestId,
      travelers: travelerNames,
      from: fromCountry,
      to: toCountry,
      travelDates: travelDates,
      createdDate: createdDate,
      status: status,
      request: request, // Store full request for details
    };
  });

  // Filter rows based on search
  const filteredRows = rows.filter((row) => {
    const searchLower = searchValue.toLowerCase();
    return (
      row.travelers.toLowerCase().includes(searchLower) ||
      row.from.toLowerCase().includes(searchLower) ||
      row.to.toLowerCase().includes(searchLower) ||
      row.travelDates.toLowerCase().includes(searchLower) ||
      row.createdDate.toLowerCase().includes(searchLower)
    );
  });

  const headers = [
    { key: 'travelers', header: 'Travelers' },
    { key: 'from', header: 'From' },
    { key: 'to', header: 'To' },
    { key: 'travelDates', header: 'Travel Dates' },
    { key: 'createdDate', header: 'Created Date' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: '' },
  ];

  const handleViewDetails = (request) => {
    console.log(request,'request view details')
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleDownloadAll = async (request) => {
    // Collect all PDF URLs from all travelers
    const allFileUrls = [];
    
    request.travelers?.forEach(traveler => {
      if (traveler.files?.coverLetter) {
        allFileUrls.push(traveler.files.coverLetter);
      }
      if (traveler.files?.itinerary) {
        allFileUrls.push(traveler.files.itinerary);
      }
    });

    // Download each file with a small delay to prevent browser blocking
    for (let i = 0; i < allFileUrls.length; i++) {
      const fileUrl = allFileUrls[i];
      try {
        const response = await fetch(`http://localhost:3001${fileUrl}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileUrl.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Small delay between downloads to prevent browser blocking
        if (i < allFileUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error downloading file ${fileUrl}:`, error);
      }
    }
  };

  const handleDownloadFile = async (fileUrl) => {
    try {
      const response = await fetch(`http://localhost:3001${fileUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileUrl.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loading description="Loading dashboard..." withOverlay={false} />
      </div>
    );
  }

  console.log(requests,selectedRequest,'requests')

  return (
    <div className="dashboard-container">
      {/* Page Title */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Visa Application Packages</h1>
          <p className="page-description">
            Manage and download your AI-generated visa application documents' packages.
          </p>
        </div>
      </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Data Table */}
        <DataTable rows={filteredRows} headers={headers}>
          {({
            rows,
            headers,
            getHeaderProps,
            getRowProps,
            getTableProps,
            getTableContainerProps,
          }) => (
            <TableContainer
              {...getTableContainerProps()}
              className="table-container"
            >
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch
                    placeholder="Filter by country or dates"
                    onChange={(e) => setSearchValue(e.target.value)}
                    value={searchValue}
                  />
                  <Button
                    kind="primary"
                    renderIcon={Add}
                    onClick={() => navigate('/create')}
                  >
                    Create Visa Package
                  </Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        {...getHeaderProps({ header })}
                        key={header.key}
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map((cell) => {
                        if (cell.info.header === 'status') {
                          return (
                            <TableCell key={cell.id}>
                              <Tag
                                type={
                                  cell.value === 'Complete' ? 'green' : 'gray'
                                }
                              >
                                {cell.value}
                              </Tag>
                            </TableCell>
                          );
                        }
                        if (cell.info.header === 'actions') {
                          return (
                            <TableCell key={cell.id}>
                              <OverflowMenu flipped>
                                <OverflowMenuItem
                                  itemText="View Details"
                                  onClick={() =>
                                    handleViewDetails(row.id)
                                  }
                                />
                                <OverflowMenuItem
                                  itemText="Download All"
                                  onClick={() =>
                                    handleDownloadAll(
                                      requests.find(
                                        (r) => r.requestId === row.id
                                      )
                                    )
                                  }
                                />
                              </OverflowMenu>
                            </TableCell>
                          );
                        }
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>


        {/* Details Modal */}
        <Modal
          open={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          modalHeading="Application Details"
          primaryButtonText="Close"
          onRequestSubmit={() => setIsModalOpen(false)}
          size="lg"
          className="details-modal"
        >
          {selectedRequest && (() => {
            const request = requests.find((r) => r.requestId === selectedRequest);
            if (!request) return null;

            const documentCount = request.travelers?.reduce((count, t) => {
              return count + (t.files?.coverLetter ? 1 : 0) + (t.files?.itinerary ? 1 : 0);
            }, 0) || 0;

            return (
              <div className="modal-content">
                <div className="modal-info-row">
                  <span className="modal-info-label">Request ID:</span>
                  <span className="modal-info-value">VISA-{request.requestId}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">Destination:</span>
                  <span className="modal-info-value">{request.travelers?.[0]?.destination || 'N/A'}</span>
                </div>

                <h3 className="modal-section-title">Travelers</h3>
                <ul className="travelers-list">
                  {request.travelers?.map((traveler, index) => (
                    <li key={index}>{traveler.name}</li>
                  ))}
                </ul>

                <h3 className="modal-section-title">Documents Generated ({documentCount})</h3>
                
                <div className="documents-list">
                  {request.travelers?.map((traveler, index) => (
                    <React.Fragment key={index}>
                      {traveler.files?.coverLetter && (
                        <div className="document-item">
                          <div className="document-info">
                            <Document className="document-icon" size={20} />
                            <span className="document-name">{traveler.name} Cover Letter</span>
                          </div>
                          <Button
                            kind="ghost"
                            size="sm"
                            renderIcon={Download}
                            iconDescription="Download"
                            hasIconOnly
                            onClick={() => handleDownloadFile(traveler.files.coverLetter)}
                          />
                        </div>
                      )}
                      {traveler.files?.itinerary && (
                        <div className="document-item">
                          <div className="document-info">
                            <Document className="document-icon" size={20} />
                            <span className="document-name">{traveler.name} Itinerary</span>
                          </div>
                          <Button
                            kind="ghost"
                            size="sm"
                            renderIcon={Download}
                            iconDescription="Download"
                            hasIconOnly
                            onClick={() => handleDownloadFile(traveler.files.itinerary)}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })()}
        </Modal>
    </div>
  );
};

export default Dashboard;

// Made with Bob
